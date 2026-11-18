import Hive from "@/types/Hive";
import {
  buildHbdHealth,
  hbdLimitsAt,
  treasuryGranularity,
  HF24_TIME,
} from "@/utils/hbdHealth";

// Real mainnet rows from /hafbe-api/hbd/status and
// /balance-api/accounts/hive.fund/aggregated-history (monthly).
const status = (
  period: string,
  hbd: string,
  hive: string,
  virtual: string,
  gross: number,
  rate: number
): Hive.HbdStatusResponse => ({
  period,
  hbd_supply: hbd,
  hive_supply: hive,
  virtual_supply: virtual,
  debt_ratio_gross_pct: gross,
  hbd_interest_rate: rate,
});

const treasury = (
  date: string,
  balance: string
): Hive.AccountAggregatedBalanceHistoryResponse =>
  ({
    date,
    balance: { balance, savings_balance: "0" },
  }) as unknown as Hive.AccountAggregatedBalanceHistoryResponse;

const STATUS = [
  status(
    "2020-10-01T00:00:00",
    "4614095450",
    "370816152700",
    "400393687635",
    7.387,
    0
  ),
  status(
    "2021-01-01T00:00:00",
    "4573559970",
    "379394590471",
    "419868572506",
    9.64,
    0
  ),
  status(
    "2023-01-01T00:00:00",
    "28363321295",
    "395066736770",
    "504577629800",
    21.703,
    2000
  ),
  status(
    "2026-01-01T00:00:00",
    "34226440519",
    "509149527937",
    "851413933127",
    40.2,
    1500
  ),
];
const TREASURY = [
  treasury("2020-10-01T00:00:00", "0"),
  treasury("2021-01-01T00:00:00", "814104950"),
  treasury("2023-01-01T00:00:00", "19263044392"),
  treasury("2026-01-01T00:00:00", "23323234464"),
];

describe("buildHbdHealth", () => {
  const points = buildHbdHealth(STATUS, TREASURY);

  it("matches the treasury-adjusted ratios worked out in hafbe #147 and BEUI #826", () => {
    // 2021-01: 8.06%, 2023-01: 8.17% (#147: 8.2%), 2026-01: 17.64% (#147: 17.6%)
    expect(points[1].protocolPct).toBeCloseTo(8.06, 2);
    expect(points[2].protocolPct).toBeCloseTo(8.17, 2);
    expect(points[3].protocolPct).toBeCloseTo(17.64, 2);
  });

  it("keeps the served gross share and the treasury share of HBD", () => {
    expect(points[3].grossPct).toBe(40.2);
    expect(points[1].treasurySharePct).toBeCloseTo(17.8, 1);
    expect(points[2].treasurySharePct).toBeCloseTo(67.9, 1);
  });

  it("converts units: milli-HBD to HBD, basis points to percent", () => {
    expect(points[2].hbdSupply).toBe(28363321.295);
    expect(points[2].treasuryHbd).toBe(19263044.392);
    expect(points[2].interestRatePct).toBe(20);
  });

  it("derives the median-feed price from the supplies", () => {
    // 2026-01: (851413933127 - 509149527937) / 34226440519 HIVE per HBD
    expect(points[3].priceHivePerHbd).toBeCloseTo(10, 6);
  });

  it("uses the gross share before HF24, when the treasury was not excluded", () => {
    expect(Date.parse("2020-10-01T00:00:00Z")).toBeLessThan(HF24_TIME);
    expect(points[0].protocolPct).toBe(7.387);
    // Even without treasury data.
    expect(buildHbdHealth([STATUS[0]], [])[0].protocolPct).toBe(7.387);
  });

  it("leaves the protocol ratio empty when the treasury balance is missing", () => {
    const [p] = buildHbdHealth([STATUS[3]], undefined);
    expect(p.protocolPct).toBeNull();
    expect(p.treasurySharePct).toBeNull();
    expect(p.grossPct).toBe(40.2);
  });

  it('joins the two "now" rows, sampled a few seconds apart', () => {
    const now = buildHbdHealth(
      [STATUS[2], { ...STATUS[3], period: "2026-11-18T17:36:35.316405" }],
      [TREASURY[2], treasury("2026-11-18T17:36:42.026706", "23323234464")]
    );
    expect(now[1].protocolPct).toBeCloseTo(17.64, 2);
  });

  it("does not join a midnight boundary row to the other route's live row", () => {
    const [, last] = buildHbdHealth(
      [STATUS[2], STATUS[3]],
      [TREASURY[2], treasury("2026-11-18T17:36:42.026706", "1")]
    );
    expect(last.protocolPct).toBeNull();
  });

  it("returns nothing for no rows", () => {
    expect(buildHbdHealth(undefined, TREASURY)).toEqual([]);
    expect(buildHbdHealth([], TREASURY)).toEqual([]);
  });
});

describe("treasuryGranularity", () => {
  it("reads weekly from daily treasury rows (balance-api has no weekly)", () => {
    expect(treasuryGranularity("weekly")).toBe("daily");
    expect(treasuryGranularity("monthly")).toBe("monthly");
    expect(treasuryGranularity("daily")).toBe("daily");
    expect(treasuryGranularity("yearly")).toBe("yearly");
  });
});

describe("hbdLimitsAt", () => {
  // hived config.hpp: HIVE_HBD_STOP_PERCENT_HF14/HF20/HF26 and
  // HIVE_HBD_HARD_LIMIT_PRE_HF26 / HIVE_HBD_HARD_LIMIT.
  it("follows the hardforks that changed the print stop and haircut", () => {
    expect(hbdLimitsAt(Date.parse("2016-06-01T00:00:00Z"))).toBeNull();
    expect(hbdLimitsAt(Date.parse("2017-01-01T00:00:00Z"))).toMatchObject({
      printStopPct: 5,
      haircutPct: 10,
    });
    expect(hbdLimitsAt(Date.parse("2021-01-01T00:00:00Z"))).toMatchObject({
      printStopPct: 10,
      haircutPct: 10,
    });
    expect(hbdLimitsAt(Date.parse("2022-10-11T11:59:59Z"))).toMatchObject({
      printStopPct: 10,
    });
    expect(hbdLimitsAt(Date.parse("2022-10-11T12:00:00Z"))).toMatchObject({
      printStopPct: 20,
      haircutPct: 30,
    });
  });

  it("puts the limits in force on each point", () => {
    const [p2021, , p2026] = buildHbdHealth(
      [STATUS[1], STATUS[2], STATUS[3]],
      TREASURY
    );
    expect([p2021.printStopPct, p2021.haircutPct]).toEqual([10, 10]);
    expect([p2026.printStopPct, p2026.haircutPct]).toEqual([20, 30]);
  });
});
