import { useState, useMemo } from "react";
import { Loader2, Download } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { Dialog, DialogContent } from "../ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
import MarketHistoryChart from "./MarketHistoryChart";
import DateTimePicker from "../DateTimePicker";
import CustomShapeBarChart from "./CandleStickChartHive";

interface HiveFullChartDialogProps {
  isOpen: boolean;
  handleHiveFullChartVisibility: () => void;
}

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const DEFAULT_FULL_CHART_HISTORY_PERIOD = 30; //days

function subtractDaysFromDate(currentDate: Date, daysToSubtract: number) {
  daysToSubtract = daysToSubtract || 0;

  const pastDate = new Date(currentDate);

  pastDate.setDate(pastDate.getDate() - daysToSubtract);

  return pastDate;
}

const HiveFullChartDialog: React.FC<HiveFullChartDialogProps> = ({
  isOpen,
  handleHiveFullChartVisibility,
}) => {
  const { t } = useI18n();
  const [activeChartTab, setActiveChartTab] = useState<"candle" | "line">(
    "candle"
  );

  const chartOptions: { value: "candle" | "line"; label: string }[] = [
    { value: "candle", label: t("hiveFullChartDialog.candle") },
    { value: "line", label: t("hiveFullChartDialog.line") },
  ];

  const currentTime = new Date();
  const marketHistoryTimePeriod = subtractDaysFromDate(
    currentTime,
    DEFAULT_FULL_CHART_HISTORY_PERIOD
  );

  const [marketHistoryStartDate, setMarketHistoryStartDate] = useState<Date>(
    marketHistoryTimePeriod
  );
  const [marketHistoryEndDate, setMarketHistoryEndDate] =
    useState<Date>(currentTime);

  const { marketHistory, isMarketHistoryLoading } = useMarketHistory(
    MARKET_HISTORY_INTERVAL,
    marketHistoryStartDate.toISOString().slice(0, 19),
    marketHistoryEndDate.toISOString().slice(0, 19)
  );

  // No live rolling window here on purpose: these two dates are the pickers'
  // own state, so advancing them would discard the range and zoom the user set.

  const exportData = useMemo(
    () =>
      (marketHistory?.buckets ?? []).map((b) => ({
        [t("common.date")]: b.open,
        [t("hiveFullChartDialog.hiveOpen")]: b.hive.open,
        [t("hiveFullChartDialog.hiveHigh")]: b.hive.high,
        [t("hiveFullChartDialog.hiveLow")]: b.hive.low,
        [t("hiveFullChartDialog.hiveClose")]: b.hive.close,
        [t("hiveFullChartDialog.hiveVolume")]: b.hive.volume,
        [t("hiveFullChartDialog.hbdOpen")]: b.non_hive.open,
        [t("hiveFullChartDialog.hbdHigh")]: b.non_hive.high,
        [t("hiveFullChartDialog.hbdLow")]: b.non_hive.low,
        [t("hiveFullChartDialog.hbdClose")]: b.non_hive.close,
        [t("hiveFullChartDialog.hbdVolume")]: b.non_hive.volume,
      })),
    [marketHistory, t]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleHiveFullChartVisibility}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("hiveFullChartDialog.title")}
            subtitle={t("hiveFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.hivePriceChartName")
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

          <div className="report-filters mb-4">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-y-1">
                <Label>{t("hiveFullChartDialog.startDate")}</Label>
                <DateTimePicker
                  date={marketHistoryStartDate}
                  setDate={setMarketHistoryStartDate}
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label>{t("hiveFullChartDialog.endDate")}</Label>
                <DateTimePicker
                  date={marketHistoryEndDate}
                  setDate={setMarketHistoryEndDate}
                />
              </div>
            </div>
          </div>

          {!marketHistory && isMarketHistoryLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <Loader2 className="animate-spin h-12 w-12 dark:text-white" />
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text mr-1">
                  {t("common.view")}:
                </span>
                {chartOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setActiveChartTab(o.value)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                      activeChartTab === o.value
                        ? "bg-indigo-500 text-white"
                        : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {activeChartTab === "candle" ? (
                <CustomShapeBarChart data={marketHistory} />
              ) : (
                <MarketHistoryChart data={marketHistory} isFullChart={true} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HiveFullChartDialog;
