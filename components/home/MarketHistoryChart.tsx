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
import { Card, CardContent, CardHeader } from "../ui/card";
import { Loader2 } from "lucide-react";
import { colorMap } from "../balanceHistory/BalanceHistoryChart";

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
        {payload.map(({ payload: { date, avgPrice, volume } }) => {
          return (
            <div key={date}>
              <p>{`Date: ${date}`}</p>
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
  isLoading: boolean;
  strokeColor: string;
}
interface ChartData {
  date: string;
  avgPrice: string;
  volume: number;
}

const MarketHistoryChart: React.FC<MarketChartProps> = ({
  data,
  isLoading,
  strokeColor,
}) => {
  const { hiveChain } = useHiveChainContext();

  if (!data || !hiveChain) return;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
      </div>
    );
  }

  const chartData = data.buckets.map((bucket) => {
    const { hive, non_hive } = bucket;
    const hiveAveragePrice = calculateAvgHivePrice(hive, non_hive);

    return {
      date: moment(bucket.open).format("MMM D"),
      avgPrice: hiveAveragePrice,
      volume: bucket.hive.volume,
    };
  });

  const lastHivePrice = chartData[chartData.length - 1].avgPrice;

  const minValue = Math.min(
    ...chartData.map((d: ChartData) => parseFloat(d.avgPrice))
  );
  const maxValue = Math.max(
    ...chartData.map((d: ChartData) => parseFloat(d.avgPrice))
  );

  return (
    <Card className="mb-3">
      <CardHeader className="flex justify-between items-center  px-1 py-3">
        <h2 className="text-lg font-semibold">Hive Price Chart</h2>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer
          width="100%"
          height={300}
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
              name={`Hive Price: $${lastHivePrice}`}
              type="monotone"
              dataKey="avgPrice"
              stroke={colorMap.HIVE}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MarketHistoryChart;
