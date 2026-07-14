import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
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
import DailyActiveUsersChart, { DauMetric } from "./DailyActiveUsersChart";
import DauStackedChart from "./DauStackedChart";
import DauKpiStrip from "./DauKpiStrip";
import useDailyActiveUsers from "@/hooks/api/homePage/useDailyActiveUsers";
import useDauBreakdown from "@/hooks/api/homePage/useDauBreakdown";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";

type Granularity = "day" | "week" | "month";
type OpType = "all" | "post" | "comment" | "vote" | "transfer" | "custom_json";

const METRIC_OPTIONS: { key: DauMetric; labelKey: string }[] = [
  { key: "active_accounts", labelKey: "dailyActiveUsersCard.activeAccounts" },
  { key: "operations", labelKey: "dailyActiveUsersCard.operations" },
  { key: "both", labelKey: "dailyActiveUsersFullChart.both" },
];

const OP_TYPE_OPTIONS: { key: OpType; labelKey: string }[] = [
  { key: "all", labelKey: "dailyActiveUsersFullChart.all" },
  { key: "post", labelKey: "dailyActiveUsersFullChart.post" },
  { key: "comment", labelKey: "dailyActiveUsersFullChart.comment" },
  { key: "vote", labelKey: "dailyActiveUsersFullChart.vote" },
  { key: "transfer", labelKey: "dailyActiveUsersFullChart.transfer" },
  { key: "custom_json", labelKey: "dailyActiveUsersFullChart.customJson" },
];

interface DailyActiveUsersFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailyActiveUsersFullChartDialog: React.FC<
  DailyActiveUsersFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<Granularity>("day");
  const [opType, setOpType] = useState<OpType>("all");
  const [metric, setMetric] = useState<DauMetric>("active_accounts");
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment().toDate()
  );

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const isStackedMode = opType === "all" && metric === "operations";

  const {
    dailyActiveUsers,
    isDailyActiveUsersLoading,
    isDailyActiveUsersError,
  } = useDailyActiveUsers(
    fromDate,
    toDate,
    granularity,
    opType === "all" ? undefined : opType,
    isOpen
  );

  const { breakdownData, isBreakdownLoading, isBreakdownError } =
    useDauBreakdown(fromDate, toDate, granularity, isOpen && isStackedMode);

  const chartData = useMemo(
    () =>
      [...(dailyActiveUsers ?? [])].sort((a, b) =>
        a.period < b.period ? -1 : 1
      ),
    [dailyActiveUsers]
  );

  const exportData = useMemo(
    () =>
      chartData.map((d) => ({
        [t("common.date")]: d.period,
        [t("dailyActiveUsersCard.activeAccounts")]: d.active_accounts,
        [t("dailyActiveUsersCard.operations")]: d.operations,
      })),
    [chartData, t]
  );

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();
      const now = moment().toDate();
      setFromDate(thirtyDaysAgo);
      setToDate(now);
      setStartDate(thirtyDaysAgo);
      setEndDate(now);
      setGranularity("day");
      setOpType("all");
      setMetric("active_accounts");
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
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("day");
    setOpType("all");
  };

  const handleGranularityChange = (value: Granularity) => {
    setGranularity(value);
  };

  const isLoading = isStackedMode
    ? isBreakdownLoading
    : isDailyActiveUsersLoading;
  const isError = isStackedMode ? isBreakdownError : isDailyActiveUsersError;
  const hasData = isStackedMode
    ? breakdownData.length > 0
    : chartData.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("dailyActiveUsersFullChart.title")}
            subtitle={t("dailyActiveUsersFullChart.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.dailyActiveUsersName")
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
              <div className="flex flex-col gap-y-3 w-[140px]">
                <Label>{t("dailyActiveUsersFullChart.granularity")}</Label>
                <Select
                  value={granularity}
                  onValueChange={(v) =>
                    handleGranularityChange(v as Granularity)
                  }
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

              <div className="flex flex-col gap-y-3 w-[160px]">
                <Label>{t("dailyActiveUsersFullChart.operationType")}</Label>
                <Select
                  value={opType}
                  onValueChange={(v) => {
                    const next = v as OpType;
                    setOpType(next);
                    if (next === "all" && metric === "both") {
                      setMetric("active_accounts");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OP_TYPE_OPTIONS.map(({ key, labelKey }) => (
                      <SelectItem key={key} value={key}>
                        {t(labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-y-3 flex-1 min-w-[260px]">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
                <div className="flex gap-2 mt-2">
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

          {/* Metric toggle */}
          <div className="flex gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text self-center mr-1">
              {t("dailyActiveUsersFullChart.metric")}:
            </span>
            {METRIC_OPTIONS.filter(
              ({ key }) => !(opType === "all" && key === "both")
            ).map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                  metric === key
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* KPI strip */}
          {!isLoading && !isError && chartData.length > 0 && (
            <DauKpiStrip
              data={chartData}
              granularity={granularity}
              trendMetric={
                metric === "operations" ? "operations" : "active_accounts"
              }
            />
          )}

          {/* Chart */}
          <div className="h-[55vh] w-full flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
            ) : isError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : hasData ? (
              isStackedMode ? (
                <DauStackedChart
                  data={breakdownData}
                  allData={chartData}
                  includeBrush
                />
              ) : (
                <DailyActiveUsersChart
                  data={chartData}
                  metric={metric}
                  includeBrush
                />
              )
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

export default DailyActiveUsersFullChartDialog;
