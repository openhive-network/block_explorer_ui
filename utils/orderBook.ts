import Hive from "@/types/Hive";
import { naiAssetToFloat } from "@/utils/Calculations";
import { parseChainDate } from "@/utils/TimeUtils";

// The internal HIVE/HBD market, read from database_api.list_limit_orders
// (order "by_price"), which walks every order from the highest price down,
// grouped by the asset being sold. Starting from an impossibly high price for
// one side returns that side's best orders first: the cheapest HIVE for sale
// (asks) or the most HBD offered per HIVE (bids). Once a side runs out the
// listing continues into the other one, so rows are filtered by asset.

export type BookSide = "asks" | "bids";

const HIVE_NAI = "@@000000021";
const HBD_NAI = "@@000000013";

const SOLD_NAI: Record<BookSide, string> = { asks: HIVE_NAI, bids: HBD_NAI };

const supply = (amount: string, nai: string) => ({
  amount,
  precision: 3,
  nai,
});

// 1,000,000 of the sold asset for 0.001 of the other: above any real order.
export const ORDER_BOOK_START: Record<BookSide, Hive.OpenOrder["sell_price"]> =
  {
    asks: {
      base: supply("1000000000", HIVE_NAI),
      quote: supply("1", HBD_NAI),
    },
    bids: {
      base: supply("1000000000", HBD_NAI),
      quote: supply("1", HIVE_NAI),
    },
  };

export interface BookRow {
  id: number;
  seller: string;
  // HBD per HIVE on both sides, the convention of the account Open Orders view.
  price: number;
  hive: Hive.Supply;
  hbd: Hive.Supply;
  // Running HBD total from the best price down to this row.
  cumulativeHbd: number;
  expiration: Date | null;
}

export const toBookRows = (
  orders: Hive.OpenOrder[],
  side: BookSide
): BookRow[] => {
  let cumulativeHbd = 0;
  return orders
    .filter((order) => order.sell_price.base.nai === SOLD_NAI[side])
    .map((order) => {
      const { base, quote } = order.sell_price;
      const baseAmount = BigInt(base.amount);
      // `for_sale` is what is left; what it fetches is truncated like the chain.
      const remaining = {
        amount: String(order.for_sale),
        precision: base.precision,
        nai: base.nai,
      };
      const counter = {
        amount:
          baseAmount === BigInt(0)
            ? "0"
            : String(
                (BigInt(order.for_sale) * BigInt(quote.amount)) / baseAmount
              ),
        precision: quote.precision,
        nai: quote.nai,
      };
      const hive = side === "asks" ? remaining : counter;
      const hbd = side === "asks" ? counter : remaining;
      const hiveAmount = naiAssetToFloat(side === "asks" ? base : quote);
      const hbdAmount = naiAssetToFloat(side === "asks" ? quote : base);
      cumulativeHbd += naiAssetToFloat(hbd);
      return {
        id: order.id,
        seller: order.seller,
        price: hiveAmount === 0 ? 0 : hbdAmount / hiveAmount,
        hive,
        hbd,
        cumulativeHbd,
        expiration: parseChainDate(order.expiration),
      };
    });
};

export interface BookSpread {
  bestBid: number;
  bestAsk: number;
  spread: number;
  // Spread as a fraction of the mid price.
  spreadRatio: number;
}

export const bookSpread = (
  bids: BookRow[],
  asks: BookRow[]
): BookSpread | null => {
  if (!bids.length || !asks.length) return null;
  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const mid = (bestBid + bestAsk) / 2;
  return {
    bestBid,
    bestAsk,
    spread: bestAsk - bestBid,
    spreadRatio: mid === 0 ? 0 : (bestAsk - bestBid) / mid,
  };
};
