import { useState, useEffect, useMemo } from "react";
import { Loader2, Download } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import { config } from "@/Config";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { Dialog, DialogContent } from "../ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import DataExport from "@/components/DataExport";
import MarketHistoryChart from "./MarketHistoryChart";
import DateTimePicker from "../DateTimePicker";
import CustomShapeBarChart from "./CandleStickChartHive";
import { useSettings } from "@/contexts/SettingsContext";

interface HiveFullChartDialogProps {
  isOpen: boolean;
  handleHiveFullChartVisibility: () => void;
}

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const CHART_UPDATE_INTERVAL = config.marketHistoryRefreshInterval;
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
  const { settings } = useSettings();
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

  // Hive chart market data updates
  useEffect(() => {
    if (!settings.liveData) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const chartHistoryPeriod = subtractDaysFromDate(
        now,
        DEFAULT_FULL_CHART_HISTORY_PERIOD
      );

      setMarketHistoryStartDate(chartHistoryPeriod);
      setMarketHistoryEndDate(now);
    }, CHART_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [settings.liveData]);

  const exportData = useMemo(
    () =>
      (marketHistory?.buckets ?? []).map((b) => ({
        period: b.open,
        hive_open: b.hive.open,
        hive_high: b.hive.high,
        hive_low: b.hive.low,
        hive_close: b.hive.close,
        hive_volume: b.hive.volume,
        non_hive_open: b.non_hive.open,
        non_hive_high: b.non_hive.high,
        non_hive_low: b.non_hive.low,
        non_hive_close: b.non_hive.close,
        non_hive_volume: b.non_hive.volume,
      })),
    [marketHistory]
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
                filename="hive_market_history.csv"
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
