import {
  conversionStartedAt,
  toOpenOrderRows,
  ordersSelling,
  sortByMaturity,
  summarizeOrders,
  summarizeConversions,
} from "@/utils/accountPendingItems";
import Hive from "@/types/Hive";

const hbd = (amount: string): Hive.Supply => ({
  amount,
  precision: 3,
  nai: "@@000000013",
});
const hive = (amount: string): Hive.Supply => ({
  amount,
  precision: 3,
  nai: "@@000000021",
});

// A fixed "now" before every fixture date, so the tests don't depend on the clock.
const BEFORE_ALL = Date.parse("2026-09-01T00:00:00Z");

const order = (overrides: Partial<Hive.OpenOrder>): Hive.OpenOrder => ({
  id: 1,
  created: "2026-08-24T14:34:03",
  expiration: "2026-09-20T14:33:50",
  seller: "mapac",
  orderid: 1787582030,
  for_sale: 35288,
  sell_price: { base: hbd("35288"), quote: hive("880000") },
  ...overrides,
});

describe("toOpenOrderRows", () => {
  it("reads an HBD-selling order as the operations page states it", () => {
    const [row] = toOpenOrderRows([order({})]);

    expect(row.orderId).toBe(1787582030);
    expect(row.sellSymbol).toBe("HBD");
    expect(row.forSale).toEqual({
      amount: "35288",
      precision: 3,
      nai: "@@000000013",
    });
    expect(row.receiveAtLeast).toEqual({
      amount: "880000",
      precision: 3,
      nai: "@@000000021",
    });
    expect(row.rate).toBeCloseTo(35.288 / 880, 10);
  });

  it("reads a HIVE-selling order as the operations page states it", () => {
    const [row] = toOpenOrderRows([
      order({
        for_sale: 100000,
        sell_price: { base: hive("100000"), quote: hbd("4000") },
      }),
    ]);

    expect(row.sellSymbol).toBe("HIVE");
    expect(row.forSale.nai).toBe("@@000000021");
    expect(row.receiveAtLeast).toEqual({
      amount: "4000",
      precision: 3,
      nai: "@@000000013",
    });
    expect(row.rate).toBeCloseTo(0.04, 10);
  });

  it("shows the remaining amount of a partly filled order, not the original offer", () => {
    const [row] = toOpenOrderRows([
      order({
        for_sale: 25000,
        sell_price: { base: hive("100000"), quote: hbd("4000") },
      }),
    ]);

    expect(row.forSale.amount).toBe("25000");
    expect(row.receiveAtLeast.amount).toBe("1000");
  });

  it("rounds a partly filled order's minimum receive down, as the chain does", () => {
    const [row] = toOpenOrderRows([
      order({
        for_sale: 33333,
        sell_price: { base: hive("100000"), quote: hbd("4000") },
      }),
    ]);

    expect(row.receiveAtLeast.amount).toBe("1333");
  });

  it("lists the soonest-expiring order first", () => {
    const rows = toOpenOrderRows([
      order({ orderid: 1, expiration: "2026-09-30T00:00:00" }),
      order({ orderid: 2, expiration: "2026-09-18T00:00:00" }),
    ]);

    expect(rows.map((r) => r.orderId)).toEqual([2, 1]);
  });
});

describe("ordersSelling", () => {
  it("keeps only the orders selling the requested asset", () => {
    const rows = toOpenOrderRows([
      order({ orderid: 1 }),
      order({
        orderid: 2,
        sell_price: { base: hive("100000"), quote: hbd("4000") },
      }),
    ]);

    expect(ordersSelling(rows, "HIVE").map((r) => r.orderId)).toEqual([2]);
    expect(ordersSelling(rows, "HBD").map((r) => r.orderId)).toEqual([1]);
  });
});

describe("summarizeOrders", () => {
  it("totals the amount for sale, spans the price range and finds the next expiry", () => {
    const rows = toOpenOrderRows([
      order({
        orderid: 1,
        for_sale: 400000,
        sell_price: { base: hive("400000"), quote: hbd("24800") },
        expiration: "2026-10-12T00:00:00",
      }),
      order({
        orderid: 2,
        for_sale: 100500,
        sell_price: { base: hive("100500"), quote: hbd("5628") },
        expiration: "2026-09-20T00:00:00",
      }),
    ]);

    const summary = summarizeOrders(rows, BEFORE_ALL);

    expect(summary.count).toBe(2);
    expect(summary.totalForSale).toEqual({
      amount: "500500",
      precision: 3,
      nai: "@@000000021",
    });
    expect(summary.minRate).toBeCloseTo(0.056, 10);
    expect(summary.maxRate).toBeCloseTo(0.062, 10);
    expect(summary.nextExpiry?.toISOString()).toBe("2026-09-20T00:00:00.000Z");
  });

  it("skips an expiry that has already passed when naming the next one", () => {
    const rows = toOpenOrderRows([
      order({ orderid: 1, expiration: "2026-09-10T00:00:00" }),
      order({ orderid: 2, expiration: "2026-09-25T00:00:00" }),
    ]);

    const summary = summarizeOrders(rows, Date.parse("2026-09-18T00:00:00Z"));

    expect(summary.nextExpiry?.toISOString()).toBe("2026-09-25T00:00:00.000Z");
  });

  it("reports nothing to summarize when there are no orders", () => {
    expect(summarizeOrders([])).toEqual({
      count: 0,
      totalForSale: null,
      minRate: null,
      maxRate: null,
      nextExpiry: null,
    });
  });
});

describe("summarizeConversions", () => {
  it("totals locked HBD and takes the soonest maturity across both kinds", () => {
    const summary = summarizeConversions(
      [
        {
          id: 1,
          owner: "a",
          requestid: 1,
          amount: { amount: "500000", precision: 3, nai: "@@000000013" },
          conversion_date: "2026-09-19T10:00:00",
        },
        {
          id: 2,
          owner: "a",
          requestid: 2,
          amount: { amount: "250500", precision: 3, nai: "@@000000013" },
          conversion_date: "2026-09-18T10:00:00",
        },
      ],
      [
        {
          id: 3,
          owner: "a",
          requestid: 3,
          collateral_amount: {
            amount: "1000000",
            precision: 3,
            nai: "@@000000021",
          },
          converted_amount: {
            amount: "25000",
            precision: 3,
            nai: "@@000000013",
          },
          conversion_date: "2026-09-17T10:00:00",
        },
      ],
      BEFORE_ALL
    );

    expect(summary.count).toBe(3);
    expect(summary.hbdLocked).toEqual({
      amount: "750500",
      precision: 3,
      nai: "@@000000013",
    });
    expect(summary.hiveCollateral).toEqual({
      amount: "1000000",
      precision: 3,
      nai: "@@000000021",
    });
    expect(summary.nextMaturity?.toISOString()).toBe(
      "2026-09-17T10:00:00.000Z"
    );
  });
});

describe("summarizeConversions with only collateralized requests", () => {
  it("reports the HIVE collateral instead of a zero HBD total", () => {
    const summary = summarizeConversions(
      [],
      [
        {
          id: 1,
          owner: "a",
          requestid: 1,
          collateral_amount: hive("1000000"),
          converted_amount: hbd("25000"),
          conversion_date: "2026-09-19T10:00:00",
        },
      ],
      BEFORE_ALL
    );

    expect(summary.count).toBe(1);
    expect(summary.hbdLocked).toBeNull();
    expect(summary.hiveCollateral).toEqual(hive("1000000"));
  });
});

describe("conversionStartedAt", () => {
  it("is 3.5 days before maturity, as every conversion settles", () => {
    expect(conversionStartedAt("2026-09-20T22:07:48")?.toISOString()).toBe(
      "2026-09-17T10:07:48.000Z"
    );
  });
});

describe("sortByMaturity", () => {
  it("lists the soonest-maturing conversion first", () => {
    const sorted = sortByMaturity([
      { requestid: 1, conversion_date: "2026-09-21T09:00:00" },
      { requestid: 2, conversion_date: "2026-09-18T09:00:00" },
    ]);

    expect(sorted.map((r) => r.requestid)).toEqual([2, 1]);
  });
});
