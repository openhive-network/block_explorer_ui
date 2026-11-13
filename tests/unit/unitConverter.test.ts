import Hive from "@/types/Hive";
import {
  amountForQuery,
  amountFromQuery,
  convertAmount,
  formatAmount,
  hbdPerHive,
  parseAmount,
  toConverterRates,
} from "@/utils/unitConverter";

const HIVE = "@@000000021";
const HBD = "@@000000013";
const VESTS = "@@000000037";

// Chain figures quoted in #806, plus a real market ticker price.
const FUND = { amount: "216388600798", precision: 3, nai: HIVE };
const SHARES = { amount: "348297539165780000", precision: 6, nai: VESTS };
const FEED: Hive.PriceFeed = {
  base: { amount: "43", precision: 3, nai: HBD },
  quote: { amount: "1000", precision: 3, nai: HIVE },
};

const rates = toConverterRates(FUND, SHARES, FEED, "0.04311994113318617");

describe("toConverterRates", () => {
  it("reads the VESTS ratio, the feed and the market price", () => {
    expect(rates.hivePerVests).toBeCloseTo(216388600.798 / 348297539165.78, 15);
    expect(rates.feedHbdPerHive).toBeCloseTo(0.043, 9);
    expect(rates.marketHbdPerHive).toBeCloseTo(0.04312, 5);
  });

  it("reads a feed whose sides come the other way round", () => {
    expect(hbdPerHive({ base: FEED.quote, quote: FEED.base })).toBeCloseTo(
      0.043,
      9
    );
  });

  it("drops a missing or unreadable market price", () => {
    expect(toConverterRates(FUND, SHARES, FEED, null).marketHbdPerHive).toBe(
      null
    );
    expect(toConverterRates(FUND, SHARES, FEED, "x").marketHbdPerHive).toBe(
      null
    );
  });
});

describe("convertAmount", () => {
  it("converts HP to VESTS and HBD", () => {
    const out = convertAmount("hp", 1000, rates)!;
    expect(out.hp).toBe(1000);
    expect(out.vests).toBeCloseTo(1000 / rates.hivePerVests, 3);
    expect(out.hbd).toBeCloseTo(43, 9);
  });

  it("round-trips from VESTS and from HBD", () => {
    const fromVests = convertAmount("vests", 1_000_000, rates)!;
    expect(fromVests.hp).toBeCloseTo(621.275, 3);
    const fromHbd = convertAmount("hbd", fromVests.hbd, rates)!;
    expect(fromHbd.vests).toBeCloseTo(1_000_000, 4);
  });

  it("refuses to convert without rates", () => {
    expect(convertAmount("hp", 1, { ...rates, feedHbdPerHive: 0 })).toBeNull();
  });
});

describe("parseAmount", () => {
  it("reads each locale's separators", () => {
    expect(parseAmount("1,234.5", "en")).toBe(1234.5);
    expect(parseAmount("1.234,5", "de")).toBe(1234.5);
    expect(parseAmount("1 234,5", "fr")).toBe(1234.5);
  });

  it("reads Arabic-Indic digits", () => {
    const typed = formatAmount(1234.5, "hp", "ar");
    expect(parseAmount(typed, "ar")).toBe(1234.5);
  });

  it("round-trips its own formatting", () => {
    for (const locale of ["en", "de", "fr", "ja", "pl", "ar"]) {
      const shown = formatAmount(1234567.123456, "vests", locale);
      expect(parseAmount(shown, locale)).toBe(1234567.123456);
    }
  });

  it("reads a lone separator not followed by three digits as the decimal point", () => {
    // Phone keypads offer "." whatever the language.
    expect(parseAmount("1.5", "de")).toBe(1.5);
    expect(parseAmount("1,5", "en")).toBe(1.5);
    expect(parseAmount(".5", "en")).toBe(0.5);
    // Three digits after the locale's own group separator: thousands.
    expect(parseAmount("1.500", "de")).toBe(1500);
    expect(parseAmount("1,500", "en")).toBe(1500);
    expect(parseAmount("1.500", "en")).toBe(1.5);
    // French groups with spaces, so a "." is never a thousands separator.
    expect(parseAmount("1.500", "fr")).toBe(1.5);
  });

  it("rejects malformed grouping", () => {
    expect(parseAmount("1,2,3", "en")).toBeNull();
    expect(parseAmount("1.2.3", "de")).toBeNull();
    expect(parseAmount("1,234.5.6", "en")).toBeNull();
    expect(parseAmount("12,34.5", "en")).toBeNull();
  });

  it("rejects amounts beyond any real balance", () => {
    expect(parseAmount("10000000000000000", "en")).toBeNull();
  });

  it("rejects empty, negative and non-numeric entries", () => {
    expect(parseAmount("", "en")).toBeNull();
    expect(parseAmount("  ", "en")).toBeNull();
    expect(parseAmount("-5", "en")).toBeNull();
    expect(parseAmount("abc", "en")).toBeNull();
    expect(parseAmount(".", "en")).toBeNull();
  });
});

describe("amountForQuery", () => {
  it("writes plain decimals, never exponent notation", () => {
    expect(amountForQuery(1e-7, "hp")).toBe("0");
    expect(amountForQuery(1e-7, "vests")).toBe("0");
    expect(amountForQuery(0.0000015, "vests")).toBe("0.000002");
    expect(amountForQuery(1234.5, "hp")).toBe("1234.5");
    expect(amountForQuery(100, "hbd")).toBe("100");
    expect(amountForQuery(1e15, "vests")).toBe("1000000000000000");
  });

  it("round-trips through amountFromQuery", () => {
    const written = amountForQuery(1234.5678, "hp");
    expect(amountFromQuery({ hp: written })).toEqual({
      unit: "hp",
      value: 1234.568,
    });
  });
});

describe("amountFromQuery", () => {
  it("reads one plain amount from the URL", () => {
    expect(amountFromQuery({ hp: "100" })).toEqual({ unit: "hp", value: 100 });
    expect(amountFromQuery({ vests: "0.5" })).toEqual({
      unit: "vests",
      value: 0.5,
    });
  });

  it("ignores junk", () => {
    expect(amountFromQuery({})).toBeNull();
    expect(amountFromQuery({ hp: "-1" })).toBeNull();
    expect(amountFromQuery({ hbd: "1e9" })).toBeNull();
    expect(amountFromQuery({ usd: "5" })).toBeNull();
  });
});
