import Hive from "@/types/Hive";
import { bookSpread, toBookRows } from "@/utils/orderBook";

const HIVE = "@@000000021";
const HBD = "@@000000013";
const asset = (amount: string, nai: string) => ({ amount, precision: 3, nai });

const order = (
  id: number,
  base: [string, string],
  quote: [string, string],
  forSale: number,
  seller = "alice"
): Hive.OpenOrder => ({
  id,
  created: "2026-11-13T09:00:00",
  expiration: "2026-12-10T09:00:00",
  seller,
  orderid: id,
  for_sale: forSale,
  sell_price: { base: asset(...base), quote: asset(...quote) },
});

// Real rows from api.hive.blog (2026-11-13).
const ASKS = [
  order(1, ["49919", HIVE], ["2150", HBD], 49919, "risingstarhub"),
  order(2, ["26140", HIVE], ["1126", HBD], 26140, "quicktrades"),
];
const BIDS = [
  order(3, ["2157", HBD], ["50151", HIVE], 2157, "risingstarhub"),
  // Partly filled: 35.748 of 43.000 HBD left.
  order(4, ["43000", HBD], ["1000000", HIVE], 35748, "risingstarhub"),
];

describe("toBookRows", () => {
  it("reads asks as HIVE for sale, priced in HBD per HIVE", () => {
    const [first] = toBookRows(ASKS, "asks");
    expect(first.hive).toEqual(asset("49919", HIVE));
    expect(first.hbd).toEqual(asset("2150", HBD));
    expect(first.price).toBeCloseTo(2.15 / 49.919, 9);
  });

  it("reads bids as HBD for sale, priced in HBD per HIVE", () => {
    const rows = toBookRows(BIDS, "bids");
    expect(rows[0].hbd).toEqual(asset("2157", HBD));
    expect(rows[0].price).toBeCloseTo(2.157 / 50.151, 9);
    // The remainder fetches its share of the HIVE, truncated like the chain.
    expect(rows[1].hbd).toEqual(asset("35748", HBD));
    expect(rows[1].hive).toEqual(asset("831348", HIVE));
    expect(rows[1].price).toBeCloseTo(0.043, 9);
  });

  it("keeps a running HBD total from the best price down", () => {
    const rows = toBookRows(ASKS, "asks");
    expect(rows.map((row) => row.cumulativeHbd)).toEqual([2.15, 2.15 + 1.126]);
  });

  it("drops the other side's orders the listing runs on into", () => {
    expect(toBookRows([...ASKS, ...BIDS], "asks")).toHaveLength(2);
    expect(toBookRows([...BIDS, ...ASKS], "bids")).toHaveLength(2);
  });
});

describe("bookSpread", () => {
  it("compares the best ask with the best bid", () => {
    const spread = bookSpread(
      toBookRows(BIDS, "bids"),
      toBookRows(ASKS, "asks")
    )!;
    expect(spread.bestBid).toBeCloseTo(0.04301, 5);
    expect(spread.bestAsk).toBeCloseTo(0.04307, 5);
    expect(spread.spread).toBeCloseTo(0.00006, 5);
    expect(spread.spreadRatio).toBeCloseTo(0.00006 / 0.04304, 4);
  });

  it("is null when a side is empty", () => {
    expect(bookSpread([], toBookRows(ASKS, "asks"))).toBeNull();
  });
});
