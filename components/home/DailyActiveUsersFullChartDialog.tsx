import React, { useState, useEffect } from "react";
import moment from "moment";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import useDailyActiveUsers from "@/hooks/api/homePage/useDailyActiveUsers";
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
  const [fromDate, setFromDate] = useState<Date | undefined>(
    moment().subtract(90, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | undefined>(moment().toDate());

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
    dailyActiveUsers,
    isDailyActiveUsersLoading,
    isDailyActiveUsersError,
  } = useDailyActiveUsers(fromDate, toDate, granularity, opType);

  const chartData = [...(dailyActiveUsers ?? [])].sort((a, b) =>
    a.period < b.period ? -1 : 1
  );

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(90);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const ninetyDaysAgo = moment().subtract(90, "days").toDate();
      const now = moment().toDate();
      setFromDate(ninetyDaysAgo);
      setToDate(now);
      setStartDate(ninetyDaysAgo);
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
    setFromDate(
      payloadStartDate ??
        (payloadFromBlock ? new Date(payloadFromBlock) : undefined)
    );
    setToDate(
      payloadEndDate ?? (payloadToBlock ? new Date(payloadToBlock) : undefined)
    );
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(90);
    setFromDate(moment().subtract(90, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("day");
    setOpType("all");
  };

  const handleGranularityChange = (value: Granularity) => {
    setGranularity(value);
    if (value === "day") {
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setLastTimeUnitValue(90);
      setFromDate(moment().subtract(90, "days").toDate());
      setToDate(moment().toDate());
    } else {
      setRangeSelectKey("none");
      setLastTimeUnitValue(undefined);
      setFromDate(undefined);
      setToDate(undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <DialogHeader>
            <div className="mb-4">
              <DialogTitle>{t("dailyActiveUsersFullChart.title")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex flex-wrap items-start gap-4 mb-4 w-full">
            {/* Granularity */}
            <div className="flex flex-col gap-y-3 w-[140px]">
              <Label>{t("dailyActiveUsersFullChart.granularity")}</Label>
              <Select
                value={granularity}
                onValueChange={(v) => handleGranularityChange(v as Granularity)}
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

            {/* Operation type */}
            <div className="flex flex-col gap-y-3 w-[160px]">
              <Label>{t("dailyActiveUsersFullChart.operationType")}</Label>
              <Select
                value={opType}
                onValueChange={(v) => setOpType(v as OpType)}
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

            {/* Date range */}
            <div className="flex-1 flex flex-col mb-4">
              <Label>{t("common.filters")}</Label>
              <div className="m-0 p-0">
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
              </div>
              <div className="flex items-end justify-start mt-2 gap-2">
                <Button
                  onClick={handleSearch}
                  data-testid="apply-filters"
                  disabled={isSearchButtonDisabled}
                >
                  {t("common.search")}
                </Button>
                <Button onClick={handleFilterClear} data-testid="clear-filters">
                  {t("common.clear")}
                </Button>
              </div>
            </div>
          </div>

          {/* Metric toggle */}
          <div className="flex gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text self-center mr-1">
              {t("dailyActiveUsersFullChart.metric")}:
            </span>
            {METRIC_OPTIONS.map(({ key, labelKey }) => (
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

          {/* Chart */}
          <div className="h-[55vh] w-full flex items-center justify-center">
            {isDailyActiveUsersLoading ? (
              <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
            ) : isDailyActiveUsersError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : chartData.length > 0 ? (
              <DailyActiveUsersChart
                data={chartData}
                metric={metric}
                includeBrush
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

export default DailyActiveUsersFullChartDialog;
