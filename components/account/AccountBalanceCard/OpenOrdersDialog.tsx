import React, { useMemo } from "react";
import { Download, Loader2 } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import KpiTile from "@/components/ui/KpiTile";
import NoResult from "@/components/NoResult";
import DataExport from "@/components/DataExport";
import { useI18n } from "@/i18n/i18n";
import useAccountOpenOrders from "@/hooks/api/accountPage/useAccountOpenOrders";
import { formatNaiAsset, naiAssetToFloat } from "@/utils/Calculations";
import { spacesToUnderscores } from "@/utils/StringUtils";
import {
  formatAndDelocalizeFromTime,
  formatBlockchainTime,
} from "@/utils/TimeUtils";
import {
  ordersSelling,
  PendingAssetSymbol,
  summarizeOrders,
  toOpenOrderRows,
} from "@/utils/accountPendingItems";
import PendingDateCell from "./PendingDateCell";

interface OpenOrdersDialogProps {
  accountName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  symbol: PendingAssetSymbol;
  onSymbolChange: (symbol: PendingAssetSymbol) => void;
}

const PRICE_DECIMALS = 6;

const OpenOrdersDialog: React.FC<OpenOrdersDialogProps> = ({
  accountName,
  isOpen,
  onOpenChange,
  symbol,
  onSymbolChange,
}) => {
  const { t, locale } = useI18n();

  const { openOrders, isOpenOrdersLoading, isOpenOrdersError } =
    useAccountOpenOrders(accountName, { enabled: isOpen });

  const rows = useMemo(
    () => ordersSelling(toOpenOrderRows(openOrders ?? []), symbol),
    [openOrders, symbol]
  );
  const summary = useMemo(() => summarizeOrders(rows), [rows]);

  const formatPrice = (price: number) =>
    price.toLocaleString(locale, {
      minimumFractionDigits: PRICE_DECIMALS,
      maximumFractionDigits: PRICE_DECIMALS,
    });

  const exportData = useMemo(
    () =>
      rows.map((row) => ({
        [t("accountOpenOrdersDialog.orderId")]: row.orderId,
        [`${t("accountOpenOrdersDialog.forSale")} (${row.sellSymbol})`]:
          naiAssetToFloat(row.forSale),
        [`${t("accountOpenOrdersDialog.receiveAtLeast")} (${
          row.sellSymbol === "HIVE" ? "HBD" : "HIVE"
        })`]: naiAssetToFloat(row.receiveAtLeast),
        [`${t("accountOpenOrdersDialog.rate")} (HBD/HIVE)`]: Number(
          row.rate.toFixed(PRICE_DECIMALS)
        ),
        [t("accountOpenOrdersDialog.created")]: formatBlockchainTime(
          row.created
        ),
        [t("accountOpenOrdersDialog.expires")]: formatBlockchainTime(
          row.expiration
        ),
      })),
    [rows, t]
  );

  const rateRange =
    summary.minRate === null || summary.maxRate === null
      ? "—"
      : summary.minRate === summary.maxRate
        ? formatPrice(summary.minRate)
        : `${formatPrice(summary.minRate)} – ${formatPrice(summary.maxRate)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-[70vw] pr-0"
        data-testid="open-orders-dialog"
      >
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("accountOpenOrdersDialog.title")}
            subtitle={`@${accountName}`}
            actions={
              rows.length > 0 && (
                <DataExport
                  data={exportData}
                  filename={`${accountName}_${spacesToUnderscores(
                    t("accountOpenOrdersDialog.title")
                  )}_${symbol}.csv`}
                  skipColumnSelection
                >
                  <button
                    type="button"
                    title={t("common.export")}
                    className="report-export-btn"
                  >
                    <Download className="h-4 w-4" />
                    {t("common.export")}
                  </button>
                </DataExport>
              )
            }
          />

          <div className="report-filters mb-4">
            <span className="report-filters-label">
              {t("accountOpenOrdersDialog.assetToggleLabel")}
            </span>
            <SegmentedToggle
              variant="pill"
              size="md"
              className="w-fit"
              ariaLabel={t("accountOpenOrdersDialog.assetToggleLabel")}
              value={symbol}
              onChange={onSymbolChange}
              options={[
                {
                  value: "HIVE",
                  label: t("accountOpenOrdersDialog.sellingHive"),
                },
                {
                  value: "HBD",
                  label: t("accountOpenOrdersDialog.sellingHbd"),
                },
              ]}
            />
          </div>

          {isOpenOrdersLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : isOpenOrdersError ? (
            <div className="flex justify-center items-center py-16">
              <p className="text-red-500">{t("common.errorLoadingData")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <KpiTile
                  label={t("accountOpenOrdersDialog.kpiOrders")}
                  value={summary.count.toLocaleString(locale)}
                />
                <KpiTile
                  label={t("accountOpenOrdersDialog.kpiTotalForSale")}
                  valueClassName="whitespace-normal"
                  value={
                    summary.totalForSale
                      ? formatNaiAsset(summary.totalForSale, locale)
                      : "—"
                  }
                />
                <KpiTile
                  label={t("accountOpenOrdersDialog.kpiRateRange")}
                  // dir="ltr": RTL bidi otherwise swaps the two ends of the range.
                  value={<span dir="ltr">{rateRange}</span>}
                  valueClassName="whitespace-normal"
                  sub="HBD/HIVE"
                />
                <KpiTile
                  label={t("accountOpenOrdersDialog.kpiNextExpiry")}
                  valueClassName="whitespace-normal"
                  value={
                    summary.nextExpiry
                      ? formatAndDelocalizeFromTime(summary.nextExpiry, locale)
                      : "—"
                  }
                  sub={
                    summary.nextExpiry ? (
                      <span dir="ltr">
                        {formatBlockchainTime(summary.nextExpiry)}
                      </span>
                    ) : undefined
                  }
                />
              </div>

              {rows.length > 0 ? (
                <Table enableMobileScrollArrows isDialog className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      <TableHead stickyLeft>
                        {t("accountOpenOrdersDialog.orderId")}
                      </TableHead>
                      <TableHead>
                        {t("accountOpenOrdersDialog.forSale")}
                      </TableHead>
                      <TableHead>
                        {t("accountOpenOrdersDialog.receiveAtLeast")}
                      </TableHead>
                      <TableHead>{t("accountOpenOrdersDialog.rate")}</TableHead>
                      <TableHead>
                        {t("accountOpenOrdersDialog.created")}
                      </TableHead>
                      <TableHead>
                        {t("accountOpenOrdersDialog.expires")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.orderId}>
                        <TableCell
                          stickyLeft
                          className="text-gray-500 dark:text-gray-300"
                        >
                          {row.orderId}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">
                          {formatNaiAsset(row.forSale, locale)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatNaiAsset(row.receiveAtLeast, locale)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatPrice(row.rate)} HBD/HIVE
                        </TableCell>
                        <TableCell>
                          <PendingDateCell value={row.created} />
                        </TableCell>
                        <TableCell>
                          <PendingDateCell value={row.expiration} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <NoResult
                  descriptionKey={t("accountOpenOrdersDialog.noOrders")}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenOrdersDialog;
