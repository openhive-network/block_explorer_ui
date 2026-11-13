import React from "react";
import { BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import useAccountOpenOrders from "@/hooks/api/accountPage/useAccountOpenOrders";
import useOrderBook, {
  ORDER_BOOK_DEPTH,
} from "@/hooks/api/homePage/useOrderBook";
import useElementWidth from "@/hooks/common/useElementWidth";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { naiAssetToFloat } from "@/utils/Calculations";
import { BookRow, BookSide, bookSpread } from "@/utils/orderBook";
import { formatBlockchainTime } from "@/utils/TimeUtils";

const PRICE_DECIMALS = 6;
// Below this the two sides stack instead of sitting side by side.
const SIDE_BY_SIDE_MIN_PX = 560;
// A side narrower than this drops its running-total column.
const TOTAL_COLUMN_MIN_PX = 300;

// Depth bars grow toward the spread: from the end on bids, the start on asks.
const SIDE_STYLE: Record<
  BookSide,
  { text: string; bar: string; heading: string }
> = {
  bids: {
    text: "text-green-700 dark:text-green-400",
    bar: "end-0 bg-green-500/10 dark:bg-green-400/10",
    heading: "orderBook.bids",
  },
  asks: {
    text: "text-red-700 dark:text-red-400",
    bar: "start-0 bg-red-500/10 dark:bg-red-400/10",
    heading: "orderBook.asks",
  },
};

interface SideProps {
  side: BookSide;
  rows: BookRow[];
  me: string | null;
  showTotal: boolean;
}

const OrderBookSide: React.FC<SideProps> = ({ side, rows, me, showTotal }) => {
  const { t, locale } = useI18n();
  const style = SIDE_STYLE[side];
  const depth = rows.at(-1)?.cumulativeHbd ?? 0;
  const amount = (value: number) =>
    value.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  const columns = showTotal ? "grid-cols-4" : "grid-cols-3";

  return (
    <section
      aria-label={t(style.heading)}
      data-testid={`order-book-${side}`}
      className="min-w-0"
    >
      <h3
        id={`order-book-${side}-heading`}
        className={cn("mb-1 px-1 text-xs font-semibold", style.text)}
      >
        {t(style.heading)}
      </h3>
      <div role="table" aria-labelledby={`order-book-${side}-heading`}>
        <div
          role="row"
          className={cn(
            "grid gap-x-2 px-1 pb-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400",
            columns
          )}
        >
          <span role="columnheader">{t("orderBook.price")}</span>
          <span role="columnheader" className="text-end">
            HIVE
          </span>
          <span role="columnheader" className="text-end">
            HBD
          </span>
          {showTotal && (
            <span role="columnheader" className="text-end">
              {t("orderBook.total")}
            </span>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="px-1 py-3 text-xs text-slate-500">
            {t("orderBook.emptySide")}
          </p>
        ) : (
          <div
            role="rowgroup"
            className="max-h-72 overflow-y-auto scrollableContainer"
          >
            {rows.map((row) => {
              const isMine = !!me && row.seller === me;
              const title = t("orderBook.rowTitle", {
                seller: row.seller,
                expires: row.expiration
                  ? formatBlockchainTime(row.expiration)
                  : "—",
              });
              return (
                <div
                  key={row.id}
                  role="row"
                  title={title}
                  data-mine={isMine || undefined}
                  className={cn(
                    "relative grid gap-x-2 rounded px-1 py-0.5 font-mono text-xs tabular-nums",
                    columns,
                    isMine &&
                      "bg-amber-100 ring-1 ring-amber-400 dark:bg-amber-400/15 dark:ring-amber-500"
                  )}
                >
                  {/* Depth bar: how much of the listed side sits at this price or better. */}
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 rounded", style.bar)}
                    style={{
                      width: `${depth ? (row.cumulativeHbd / depth) * 100 : 0}%`,
                    }}
                  />
                  <span role="cell" className={cn("relative", style.text)}>
                    {row.price.toLocaleString(locale, {
                      minimumFractionDigits: PRICE_DECIMALS,
                      maximumFractionDigits: PRICE_DECIMALS,
                    })}
                    {isMine && (
                      <span className="ms-1 rounded bg-amber-500 px-1 font-sans text-[9px] font-semibold text-white">
                        {t("orderBook.you")}
                      </span>
                    )}
                    {/* The hover title is not reachable by keyboard or touch. */}
                    <span className="sr-only">{title}</span>
                  </span>
                  <span role="cell" className="relative text-end">
                    {amount(naiAssetToFloat(row.hive))}
                  </span>
                  <span role="cell" className="relative text-end">
                    {amount(naiAssetToFloat(row.hbd))}
                  </span>
                  {showTotal && (
                    <span
                      role="cell"
                      className="relative text-end text-slate-500 dark:text-slate-400"
                    >
                      {amount(row.cumulativeHbd)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// All open orders on the internal HIVE/HBD market, with the signed-in user's
// own orders highlighted where they sit. Read-only.
const OrderBookWidget: React.FC = () => {
  const { t, locale } = useI18n();
  const { username, isLoggedIn } = useAuth();
  const { asks, bids, isOrderBookLoading, isOrderBookError } = useOrderBook();
  const [ref, width] = useElementWidth<HTMLDivElement>();

  const me = isLoggedIn ? username : null;
  // Only the best orders per side are listed; the user's own orders come from
  // their account so the ones further down can still be counted.
  const { openOrders: myOpenOrders } = useAccountOpenOrders(me ?? "", {
    enabled: !!me,
  });
  const sideBySide = width >= SIDE_BY_SIDE_MIN_PX;
  const sideWidth = sideBySide ? width / 2 : width;
  const showTotal = sideWidth >= TOTAL_COLUMN_MIN_PX;
  const spread = bookSpread(bids, asks);
  const myOrdersShown = me
    ? [...bids, ...asks].filter((row) => row.seller === me).length
    : 0;
  const myOrdersDeeper = Math.max(
    0,
    (myOpenOrders?.length ?? 0) - myOrdersShown
  );
  const hasBook = bids.length > 0 || asks.length > 0;

  const price = (value: number) =>
    value.toLocaleString(locale, {
      minimumFractionDigits: PRICE_DECIMALS,
      maximumFractionDigits: PRICE_DECIMALS,
    });

  return (
    <Card className="overflow-hidden mb-2" data-testid="order-book-widget">
      <CardHeaderWithLink title={t("widgets.orderBookName")} />
      <CardContent className="px-2 pt-2 pb-2">
        <div ref={ref}>
          {isOrderBookLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : isOrderBookError && !hasBook ? (
            // A failed background refresh keeps the last book on screen.
            <p className="py-6 text-center text-xs text-red-500">
              {t("orderBook.error")}
            </p>
          ) : !hasBook ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <BookOpen className="h-7 w-7 opacity-20" />
              <p className="text-xs">{t("orderBook.empty")}</p>
            </div>
          ) : (
            <>
              <dl
                className="mb-2 grid grid-cols-3 gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-center dark:bg-slate-800/50"
                data-testid="order-book-summary"
              >
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("orderBook.bestBid")}
                  </dt>
                  <dd className="font-mono text-xs text-green-700 dark:text-green-400">
                    {spread ? price(spread.bestBid) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("orderBook.spread")}
                  </dt>
                  <dd className="font-mono text-xs">
                    {spread
                      ? `${price(spread.spread)} (${(spread.spreadRatio * 100).toLocaleString(locale, { maximumFractionDigits: 2 })}%)`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("orderBook.bestAsk")}
                  </dt>
                  <dd className="font-mono text-xs text-red-700 dark:text-red-400">
                    {spread ? price(spread.bestAsk) : "—"}
                  </dd>
                </div>
              </dl>
              <p className="mb-2 px-1 text-[10px] text-slate-500 dark:text-slate-400">
                {t("orderBook.priceUnit", { count: ORDER_BOOK_DEPTH })}
                {myOrdersShown + myOrdersDeeper > 0 && (
                  <span className="ms-2 font-medium text-amber-700 dark:text-amber-400">
                    {t("orderBook.yourOrders", { count: myOrdersShown })}
                    {myOrdersDeeper > 0 &&
                      ` · ${t("orderBook.yourOrdersDeeper", { count: myOrdersDeeper })}`}
                  </span>
                )}
              </p>
              <div
                className={cn(
                  sideBySide ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"
                )}
              >
                <OrderBookSide
                  side="bids"
                  rows={bids}
                  me={me}
                  showTotal={showTotal}
                />
                <OrderBookSide
                  side="asks"
                  rows={asks}
                  me={me}
                  showTotal={showTotal}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBookWidget;
