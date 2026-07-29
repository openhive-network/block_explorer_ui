import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Info, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchRanges from "../searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import AccountRetentionHeatmap, {
  HeatmapViewMode,
} from "./AccountRetentionHeatmap";
import useAccountFunnel from "@/hooks/api/homePage/useAccountFunnel";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";
import { formatCompact, computeAvg } from "@/utils/chartUtils";

interface AccountRetentionFunnelFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tooltip?: string;
}> = ({ label, value, sub, tooltip }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide leading-none">
      <span>{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 cursor-help text-gray-400 hover:text-gray-500">
                <Info size={12} />
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[260px] text-[12px] text-left normal-case"
              >
                {tooltip}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

const retentionColor = (pct: number | null) => {
  if (pct === null) return "";
  if (pct >= 30) return "text-emerald-500 dark:text-emerald-400";
  if (pct >= 10) return "text-amber-500 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const AccountRetentionFunnelFullChartDialog: React.FC<
  AccountRetentionFunnelFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t, locale } = useI18n();
  const [viewMode, setViewMode] = useState<HeatmapViewMode>("rates");
  const [fromDate, setFromDate] = useState<Date | undefined>(
    moment().subtract(1, "year").toDate()
  );
  const [toDate, setToDate] = useState<Date | undefined>(moment().toDate());
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const searchRanges = useSearchRanges();
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const { accountFunnel, isAccountFunnelLoading, isAccountFunnelError } =
    useAccountFunnel(fromDate, toDate, isOpen);

  const sortedData = useMemo(() => {
    if (!accountFunnel) return [];
    return [...accountFunnel].sort((a, b) =>
      a.cohort_month < b.cohort_month ? -1 : 1
    );
  }, [accountFunnel]);

  const avg7d = useMemo(
    () => computeAvg(sortedData.map((d) => d.pct_7d)),
    [sortedData]
  );
  const avg30d = useMemo(
    () => computeAvg(sortedData.map((d) => d.pct_30d)),
    [sortedData]
  );
  const avg90d = useMemo(
    () => computeAvg(sortedData.map((d) => d.pct_90d)),
    [sortedData]
  );
  const avgActive7d = useMemo(
    () => computeAvg(sortedData.map((d) => d.active_at_7d)),
    [sortedData]
  );
  const avgActive30d = useMemo(
    () => computeAvg(sortedData.map((d) => d.active_at_30d)),
    [sortedData]
  );
  const avgActive90d = useMemo(
    () => computeAvg(sortedData.map((d) => d.active_at_90d)),
    [sortedData]
  );
  const avgNewAccounts = useMemo(
    () => computeAvg(sortedData.map((d) => d.new_accounts)),
    [sortedData]
  );

  const bestCohort = useMemo(() => {
    const withData = sortedData.filter((d) => d.pct_30d !== null);
    if (!withData.length) return null;
    return withData.reduce((best, d) =>
      d.pct_30d! > best.pct_30d! ? d : best
    );
  }, [sortedData]);

  const hasPendingData = useMemo(() => {
    const cutoff = moment().subtract(90, "days");
    return sortedData.some(
      (d) =>
        d.pct_90d === null && moment(d.cohort_month, "YYYY-MM").isAfter(cutoff)
    );
  }, [sortedData]);

  const exportData = useMemo(
    () =>
      sortedData.map((d) => ({
        [t("accountRetentionFunnelFullChart.cohortMonth")]: d.cohort_month,
        [t("accountRetentionFunnelCard.newAccounts")]: d.new_accounts,
        [t("accountRetentionFunnelFullChart.activeAt7d")]: d.active_at_7d,
        [t("accountRetentionFunnelFullChart.pct7d")]: d.pct_7d,
        [t("accountRetentionFunnelFullChart.activeAt30d")]: d.active_at_30d,
        [t("accountRetentionFunnelFullChart.pct30d")]: d.pct_30d,
        [t("accountRetentionFunnelFullChart.activeAt90d")]: d.active_at_90d,
        [t("accountRetentionFunnelFullChart.pct90d")]: d.pct_90d,
      })),
    [sortedData, t]
  );

  useEffect(() => {
    if (!isOpen) return;
    const oneYearAgo = moment().subtract(1, "year").toDate();
    const now = moment().toDate();
    setLastTimeUnitValue(12);
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("months");
    setFromDate(oneYearAgo);
    setToDate(now);
    setStartDate(oneYearAgo);
    setEndDate(now);
  }, [
    isOpen,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setStartDate,
    setEndDate,
  ]);

  const handleSearch = async () => {
    const { payloadStartDate, payloadEndDate } =
      await searchRanges.getRangesValues();
    setFromDate(payloadStartDate);
    setToDate(payloadEndDate ?? moment().toDate());
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("months");
    setLastTimeUnitValue(12);
    setFromDate(moment().subtract(1, "year").toDate());
    setToDate(moment().toDate());
  };

  const fmtPct = (n: number | null) =>
    n !== null
      ? `${n.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
      : "—";

  const fmtCount = (n: number | null) =>
    n !== null ? formatCompact(Math.round(n), locale) : "—";

  const hasKpis =
    !isAccountFunnelLoading && !isAccountFunnelError && sortedData.length > 0;

  const accountsLabel = t("accountRetentionFunnelCard.heatmapAccounts");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("accountRetentionFunnelFullChart.title")}
            subtitle={t("accountRetentionFunnelFullChart.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.accountRetentionFunnelName")
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
            }
          />

          {/* Filters */}
          <div className="report-filters mb-5">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex flex-col gap-y-3 flex-1 min-w-[260px]">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearchButtonDisabled}
                  >
                    {t("common.search")}
                  </Button>
                  <Button onClick={handleFilterClear}>
                    {t("common.clear")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text mr-1">
              {t("accountRetentionFunnelFullChart.viewLabel")}:
            </span>
            {(["rates", "counts"] as HeatmapViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                  viewMode === mode
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {mode === "rates"
                  ? t("accountRetentionFunnelFullChart.viewRates")
                  : t("accountRetentionFunnelFullChart.viewCounts")}
              </button>
            ))}
          </div>

          {/* Data completeness note */}
          {hasPendingData && (
            <div className="flex items-start gap-2 mb-4 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded p-2">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{t("accountRetentionFunnelFullChart.dataNote")}</span>
            </div>
          )}

          {/* KPI strip — directly above heatmap */}
          {hasKpis && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
              <KpiTile
                label={t("accountRetentionFunnelCard.newAccounts")}
                value={fmtCount(avgNewAccounts)}
                sub={t("accountRetentionFunnelFullChart.perCohortAvg")}
              />
              <KpiTile
                label={t("accountRetentionFunnelCard.retention7d")}
                tooltip={t(
                  "accountRetentionFunnelCard.tooltipRetentionSurvival",
                  {
                    n: 7,
                  }
                )}
                value={
                  viewMode === "rates" ? (
                    <span className={retentionColor(avg7d)}>
                      {fmtPct(avg7d)}
                    </span>
                  ) : (
                    fmtCount(avgActive7d)
                  )
                }
                sub={
                  viewMode === "rates"
                    ? t("accountRetentionFunnelFullChart.periodAvg")
                    : accountsLabel
                }
              />
              <KpiTile
                label={t("accountRetentionFunnelCard.retention30d")}
                tooltip={t(
                  "accountRetentionFunnelCard.tooltipRetentionSurvival",
                  {
                    n: 30,
                  }
                )}
                value={
                  viewMode === "rates" ? (
                    <span className={retentionColor(avg30d)}>
                      {fmtPct(avg30d)}
                    </span>
                  ) : (
                    fmtCount(avgActive30d)
                  )
                }
                sub={
                  viewMode === "rates"
                    ? t("accountRetentionFunnelFullChart.periodAvg")
                    : accountsLabel
                }
              />
              <KpiTile
                label={t("accountRetentionFunnelCard.retention90d")}
                tooltip={t(
                  "accountRetentionFunnelCard.tooltipRetentionSurvival",
                  {
                    n: 90,
                  }
                )}
                value={
                  viewMode === "rates" ? (
                    <span className={retentionColor(avg90d)}>
                      {fmtPct(avg90d)}
                    </span>
                  ) : (
                    fmtCount(avgActive90d)
                  )
                }
                sub={
                  viewMode === "rates"
                    ? t("accountRetentionFunnelFullChart.periodAvg")
                    : accountsLabel
                }
              />
              <KpiTile
                label={t("accountRetentionFunnelFullChart.bestCohort")}
                value={
                  bestCohort
                    ? moment(bestCohort.cohort_month, "YYYY-MM").format(
                        "MMM YYYY"
                      )
                    : "—"
                }
                sub={
                  bestCohort
                    ? `30D: ${viewMode === "rates" ? fmtPct(bestCohort.pct_30d) : fmtCount(bestCohort.active_at_30d)}`
                    : undefined
                }
              />
            </div>
          )}

          {/* Heatmap */}
          <div className="w-full py-2">
            {isAccountFunnelLoading ? (
              <div className="flex justify-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 dark:text-white" />
              </div>
            ) : isAccountFunnelError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : sortedData.length > 0 ? (
              <AccountRetentionHeatmap
                data={sortedData}
                viewMode={viewMode}
                showLegend
              />
            ) : (
              <p className="text-gray-500 text-sm">
                {t("common.noDataAvailable")}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountRetentionFunnelFullChartDialog;
