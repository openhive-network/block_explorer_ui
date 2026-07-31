import { naiAssetToFloat, formatNaiAsset } from "@/utils/Calculations";
import { convertToUTCDate } from "@/utils/TimeUtils";

const asset = (nai: string, amount: string, precision: number) => ({
  nai,
  amount,
  precision,
});

const HBD = "@@000000013";
const HIVE = "@@000000021";
const VESTS = "@@000000037";

describe("naiAssetToFloat — precision", () => {
  it("HBD (precision 3)", () => {
    expect(naiAssetToFloat(asset(HBD, "24113", 3))).toBeCloseTo(24.113, 6);
  });
  it("VESTS (precision 6)", () => {
    expect(naiAssetToFloat(asset(VESTS, "1234567", 6))).toBeCloseTo(
      1.234567,
      9
    );
  });
  it("undefined → 0", () => {
    expect(naiAssetToFloat(undefined)).toBe(0);
  });
  it("non-numeric amount → 0 (NaN guard)", () => {
    expect(naiAssetToFloat(asset(HBD, "not-a-number", 3))).toBe(0);
  });
});

describe("formatNaiAsset — symbol + precision", () => {
  it("HBD keeps 3 decimals + symbol", () => {
    expect(formatNaiAsset(asset(HBD, "24113", 3))).toMatch(/^24[.,]113 HBD$/);
  });
  it("HIVE symbol", () => {
    expect(formatNaiAsset(asset(HIVE, "5000", 3))).toMatch(/^5[.,]000 HIVE$/);
  });
  it("VESTS keeps 6 decimals", () => {
    expect(formatNaiAsset(asset(VESTS, "1234567", 6))).toMatch(
      /^1[.,]234567 VESTS$/
    );
  });
});

describe("convertToUTCDate — zone-less cashout parsing", () => {
  it("treats a zone-less ISO string as UTC (not local)", () => {
    expect(convertToUTCDate("2026-07-28T12:00:00").getTime()).toBe(
      Date.UTC(2026, 6, 28, 12, 0, 0)
    );
  });
  it("respects an explicit Z marker", () => {
    expect(convertToUTCDate("2026-07-28T12:00:00Z").getTime()).toBe(
      Date.UTC(2026, 6, 28, 12, 0, 0)
    );
  });
});
