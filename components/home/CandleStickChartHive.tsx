import React from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import { colorMap } from "../balanceHistory/BalanceHistoryChart";
import { Props as BarShapeProps } from "recharts/types/cartesian/Bar";

interface CandleStickChartProps {
  data: Hive.MarketHistory | undefined;
}
type CandlestickProps = BarShapeProps & {
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
  low: number;
  high: number;
  openClose: [number, number];
};

const colors = {
  green: "#2ca02c",
  red: "#d62728",
};

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
        {payload.map(
          ({
            payload: { openTime, tooltipDate, high, low, openClose, volume },
          }) => {
            return (
              <div key={openTime}>
                <p>{`Open: $${openClose[0].toFixed(4)}`}</p>
                <p>{`Close $${openClose[1].toFixed(4)}`}</p>
                <p>{`High $${high.toFixed(4)}`}</p>
                <p>{`Low $${low.toFixed(4)}`}</p>
                <p>{`Volume: ${volume.toLocaleString("en-US")} HIVE`}</p>
                <p>{`Date: ${tooltipDate}`}</p>
              </div>
            );
          }
        )}
      </div>
    );
  }

  return null;
};

const Candlestick = (props: CandlestickProps) => {
  const {
    x,
    y,
    width,
    height,
    low,
    high,
    openClose: [open, close],
  } = props;

  const isGrowing = open < close;
  const color = isGrowing ? colors.green : colors.red;
  const ratio = Math.abs(height / (open - close));

  return (
    <g
      stroke={color}
      fill={color}
      strokeWidth="2"
    >
      <path
        d={`
          M ${x},${y}
          L ${x},${y + height}
          L ${x + width},${y + height}
          L ${x + width},${y}
          L ${x},${y}
        `}
      />
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - low) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - low) * ratio}
          `}
        />
      )}
      {isGrowing ? (
        <path
          d={`
            M ${x + width / 2}, ${y}
            v ${(close - high) * ratio}
          `}
        />
      ) : (
        <path
          d={`
            M ${x + width / 2}, ${y + height}
            v ${(open - high) * ratio}
          `}
        />
      )}
    </g>
  );
};

const prepareData = (data: Hive.MarketHistory | undefined) => {
  if (!data) return;

  return data.buckets.map(({ open: openTime, hive, non_hive }) => {
    const open = Number((non_hive.open / hive.open).toFixed(4));
    const close = Number((non_hive.close / hive.close).toFixed(4));
    const high = Number((non_hive.high / hive.high).toFixed(4));
    const low = Number((non_hive.low / hive.low).toFixed(4));
    const volume = hive.volume;
    return {
      openClose: [open, close],
      high,
      low,
      volume,
      tooltipDate: moment(openTime).format("YYYY MMM D"),
      openTime: moment(openTime).format("MMM D"),
    };
  });
};

const CustomShapeBarChart: React.FC<CandleStickChartProps> = ({ data }) => {
  const { theme } = useTheme();

  const chartData = prepareData(data);
  const minValue: number = Math.min(...chartData!.map((d) => d.low));
  const maxValue: number = Math.max(...chartData!.map((d) => d.high));

  const lastHivePrice = chartData?.[chartData.length - 1].openClose[1];
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  return (
    <ResponsiveContainer
      width="100%"
      height={500}
    >
      <BarChart data={chartData}>
        <XAxis
          dataKey="openTime"
          stroke={strokeColor}
        />
        <YAxis
          dataKey="openClose"
          domain={[minValue, maxValue]}
          stroke={strokeColor}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
        />
        <Bar
          name={`Hive Price: $${lastHivePrice ?? 0}`}
          dataKey="openClose"
          fill={colorMap.HIVE}
          shape={Candlestick}
        />
        <Brush
          data={chartData}
          dataKey="openTime"
          height={30}
          stroke={"var(--color-switch-off)"}
          fill="var(--color-background)"
          travellerWidth={10}
          className="text-xs"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomShapeBarChart;
