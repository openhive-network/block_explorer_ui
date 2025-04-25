import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import { Dialog, DialogContent } from "../ui/dialog";
import MarketHistoryChart from "./MarketHistoryChart";
import DateTimePicker from "../DateTimePicker";
import CustomShapeBarChart from "./CandleStickChartHive";

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
  const { settings } = useUserSettingsContext();
  const [activeChartTab, setActiveChartTab] = useState("candle");

  const handleTabChange = (value: string) => {
    setActiveChartTab(value);
  };

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleHiveFullChartVisibility}
    >
      <DialogContent className="min-w-[70vw] min-h-[60vh]">
        {!marketHistory && isMarketHistoryLoading ? (
          <div className="flex justify-center text-center items-center">
            <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3 ..." />
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <label>Start Date</label>
                <DateTimePicker
                  date={marketHistoryStartDate}
                  setDate={setMarketHistoryStartDate}
                />
              </div>
              <div>
                <label>End Date</label>
                <DateTimePicker
                  date={marketHistoryEndDate}
                  setDate={setMarketHistoryEndDate}
                />
              </div>
            </div>
            <Tabs
              value={activeChartTab}
              onValueChange={handleTabChange}
              className="flex-col w-full"
            >
              <TabsList className="flex w-full justify-end p-0">
                <div className="bg-theme p-1 flex rounded w-auto">
                  <TabsTrigger
                    className="rounded cursor-pointer hover:bg-buttonHover"
                    value="candle"
                  >
                    Candle
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded cursor-pointer hover:bg-buttonHover"
                    value="line"
                  >
                    Line
                  </TabsTrigger>
                </div>
              </TabsList>
              <TabsContent value="candle">
                <CustomShapeBarChart data={marketHistory} />
              </TabsContent>
              <TabsContent value="line">
                <MarketHistoryChart
                  data={marketHistory}
                  isFullChart={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HiveFullChartDialog;
