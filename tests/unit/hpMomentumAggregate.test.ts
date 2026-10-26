import { aggregateVestingBuckets } from "@/components/home/hpMomentumUtils";

// The module also exports hooks; their providers are not needed here.
jest.mock("@/contexts/SettingsContext", () => ({ useSettings: jest.fn() }));
jest.mock("@/contexts/HiveChainContext", () => ({
  useHiveChainContext: jest.fn(),
}));
jest.mock("@/contexts/HeadBlockContext", () => ({
  useHeadBlockNumber: jest.fn(),
}));
jest.mock("@/hooks/api/homePage/useDynamicGlobal", () => jest.fn());

const hive = (amount: string) => ({ nai: "@@000000021", amount, precision: 3 });
const vests = (amount: string) => ({
  nai: "@@000000037",
  amount,
  precision: 6,
});
const supplyToNumber = (supply: any) =>
  supply ? Number(supply.amount) / 10 ** supply.precision : 0;
const ratios = { hivePerVests: 0.0006, vestsPerHive: 1 / 0.0006 };

// arcange on 2026-10-13: the weekly payment is routed to another account, so
// the API reports no HIVE for it.
const routedFill = {
  date: "2026-10-13",
  power_up_hive: hive("0"),
  power_up_count: 0,
  power_down_init_vests: vests("0"),
  power_down_init_count: 0,
  power_down_fill_hive: hive("0"),
  power_down_fill_vests: vests("68625462598499"),
  power_down_fill_count: 1,
} as any;

// An ordinary payment to the account itself: the API reports the HIVE it was
// paid at the time, which must win over today's rate.
const ownFill = {
  ...routedFill,
  power_down_fill_hive: hive("30000000"),
  power_down_fill_vests: vests("68625462598499"),
};

describe("aggregateVestingBuckets", () => {
  it("values an ordinary power down at the HIVE paid out", () => {
    const { totals } = aggregateVestingBuckets({
      buckets: [ownFill],
      unit: "hp",
      supplyToNumber,
      ratios,
    });
    expect(totals.downFill).toBeCloseTo(30000, 6);
  });

  it("counts a routed power down by the VESTS that left", () => {
    const { totals, chartData } = aggregateVestingBuckets({
      buckets: [routedFill],
      unit: "hp",
      supplyToNumber,
      ratios,
    });
    expect(totals.downFill).toBeCloseTo(68625462.598499 * 0.0006, 6);
    expect(totals.net).toBeCloseTo(-68625462.598499 * 0.0006, 6);
    expect(chartData[0].power_down_fill).toBeCloseTo(totals.downFill, 6);
  });

  it("shows the raw VESTS in VESTS mode", () => {
    const { totals } = aggregateVestingBuckets({
      buckets: [routedFill],
      unit: "vests",
      supplyToNumber,
      ratios,
    });
    expect(totals.downFill).toBeCloseTo(68625462.598499, 6);
  });
});
