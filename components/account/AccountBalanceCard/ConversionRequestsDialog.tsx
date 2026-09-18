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
import KpiTile from "@/components/ui/KpiTile";
import NoResult from "@/components/NoResult";
import DataExport from "@/components/DataExport";
import { useI18n } from "@/i18n/i18n";
import useAccountConversionRequests from "@/hooks/api/accountPage/useAccountConversionRequests";
import { formatNaiAsset, naiAssetToFloat } from "@/utils/Calculations";
import { spacesToUnderscores } from "@/utils/StringUtils";
import {
  formatAndDelocalizeFromTime,
  formatBlockchainTime,
} from "@/utils/TimeUtils";
import {
  conversionStartedAt,
  sortByMaturity,
  summarizeConversions,
} from "@/utils/accountPendingItems";
import PendingDateCell from "./PendingDateCell";

interface ConversionRequestsDialogProps {
  accountName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-700 dark:text-gray-300">
    {children}
  </h3>
);

const ConversionRequestsDialog: React.FC<ConversionRequestsDialogProps> = ({
  accountName,
  isOpen,
  onOpenChange,
}) => {
  const { t, locale } = useI18n();
  const {
    conversionRequests,
    isConversionRequestsLoading,
    isConversionRequestsError,
  } = useAccountConversionRequests(accountName, { enabled: isOpen });
  const hbdRequests = useMemo(
    () => sortByMaturity(conversionRequests?.hbd ?? []),
    [conversionRequests]
  );
  const collateralizedRequests = useMemo(
    () => sortByMaturity(conversionRequests?.collateralized ?? []),
    [conversionRequests]
  );
  const summary = useMemo(
    () => summarizeConversions(hbdRequests, collateralizedRequests),
    [hbdRequests, collateralizedRequests]
  );

  const exportData = useMemo(() => {
    const amountColumn = `${t("accountConversionsDialog.amount")} (HBD)`;
    const collateralColumn = `${t("accountConversionsDialog.collateral")} (HIVE)`;
    const datesOf = (conversionDate: string) => ({
      [t("accountConversionsDialog.started")]: formatBlockchainTime(
        conversionStartedAt(conversionDate)
      ),
      [t("accountConversionsDialog.matures")]:
        formatBlockchainTime(conversionDate),
    });
    return [
      ...hbdRequests.map((request) => ({
        [t("accountConversionsDialog.type")]: t(
          "accountConversionsDialog.hbdToHive"
        ),
        [t("accountConversionsDialog.requestId")]: request.requestid,
        [amountColumn]: naiAssetToFloat(request.amount),
        [collateralColumn]: "",
        ...datesOf(request.conversion_date),
      })),
      ...collateralizedRequests.map((request) => ({
        [t("accountConversionsDialog.type")]: t(
          "accountConversionsDialog.hiveToHbd"
        ),
        [t("accountConversionsDialog.requestId")]: request.requestid,
        [amountColumn]: naiAssetToFloat(request.converted_amount),
        [collateralColumn]: naiAssetToFloat(request.collateral_amount),
        ...datesOf(request.conversion_date),
      })),
    ];
  }, [hbdRequests, collateralizedRequests, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="min-w-[70vw] pr-0"
        data-testid="conversion-requests-dialog"
      >
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("accountConversionsDialog.title")}
            subtitle={`@${accountName}`}
            actions={
              summary.count > 0 && (
                <DataExport
                  data={exportData}
                  filename={`${accountName}_${spacesToUnderscores(
                    t("accountConversionsDialog.title")
                  )}.csv`}
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

          {isConversionRequestsLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : isConversionRequestsError ? (
            <div className="flex justify-center items-center py-16">
              <p className="text-red-500">{t("common.errorLoadingData")}</p>
            </div>
          ) : summary.count === 0 ? (
            <NoResult
              descriptionKey={t("accountConversionsDialog.noConversions")}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <KpiTile
                  label={t("accountConversionsDialog.kpiPending")}
                  value={summary.count.toLocaleString(locale)}
                />
                <KpiTile
                  label={t("accountConversionsDialog.kpiHbdLocked")}
                  valueClassName="whitespace-normal"
                  value={
                    summary.hbdLocked
                      ? formatNaiAsset(summary.hbdLocked, locale)
                      : "—"
                  }
                />
                <KpiTile
                  label={t("accountConversionsDialog.kpiHiveCollateral")}
                  valueClassName="whitespace-normal"
                  value={
                    summary.hiveCollateral
                      ? formatNaiAsset(summary.hiveCollateral, locale)
                      : "—"
                  }
                />
                <KpiTile
                  label={t("accountConversionsDialog.kpiNextMaturity")}
                  valueClassName="whitespace-normal"
                  value={
                    summary.nextMaturity
                      ? formatAndDelocalizeFromTime(
                          summary.nextMaturity,
                          locale
                        )
                      : "—"
                  }
                  sub={
                    summary.nextMaturity ? (
                      <span dir="ltr">
                        {formatBlockchainTime(summary.nextMaturity)}
                      </span>
                    ) : undefined
                  }
                />
              </div>

              {hbdRequests.length > 0 && (
                <section>
                  <SectionTitle>
                    {t("accountConversionsDialog.hbdToHive")}
                  </SectionTitle>
                  <Table
                    enableMobileScrollArrows
                    isDialog
                    className="min-w-max"
                  >
                    <TableHeader>
                      <TableRow>
                        <TableHead stickyLeft>
                          {t("accountConversionsDialog.requestId")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.amount")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.started")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.matures")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hbdRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell
                            stickyLeft
                            className="text-gray-500 dark:text-gray-300"
                          >
                            {request.requestid}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            {formatNaiAsset(request.amount, locale)}
                          </TableCell>
                          <TableCell>
                            <PendingDateCell
                              value={conversionStartedAt(
                                request.conversion_date
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <PendingDateCell value={request.conversion_date} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}

              {collateralizedRequests.length > 0 && (
                <section>
                  <SectionTitle>
                    {t("accountConversionsDialog.hiveToHbd")}
                  </SectionTitle>
                  <Table
                    enableMobileScrollArrows
                    isDialog
                    className="min-w-max"
                  >
                    <TableHeader>
                      <TableRow>
                        <TableHead stickyLeft>
                          {t("accountConversionsDialog.requestId")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.collateral")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.hbdReceived")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.started")}
                        </TableHead>
                        <TableHead>
                          {t("accountConversionsDialog.matures")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collateralizedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell
                            stickyLeft
                            className="text-gray-500 dark:text-gray-300"
                          >
                            {request.requestid}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            {formatNaiAsset(request.collateral_amount, locale)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatNaiAsset(request.converted_amount, locale)}
                          </TableCell>
                          <TableCell>
                            <PendingDateCell
                              value={conversionStartedAt(
                                request.conversion_date
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <PendingDateCell value={request.conversion_date} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </section>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversionRequestsDialog;
