import { ArrowDown, ArrowUp } from "lucide-react";
import MarketHistoryChart from "./MarketHistoryChart";
import moment from "moment";
import useMarketHistory from "@/hooks/common/useMarketHistory";
import { useEffect, useState } from "react";
import { config } from "@/Config";
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

interface HeadBlockPropertyCardProps {
  header: string;
  isParamsHidden: boolean;
  handleHideParams: () => void;
  handleHiveFullChartVisibility: () => void;
}

const MARKET_HISTORY_INTERVAL = 86400; // 1 day
const CHART_UPDATE_INTERVAL = config.marketHistoryRefreshInterval;

const HeadBlockHiveChartCard: React.FC<HeadBlockPropertyCardProps> = ({
  header,
  isParamsHidden,
  handleHideParams,
  handleHiveFullChartVisibility,
}) => {
  const { settings } = useSettings();
  const { t } = useI18n();

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
      className="bg-theme rounded-[6px] data-box-chart mb-1"
      data-testid="expandable-list"
      style={{ overflowX: "auto", width: "100%", padding: "5px 8px" }}
    >
      <div
        onClick={handleHideParams}
        className="h-full w-full flex items-center justify-between cursor-pointer px-1"
      >
        <span className="text-base font-medium truncate min-w-0">{header}</span>
        <div className="flex items-center gap-3 shrink-0">
          {!isParamsHidden && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleHiveFullChartVisibility();
              }}
              className="text-sm underline text-link"
            >
              {t("common.fullChart")}
            </button>
          )}
          {isParamsHidden ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </div>
      </div>

      <div hidden={isParamsHidden} data-testid="content-expandable-list">
        <MarketHistoryChart data={marketHistory} />
      </div>
    </div>
  );
};

export default HeadBlockHiveChartCard;
