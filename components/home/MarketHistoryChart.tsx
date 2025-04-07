import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
        {payload.map(({ payload: { tooltipDate, avgPrice, volume } }) => {
          return (
            <div key={tooltipDate}>
              <p>{`Date: ${tooltipDate}`}</p>
              <p>{`Average Price: $${avgPrice}`}</p>
              <p>{`Volume: ${volume.toLocaleString("en-US")} HIVE`}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

// Using volume to calculate the average daily price of HIVE
const calculateAvgHivePrice = (
  hive: Hive.MarketData,
  nonHive: Hive.MarketData
) => {
  const hiveVolume = hive.volume;
  const nonHiveVolume = nonHive.volume;

  return (nonHiveVolume / hiveVolume).toFixed(4);
};

interface MarketChartProps {
  data: Hive.MarketHistory | undefined;
}
interface ChartData {
  date: string;
  avgPrice: string;
  volume: number;
}

const MarketHistoryChart: React.FC<MarketChartProps> = ({ data }) => {
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
      const hiveAveragePrice = calculateAvgHivePrice(hive, non_hive);

      return {
        date: moment(bucket.open).format("MMM D"),
        tooltipDate: moment(bucket.open).format("YYYY MMM D"),
        avgPrice: hiveAveragePrice,
        volume: bucket.hive.volume,
      };
    });

    const min = Math.min(
      ...filterData?.map((d: ChartData) => parseFloat(d.avgPrice))
    );
    const max = Math.max(
      ...filterData?.map((d: ChartData) => parseFloat(d.avgPrice))
    );

    setChartData(filterData);
    setMinValue(min);
    setMaxValue(max);
  }, [data, hiveChain]);

  const lastHivePrice = chartData?.[chartData.length - 1].avgPrice;
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  return (
    <ResponsiveContainer
      width="100%"
      height={250}
    >
      <LineChart data={chartData}>
        <XAxis
          dataKey="date"
          stroke={strokeColor}
        />
        <YAxis
          dataKey="avgPrice"
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
          dataKey="avgPrice"
          stroke={colorMap.HIVE}
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MarketHistoryChart;
