import Hive from "@/types/Hive";
import { naiAssetToFloat } from "@/utils/Calculations";
import { parseChainDate } from "@/utils/TimeUtils";

export type PendingAssetSymbol = "HIVE" | "HBD";

export interface OpenOrderRow {
  orderId: number;
  sellSymbol: PendingAssetSymbol;
  forSale: Hive.Supply;
  receiveAtLeast: Hive.Supply;
  rate: number;
  created: Date | null;
  expiration: Date | null;
}

const NAI: Record<PendingAssetSymbol, string> = {
  HBD: "@@000000013",
  HIVE: "@@000000021",
};

const timeOf = (date: Date | null) =>
  date?.getTime() ?? Number.MAX_SAFE_INTEGER;

const ratio = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator;

export const toOpenOrderRows = (orders: Hive.OpenOrder[]): OpenOrderRow[] =>
  orders
    .map((order) => {
      const { base, quote } = order.sell_price;
      const sellSymbol: PendingAssetSymbol =
        base.nai === NAI.HBD ? "HBD" : "HIVE";
      const baseAmount = BigInt(base.amount);
      return {
        orderId: order.orderid,
        sellSymbol,
        forSale: {
          amount: String(order.for_sale),
          precision: base.precision,
          nai: base.nai,
        },
        // What is left to receive for the unfilled remainder, truncated like the chain.
        receiveAtLeast: {
          amount:
            baseAmount === BigInt(0)
              ? "0"
              : String(
                  (BigInt(order.for_sale) * BigInt(quote.amount)) / baseAmount
                ),
          precision: quote.precision,
          nai: quote.nai,
        },
        // The operations page convention: HBD per HIVE whichever side is sold.
        rate:
          sellSymbol === "HBD"
            ? ratio(naiAssetToFloat(base), naiAssetToFloat(quote))
            : ratio(naiAssetToFloat(quote), naiAssetToFloat(base)),
        created: parseChainDate(order.created),
        expiration: parseChainDate(order.expiration),
      };
    })
    .sort((a, b) => timeOf(a.expiration) - timeOf(b.expiration));

export const ordersSelling = (
  rows: OpenOrderRow[],
  symbol: PendingAssetSymbol
): OpenOrderRow[] => rows.filter((row) => row.sellSymbol === symbol);

export interface OrdersSummary {
  count: number;
  totalForSale: Hive.Supply | null;
  minRate: number | null;
  maxRate: number | null;
  nextExpiry: Date | null;
}

export interface ConversionsSummary {
  count: number;
  hbdLocked: Hive.Supply | null;
  hiveCollateral: Hive.Supply | null;
  nextMaturity: Date | null;
}

const nextUpcoming = (dates: (Date | null)[], now: number): Date | null =>
  dates.reduce<Date | null>(
    (next, date) =>
      date && date.getTime() > now && (!next || date < next) ? date : next,
    null
  );

// Amounts must share one asset; the sum stays in the smallest unit.
const sumSupply = (amounts: Hive.Supply[]): Hive.Supply | null =>
  amounts.length === 0
    ? null
    : {
        amount: String(
          amounts.reduce(
            (sum, supply) => sum + BigInt(supply.amount),
            BigInt(0)
          )
        ),
        precision: amounts[0].precision,
        nai: amounts[0].nai,
      };

// Expects rows already narrowed to one side by ordersSelling, so amounts share an asset.
export const summarizeOrders = (
  rows: OpenOrderRow[],
  now: number = Date.now()
): OrdersSummary => {
  const rates = rows.map((row) => row.rate);
  return {
    count: rows.length,
    totalForSale: sumSupply(rows.map((row) => row.forSale)),
    minRate: rates.length ? Math.min(...rates) : null,
    maxRate: rates.length ? Math.max(...rates) : null,
    nextExpiry: nextUpcoming(
      rows.map((row) => row.expiration),
      now
    ),
  };
};

export const summarizeConversions = (
  hbd: Hive.HbdConversionRequest[],
  collateralized: Hive.CollateralizedConversionRequest[],
  now: number = Date.now()
): ConversionsSummary => ({
  count: hbd.length + collateralized.length,
  hbdLocked: sumSupply(hbd.map((request) => request.amount)),
  hiveCollateral: sumSupply(
    collateralized.map((request) => request.collateral_amount)
  ),
  nextMaturity: nextUpcoming(
    [...hbd, ...collateralized].map((request) =>
      parseChainDate(request.conversion_date)
    ),
    now
  ),
});

export const sortByMaturity = <T extends { conversion_date: string }>(
  requests: T[]
): T[] =>
  [...requests].sort(
    (a, b) =>
      timeOf(parseChainDate(a.conversion_date)) -
      timeOf(parseChainDate(b.conversion_date))
  );

// Both conversion kinds settle 3.5 days after the request, so the start follows from maturity.
const CONVERSION_DELAY_MS = 3.5 * 24 * 60 * 60 * 1000;

export const conversionStartedAt = (conversionDate: string): Date | null => {
  const maturity = parseChainDate(conversionDate);
  return maturity ? new Date(maturity.getTime() - CONVERSION_DELAY_MS) : null;
};
