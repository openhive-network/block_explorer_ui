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

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-buttonHover text-text p-2 rounded-xl">
        {payload.map(({ payload: { tooltipDate, close, volume } }) => {
          return (
            <div key={tooltipDate}>
              <p>{`Date: ${tooltipDate}`}</p>
              <p>{`Close Price: $${close}`}</p>
              <p>{`Volume: ${volume.toLocaleString("en-US")} HIVE`}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const calculateCloseHivePrice = (
  hive: Hive.MarketData,
  nonHive: Hive.MarketData
) => {
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
  close: string;
  volume: number;
}

const MarketHistoryChart: React.FC<MarketChartProps> = ({
  data,
  isFullChart = false,
}) => {
  const { hiveChain } = useHiveChainContext();
  const { theme } = useTheme();

  const [chartData, setChartData] = useState<ChartData[] | undefined>(
    undefined
  );
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    if (!data || !hiveChain) return;

    const filterData = data.buckets.map((bucket) => {
      const { hive, non_hive } = bucket;
      const hiveClosePrice = calculateCloseHivePrice(hive, non_hive);

      return {
        date: moment(bucket.open).format("MMM D"),
        tooltipDate: moment(bucket.open).format("YYYY MMM D"),
        close: hiveClosePrice,
        volume: bucket.hive.volume,
      };
    });

    const min = Math.min(
      ...filterData?.map((d: ChartData) => parseFloat(d.close))
    );
    const max = Math.max(
      ...filterData?.map((d: ChartData) => parseFloat(d.close))
    );

    setChartData(filterData);
    setMinValue(min);
    setMaxValue(max);
  }, [data, hiveChain]);

  const lastHivePrice = chartData?.[chartData.length - 1].close;
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  return (
    <ResponsiveContainer
      width="100%"
      height={isFullChart ? 500 : 250}
    >
      <LineChart data={chartData}>
        <XAxis
          dataKey="date"
          stroke={strokeColor}
        />
        <YAxis
          dataKey="close"
          domain={[minValue, maxValue]}
          stroke={strokeColor}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
        />
        <Line
          name={`Hive Price: $${lastHivePrice ?? 0}`}
          type="monotone"
          dataKey="close"
          stroke={colorMap.HIVE}
          dot={false}
          strokeWidth={2}
        />
        {isFullChart && (
          <Brush
            data={data as any}
            dataKey="date"
            height={30}
            stroke="var(--color-switch-off)"
            fill="var(--color-background)"
            travellerWidth={10}
            className="text-xs"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MarketHistoryChart;
