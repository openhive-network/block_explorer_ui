import { buildLorenzCurve } from "@/components/home/LorenzConcentrationChart";
import Hive from "@/types/Hive";

const bucket = (
  account_count: number,
  total_hp: number
): Hive.NetworkHpDistributionResponse =>
  ({
    bucket: `${total_hp}`,
    account_count,
    total_hp,
    pct_accounts: 0,
    pct_hp: 0,
  }) as Hive.NetworkHpDistributionResponse;

describe("buildLorenzCurve", () => {
  it("returns an empty array for no buckets", () => {
    expect(buildLorenzCurve([])).toEqual([]);
    expect(
      buildLorenzCurve(
        undefined as unknown as Hive.NetworkHpDistributionResponse[]
      )
    ).toEqual([]);
  });

  it("prepends a (0,0) anchor and ends at (100,100)", () => {
    const pts = buildLorenzCurve([bucket(90, 1), bucket(10, 99)]);
    expect(pts[0]).toEqual({ cumAccounts: 0, cumHp: 0 });
    const last = pts[pts.length - 1];
    expect(last.cumAccounts).toBeCloseTo(100, 6);
    expect(last.cumHp).toBeCloseTo(100, 6);
  });

  it("orders poorest -> richest so the curve stays below the diagonal", () => {
    const pts = buildLorenzCurve([bucket(10, 99), bucket(90, 1)]);
    const mid = pts[1];
    expect(mid.cumAccounts).toBeCloseTo(90, 6);
    expect(mid.cumHp).toBeCloseTo(1, 6);
    expect(mid.cumHp).toBeLessThan(mid.cumAccounts);
  });

  it("normalises to totals even when rows carry rounding drift", () => {
    const pts = buildLorenzCurve([bucket(1, 1), bucket(1, 1), bucket(1, 1)]);
    const last = pts[pts.length - 1];
    expect(last.cumAccounts).toBeCloseTo(100, 6);
    expect(last.cumHp).toBeCloseTo(100, 6);
    expect(pts).toHaveLength(4);
  });

  it("returns empty when totals are non-positive", () => {
    expect(buildLorenzCurve([bucket(0, 0)])).toEqual([]);
  });

  it("orders by per-account mean HP, not aggregate total_hp", () => {
    // richBucket: 10 accounts, 100 HP  -> mean 10 (richer per account, small aggregate)
    // poorBucket: 100 accounts, 300 HP -> mean 3  (poorer per account, LARGER aggregate)
    // Sorting by total_hp (300 > 100) would wrongly place the rich bucket first;
    // the Lorenz curve must order by mean, so the poor/populous bucket comes first.
    const richBucket = bucket(10, 100);
    const poorBucket = bucket(100, 300);
    const pts = buildLorenzCurve([richBucket, poorBucket]);

    // First segment is the poorer-by-mean (populous) bucket.
    const first = pts[1];
    expect(first.cumAccounts).toBeCloseTo((100 / 110) * 100, 6); // ~90.9%
    expect(first.cumHp).toBeCloseTo((300 / 400) * 100, 6); // 75%

    // Defining property: the curve stays at or below the diagonal everywhere.
    // The old total_hp sort would put the rich bucket first (9.1% accounts /
    // 25% HP), breaking this.
    pts.forEach((p) =>
      expect(p.cumHp).toBeLessThanOrEqual(p.cumAccounts + 1e-9)
    );
  });
});
