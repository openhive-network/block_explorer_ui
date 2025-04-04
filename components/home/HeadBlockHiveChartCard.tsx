import { ArrowDown, ArrowUp } from "lucide-react";
import MarketHistoryChart from "./MarketHistoryChart";
import moment from "moment";
import useMarketHistory from "@/hooks/common/useMarketHistory";

interface HeadBlockPropertyCardProps {
  header: string;
  isParamsHidden: boolean;
  handleHideParams: () => void;
}

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const CURRENT_TIME = moment().format("YYYY-MM-DDTHH:mm:ss");
const MARKET_HISTORY_TIME_PERIOD = moment()
  .subtract(30, "days")
  .format("YYYY-MM-DDTHH:mm:ss");

const HeadBlockHiveChartCard: React.FC<HeadBlockPropertyCardProps> = ({
  header,
  isParamsHidden,
  handleHideParams,
}) => {
  const { marketHistory } = useMarketHistory(
    MARKET_HISTORY_INTERVAL,
    MARKET_HISTORY_TIME_PERIOD,
    CURRENT_TIME
  );

  if (!marketHistory) return null;

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
