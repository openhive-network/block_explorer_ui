import moment from "moment";
import { formatCompact } from "@/utils/chartUtils";
import { CompareRow, Side, ValueFormat } from "./types";
import { winnerOf } from "./scoring";

const SUFFIX: Partial<Record<ValueFormat, string>> = {
  hp: " HP",
  hbd: " HBD",
  hive: " HIVE",
};

const formatMagnitude = (
  value: number,
  format: ValueFormat,
  locale: string,
  exact: boolean
): string => {
  const n = exact
    ? value.toLocaleString(locale, { maximumFractionDigits: 3 })
    : formatCompact(value, locale);
  return format === "usd" ? `$${n}` : `${n}${SUFFIX[format] ?? ""}`;
};

// Formats a raw comparable value for display. A pre-formatted `display` wins
// (used for categorical/text cells); null renders as an em dash.
export const formatCompareValue = (
  value: number | null,
  format: ValueFormat,
  locale: string,
  display?: string,
  exact = false
): string => {
  if (display !== undefined) return display;
  if (value === null || !isFinite(value)) return "—";
  switch (format) {
    case "usd":
    case "hp":
    case "hbd":
    case "hive":
    case "number":
      return formatMagnitude(value, format, locale, exact);
    case "reputation":
      return exact
        ? value.toLocaleString(locale, { maximumFractionDigits: 2 })
        : Math.round(value).toLocaleString(locale);
    case "rank":
      return `#${Math.round(value).toLocaleString(locale)}`;
    case "percent":
      return `${value.toLocaleString(locale, {
        maximumFractionDigits: exact ? 3 : 1,
      })}%`;
    case "date":
      // "an hour ago" on both sides hides a real difference — fall back to the
      // absolute timestamp (to the second, matching the API) so the caret has
      // something visible to point at.
      return exact
        ? moment(value).locale(locale).format("L LTS")
        : moment(value).locale(locale).fromNow();
    case "text":
      return String(value);
    default:
      return formatMagnitude(value, format, locale, exact);
  }
};

// Single source of cell text for both the table and the export, so the two can
// never diverge.
export const compareCellText = (
  row: CompareRow,
  side: Side,
  locale: string,
  t: (k: string) => string,
  exact = false
): string => {
  if (row.unavailable) return t("compare.unavailable");
  const displayKey = side === "a" ? row.aDisplayKey : row.bDisplayKey;
  if (displayKey) return t(displayKey);
  return formatCompareValue(
    side === "a" ? row.aValue : row.bValue,
    row.format,
    locale,
    side === "a" ? row.aDisplay : row.bDisplay,
    exact
  );
};

// Rounding can print two different values identically ("13" for both 12.6 and
// 12.7). Harmless on a tie, but on a row the caret declares a winner on it reads
// as a bug — so there, spell both sides out in full instead.
export const compareCellPair = (
  row: CompareRow,
  locale: string,
  t: (k: string) => string
): { a: string; b: string } => {
  const a = compareCellText(row, "a", locale, t);
  const b = compareCellText(row, "b", locale, t);
  const winner = winnerOf(row);
  const decisive = winner === "a" || winner === "b";
  const collides =
    a === b &&
    decisive &&
    !row.aDisplay &&
    !row.bDisplay &&
    !row.aDisplayKey &&
    !row.bDisplayKey;
  if (!collides) return { a, b };
  return {
    a: compareCellText(row, "a", locale, t, true),
    b: compareCellText(row, "b", locale, t, true),
  };
};

export const compareSecondaryText = (
  row: CompareRow,
  side: Side,
  locale: string
): string | null => {
  if (row.unavailable) return null;
  const value = side === "a" ? row.aSecondary : row.bSecondary;
  if (value === undefined || value === null) return null;
  return formatCompareValue(value, row.secondaryFormat ?? row.format, locale);
};
