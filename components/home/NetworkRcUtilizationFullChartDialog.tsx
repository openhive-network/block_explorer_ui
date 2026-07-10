import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Download, X, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchRanges from "../searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import DataExport from "@/components/DataExport";
import { cn } from "@/lib/utils";
import NetworkRcUtilizationChart from "./NetworkRcUtilizationChart";
import NetworkRcUtilizationTreemap from "./NetworkRcUtilizationTreemap";
import NetworkRcUtilizationKpiStrip from "./NetworkRcUtilizationKpiStrip";
import useNetworkRcUtilization from "@/hooks/api/homePage/useNetworkRcUtilization";
import { useI18n } from "../../i18n/i18n";
import { spacesToUnderscores } from "@/utils/StringUtils";
import {
  RcGranularity,
  formatOpLabel,
  currentRcPeriodStart,
} from "./networkRcUtils";

interface NetworkRcUtilizationFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default 30-day window matching the card's query key (UTC-midnight start, open
// end) so opening the dialog reuses the card's cache instead of refetching.
const defaultRcFrom = () =>
  moment.utc(moment.utc().format("YYYY-MM-DD")).subtract(30, "days").toDate();

const NetworkRcUtilizationFullChartDialog: React.FC<
  NetworkRcUtilizationFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<RcGranularity>("day");
  const [includeClaims, setIncludeClaims] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    defaultRcFrom()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(undefined);

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const {
    networkRcUtilization,
    isNetworkRcUtilizationLoading,
    isNetworkRcUtilizationError,
  } = useNetworkRcUtilization(fromDate, toDate, granularity, isOpen);

  const chartData = useMemo(
    () =>
      [...(networkRcUtilization ?? [])].sort((a, b) =>
        a.period < b.period ? -1 : 1
      ),
    [networkRcUtilization]
  );

  // Clicking a point on the trend focuses the treemap on that single period.
  const treemapData = useMemo(() => {
    if (!selectedPeriod) return chartData;
    const one = chartData.filter((d) => d.period === selectedPeriod);
    return one.length ? one : chartData;
  }, [chartData, selectedPeriod]);

  const exportData = useMemo(() => {
    const opSet = new Set<string>();
    chartData.forEach((d) =>
      Object.keys(d.by_label ?? {}).forEach((op) => opSet.add(op))
    );
    const ops = [...opSet];
    return chartData.map((d) => {
      const row: Record<string, string | number> = {
        [t("common.date")]: d.period,
        [t("networkRcUtilizationCard.totalRc")]: d.rc_total,
      };
      ops.forEach((op) => {
        row[formatOpLabel(op)] = d.by_label?.[op] ?? 0;
      });
      return row;
    });
  }, [chartData, t]);

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();
      const now = moment().toDate();
      setFromDate(defaultRcFrom());
      setToDate(undefined);
      setStartDate(thirtyDaysAgo);
      setEndDate(now);
      setGranularity("day");
      setIncludeClaims(false);
      setSelectedPeriod(null);
    }
  }, [
    isOpen,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setStartDate,
    setEndDate,
  ]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);
    setSelectedPeriod(null);
  };

  const handleFilterClear = () => {
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const now = moment().toDate();
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(defaultRcFrom());
    setToDate(undefined);
    setStartDate(thirtyDaysAgo);
    setEndDate(now);
    setGranularity("day");
    setSelectedPeriod(null);
  };

  const provisionalFrom = currentRcPeriodStart(granularity);
  const hasProvisional =
    chartData.length > 0 &&
    chartData[chartData.length - 1].period >= provisionalFrom;

  const hasData = chartData.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("networkRcUtilizationFullChartDialog.title")}
            subtitle={t("networkRcUtilizationFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.networkRcUtilizationName")
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

          <div className="report-filters mb-5">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex w-[140px] flex-col gap-y-2">
                <Label>
                  {t("networkRcUtilizationFullChartDialog.granularity")}
                </Label>
                <Select
                  value={granularity}
                  onValueChange={(v) => {
                    setGranularity(v as RcGranularity);
                    setSelectedPeriod(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t("common.daily")}</SelectItem>
                    <SelectItem value="week">{t("common.weekly")}</SelectItem>
                    <SelectItem value="month">{t("common.monthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-w-[260px] flex-1 flex-col gap-y-2">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={handleSearch}
                    data-testid="apply-filters"
                    disabled={isSearchButtonDisabled}
                  >
                    {t("common.search")}
                  </Button>
                  <Button
                    onClick={handleFilterClear}
                    data-testid="clear-filters"
                  >
                    {t("common.clear")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          {!isNetworkRcUtilizationLoading &&
            !isNetworkRcUtilizationError &&
            hasData && (
              <NetworkRcUtilizationKpiStrip
                data={chartData}
                granularity={granularity}
              />
            )}

          <ul className="mb-3 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
            <li className="flex gap-1.5">
              <span className="shrink-0">–</span>
              <span>{t("networkRcUtilizationCard.estimateNote")}</span>
            </li>
            <li className="flex gap-1.5">
              <span className="shrink-0">–</span>
              <span>{t("networkRcUtilizationCard.unitsHint")}</span>
            </li>
          </ul>

          {isNetworkRcUtilizationLoading ? (
            <div className="flex h-[55vh] items-center justify-center">
              <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
            </div>
          ) : isNetworkRcUtilizationError ? (
            <p className="text-red-500 text-sm py-10 text-center">
              {t("common.errorLoadingData")}
            </p>
          ) : !hasData ? (
            <p className="text-gray-500 text-sm py-10 text-center">
              {t("common.noDataAvailable")}
            </p>
          ) : (
            <>
              {/* Total RC over time */}
              <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {t("networkRcUtilizationFullChartDialog.trendTitle")}
              </h3>
              <div className="h-[32vh] w-full">
                <NetworkRcUtilizationChart
                  data={chartData}
                  includeBrush
                  onPointClick={setSelectedPeriod}
                  provisionalFrom={hasProvisional ? provisionalFrom : undefined}
                />
              </div>
              {hasProvisional && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {t("networkRcUtilizationFullChartDialog.partialNote")}
                </p>
              )}

              {/* RC by operation (treemap) */}
              <div className="mt-4 mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("networkRcUtilizationFullChartDialog.breakdownTitle")}
                  </h3>
                  {selectedPeriod ? (
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod(null)}
                      className="inline-flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-500 hover:bg-indigo-500/20"
                    >
                      {moment(selectedPeriod).format(
                        granularity === "month" ? "MMM YYYY" : "MMM D, YYYY"
                      )}
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      {t("networkRcUtilizationFullChartDialog.clickHint")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeClaims((v) => !v)}
                  aria-pressed={includeClaims}
                  aria-label={t("networkRcUtilizationFullChartDialog.claims")}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px] font-medium transition-colors",
                    includeClaims
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                >
                  {includeClaims ? <Eye size={12} /> : <EyeOff size={12} />}
                  {includeClaims
                    ? t("networkRcUtilizationFullChartDialog.excludeClaims")
                    : t("networkRcUtilizationFullChartDialog.includeClaims")}
                </button>
              </div>
              <p className="mb-1 text-[10px] text-gray-400">
                {t(
                  includeClaims
                    ? "networkRcUtilizationFullChartDialog.pctOfAll"
                    : "networkRcUtilizationFullChartDialog.pctOfOrganic"
                )}
              </p>
              <div className="h-[46vh] w-full">
                <NetworkRcUtilizationTreemap
                  data={treemapData}
                  includeClaims={includeClaims}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkRcUtilizationFullChartDialog;
