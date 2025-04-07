import { ArrowDown, ArrowUp } from "lucide-react";
import MarketHistoryChart from "./MarketHistoryChart";
import moment from "moment";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { useEffect, useState } from "react";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import { config } from "@/Config";

interface HeadBlockPropertyCardProps {
  header: string;
  isParamsHidden: boolean;
  handleHideParams: () => void;
}

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const CHART_UPDATE_INTERVAL = config.marketHistoryRefreshInterval;

const HeadBlockHiveChartCard: React.FC<HeadBlockPropertyCardProps> = ({
  header,
  isParamsHidden,
  handleHideParams,
}) => {
  const { settings } = useUserSettingsContext();

  const CURRENT_TIME = moment().format("YYYY-MM-DDTHH:mm:ss");
  const MARKET_HISTORY_TIME_PERIOD = moment()
    .subtract(30, "days")
    .format("YYYY-MM-DDTHH:mm:ss");

  const [marketHistoryStartDate, setMarketHistoryStartDate] = useState<string>(
    MARKET_HISTORY_TIME_PERIOD
  );
  const [marketHistoryEndDate, setMarketHistoryEndDate] =
    useState<string>(CURRENT_TIME);

  const { marketHistory } = useMarketHistory(
    MARKET_HISTORY_INTERVAL,
    marketHistoryStartDate,
    marketHistoryEndDate
  );

  // Hive chart market data updates
  useEffect(() => {
    if (!settings.liveData) return;

    const intervalId = setInterval(() => {
      setMarketHistoryStartDate(
        moment().subtract(30, "days").format("YYYY-MM-DDTHH:mm:ss")
      );
      setMarketHistoryEndDate(moment().format("YYYY-MM-DDTHH:mm:ss"));
    }, CHART_UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [settings.liveData]);

  return (
    <div
      className="bg-theme py-1 rounded-[6px] data-box-chart"
      data-testid="expandable-list"
      style={{ overflowX: "auto", width: "100%" }}
    >
      <div
        onClick={handleHideParams}
        className="h-full w-full flex items-center justify-between py-1 cursor-pointer px-1"
      >
        <div className="text-lg">{header}</div>
        <div>{isParamsHidden ? <ArrowDown /> : <ArrowUp />}</div>
      </div>

      <div
        hidden={isParamsHidden}
        data-testid="content-expandable-list"
      >
        <div>
          <MarketHistoryChart data={marketHistory} />
        </div>
      </div>
    </div>
  );
};

export default HeadBlockHiveChartCard;
