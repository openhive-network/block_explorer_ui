import Hive from "@/types/Hive";
import { naiAssetToFloat } from "@/utils/Calculations";

type NaiAsset = Hive.Supply;

// VESTS, HP and HBD for the Tools hub converter. HP is a HIVE amount, so one
// VESTS-per-HIVE ratio and one HBD-per-HIVE price cover every direction.

export type ConverterUnit = "vests" | "hp" | "hbd";

export const CONVERTER_UNITS: ConverterUnit[] = ["vests", "hp", "hbd"];

// Chain precision of each unit, used for display.
export const UNIT_DECIMALS: Record<ConverterUnit, number> = {
  vests: 6,
  hp: 3,
  hbd: 3,
};

const HIVE_NAI = "@@000000021";
const HBD_NAI = "@@000000013";

export interface ConverterRates {
  // HIVE backing one VESTS: total_vesting_fund_hive / total_vesting_shares.
  hivePerVests: number;
  // The witness price feed (median of witness-reported prices).
  feedHbdPerHive: number;
  // Last trade on the internal HIVE/HBD market; null when unavailable.
  marketHbdPerHive: number | null;
}

// HBD per HIVE from a price whose sides may come either way round.
export const hbdPerHive = (price: Hive.PriceFeed): number => {
  const { base, quote } = price;
  const hbd = base.nai === HBD_NAI ? base : quote;
  const hive = base.nai === HIVE_NAI ? base : quote;
  const hiveAmount = naiAssetToFloat(hive);
  return hiveAmount > 0 ? naiAssetToFloat(hbd) / hiveAmount : 0;
};

export const toConverterRates = (
  totalVestingFundHive: NaiAsset,
  totalVestingShares: NaiAsset,
  feed: Hive.PriceFeed,
  marketLatest: string | null
): ConverterRates => {
  const shares = naiAssetToFloat(totalVestingShares);
  const market = marketLatest == null ? NaN : Number(marketLatest);
  return {
    hivePerVests:
      shares > 0 ? naiAssetToFloat(totalVestingFundHive) / shares : 0,
    feedHbdPerHive: hbdPerHive(feed),
    marketHbdPerHive: Number.isFinite(market) && market > 0 ? market : null,
  };
};

export type ConvertedAmounts = Record<ConverterUnit, number>;

export const convertAmount = (
  unit: ConverterUnit,
  value: number,
  rates: ConverterRates
): ConvertedAmounts | null => {
  const { hivePerVests, feedHbdPerHive } = rates;
  if (!(hivePerVests > 0) || !(feedHbdPerHive > 0)) return null;
  const hp =
    unit === "hp"
      ? value
      : unit === "vests"
        ? value * hivePerVests
        : value / feedHbdPerHive;
  return {
    vests: unit === "vests" ? value : hp / hivePerVests,
    hp,
    hbd: unit === "hbd" ? value : hp * feedHbdPerHive,
  };
};

// The locale's separators and digits, read from Intl rather than assumed:
// "1.234,5" and "1,234.5" are the same number.
interface Separators {
  group: string;
  decimal: string;
  toAscii: Record<string, string>;
}

const separatorCache = new Map<string, Separators>();

const separators = (locale: string): Separators => {
  const cached = separatorCache.get(locale);
  if (cached) return cached;
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  const digits = new Intl.NumberFormat(locale, { useGrouping: false })
    .format(1234567890)
    .split("");
  const toAscii: Record<string, string> = {};
  "1234567890".split("").forEach((ascii, i) => {
    if (digits[i] && digits[i] !== ascii) toAscii[digits[i]] = ascii;
  });
  const found: Separators = {
    group: parts.find((p) => p.type === "group")?.value ?? ",",
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
    toAscii,
  };
  separatorCache.set(locale, found);
  return found;
};

// Above every real balance (all VESTS ever: ~3.5e11), and small enough that
// the URL never needs exponent notation.
export const MAX_AMOUNT = 1e15;

// Thousands groups after the first: exactly three digits each.
const validGroups = (groups: string[]) =>
  groups[0].length >= 1 &&
  groups[0].length <= 3 &&
  groups.slice(1).every((g) => g.length === 3);

/**
 * Read a typed amount. Phone keypads often offer "." whatever the language,
 * so a separator only counts as a thousands separator when it is the
 * locale's and is followed by groups of exactly three digits; otherwise a
 * single "." or "," is the decimal point. Returns null for an empty or
 * unreadable entry, including negatives: no balance is negative.
 */
export const parseAmount = (text: string, locale: string): number | null => {
  const { group, decimal, toAscii } = separators(locale);
  let s = text.trim();
  if (!s) return null;
  for (const [local, ascii] of Object.entries(toAscii)) {
    s = s.split(local).join(ascii);
  }
  // Spaces group digits in fr/pl; they never mean anything else.
  s = s.replace(/[\s\u00a0\u202f\u2009]/g, "");
  // Separators that are neither "." nor "," (Arabic) map onto them.
  const localeGroup = group.trim() ? group : "";
  if (localeGroup && localeGroup !== "." && localeGroup !== ",")
    s = s.split(localeGroup).join(",");
  if (decimal !== "." && decimal !== ",") s = s.split(decimal).join(".");
  // Space-grouping locales (fr, pl) have no character that groups thousands.
  const groupChar = localeGroup === "." ? "." : localeGroup ? "," : null;
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const dots = s.split(".").length - 1;
  const commas = s.split(",").length - 1;
  let integer = s;
  let fraction = "";
  if (dots && commas) {
    // Both: the last one is the decimal point, the other groups thousands.
    const decimalChar = s.lastIndexOf(".") > s.lastIndexOf(",") ? "." : ",";
    const sepChar = decimalChar === "." ? "," : ".";
    if (s.split(decimalChar).length - 1 !== 1) return null;
    [integer, fraction] = s.split(decimalChar);
    if (!validGroups(integer.split(sepChar))) return null;
    integer = integer.split(sepChar).join("");
  } else if (dots || commas) {
    const char = dots ? "." : ",";
    const pieces = s.split(char);
    const asGroups = char === groupChar && validGroups(pieces);
    if (pieces.length > 2 && !asGroups) return null;
    if (asGroups) integer = pieces.join("");
    else [integer, fraction] = pieces;
  }
  if (!/^\d*$/.test(integer) || !/^\d*$/.test(fraction)) return null;
  const value = Number(`${integer || "0"}.${fraction || "0"}`);
  return Number.isFinite(value) && value <= MAX_AMOUNT ? value : null;
};

export const formatAmount = (
  value: number,
  unit: ConverterUnit,
  locale: string
): string =>
  value.toLocaleString(locale, {
    maximumFractionDigits: UNIT_DECIMALS[unit],
  });

// The amount as the URL carries it: plain ASCII at the unit's precision,
// never exponent notation (String(1e-7) is "1e-7").
export const amountForQuery = (value: number, unit: ConverterUnit): string =>
  value.toFixed(UNIT_DECIMALS[unit]).replace(/\.?0+$/, "") || "0";

// The URL keeps one plain ASCII amount, e.g. ?hp=100, so a link reads the
// same in every language.
export const amountFromQuery = (
  query: Record<string, string | string[] | undefined>
): { unit: ConverterUnit; value: number } | null => {
  for (const unit of CONVERTER_UNITS) {
    const raw = query[unit];
    const text = Array.isArray(raw) ? raw[0] : raw;
    if (text == null || !/^\d*\.?\d+$|^\d+\.?$/.test(text)) continue;
    const value = Number(text);
    if (Number.isFinite(value)) return { unit, value };
  }
  return null;
};
