import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import Hive from "@/types/Hive";
import moment from "moment";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { colorMap } from "../balanceHistory/BalanceHistoryChart";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  const { t } = useI18n();

  if (active && payload && payload.length) {
    return (
      <div className="bg-buttonHover text-text p-2 rounded-xl">
        {payload.map(({ payload: { tooltipDate, close, volume } }) => {
          return (
            <div key={tooltipDate}>
              <p>
                {t("marketHistoryChart.date")}:{" "}
                {moment(tooltipDate).format("YYYY MMM D")}
              </p>
              <p>
                {t("marketHistoryChart.closePrice")}: ${close}
              </p>
              <p>
                {t("marketHistoryChart.volume")}:{" "}
                {volume.toLocaleString("en-US")} HIVE
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const calculateCloseHivePrice = (
  hive: Hive.MarketData | undefined,
  nonHive: Hive.MarketData | undefined
) => {
  if (!hive || !nonHive) return;
  const hiveClose = hive.close;
  const nonHiveClose = nonHive.close;

  return (nonHiveClose / hiveClose).toFixed(4);
};

interface MarketChartProps {
  data: Hive.MarketHistory | undefined;
  isFullChart?: boolean;
}
interface ChartData {
  date: string;
  close: string | undefined;
  volume: number;
  tooltipDate: string;
}

const MarketHistoryChart: React.FC<MarketChartProps> = ({
  data,
  isFullChart = false,
}) => {
  const { hiveChain } = useHiveChainContext();
  const { theme } = useTheme();
  const brushDefaults = useChartBrushDefaults();

  // locale subscription ensures the component re-renders on language switch
  // so tickFormatter picks up the new locale immediately.
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";

  const [chartData, setChartData] = useState<ChartData[] | undefined>(
    undefined
  );
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  // locale is intentionally NOT in the deps: dates are stored as raw ISO strings
  // and formatted by tickFormatter at render time, so no rebuild is needed on
  // locale change (avoids Recharts recalculating tick intervals on every switch).
  useEffect(() => {
    if (!data || !hiveChain) return;

    const filterData = data.buckets.map((bucket) => {
      const { hive, non_hive } = bucket;
      const hiveClosePrice = calculateCloseHivePrice(hive, non_hive);

      return {
        date: bucket.open, // raw ISO — formatted by tickFormatter
        tooltipDate: bucket.open, // raw ISO — formatted inline in CustomTooltip
        close: hiveClosePrice,
        volume: bucket.hive.volume,
      };
    });

    const min = Math.min(...filterData.map((d) => parseFloat(d.close ?? "")));
    const max = Math.max(...filterData.map((d) => parseFloat(d.close ?? "")));

    setChartData(filterData);
    setMinValue(min);
    setMaxValue(max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hiveChain]);

  const lastHivePrice = chartData?.[chartData.length - 1].close;
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  // Stable tick count: show ~6 ticks regardless of locale label widths.
  const tickInterval = chartData
    ? Math.max(1, Math.floor((chartData.length - 1) / 5))
    : "preserveStartEnd";

  return (
    <ResponsiveContainer width="100%" height={isFullChart ? 500 : 250}>
      <LineChart data={chartData} layout="horizontal">
        <XAxis
          dataKey="date"
          tickFormatter={(d) => moment(d).format("MMM D")}
          interval={tickInterval}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          dataKey="close"
          domain={[minValue, maxValue]}
          stroke={strokeColor}
          orientation={isRTL ? "right" : "left"}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          align={isRTL ? "right" : "left"}
          wrapperStyle={
            isRTL ? { right: 0, left: "auto" } : { left: 0, right: "auto" }
          }
        />
        <Line
          name={`${t("marketHistoryChart.hivePrice")}: $${lastHivePrice ?? 0}`}
          type="monotone"
          dataKey="close"
          stroke={colorMap.HIVE}
          dot={false}
          strokeWidth={2}
        />
        {isFullChart && <ChartBrushDefs />}
        {isFullChart && (
          <Brush
            {...brushDefaults}
            dataKey="date"
            tickFormatter={(d) => moment(d).format("MMM D")}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MarketHistoryChart;
