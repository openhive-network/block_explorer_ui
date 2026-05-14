import { useTheme } from "@/contexts/ThemeContext";
import moment from "moment";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { useI18n } from "../../i18n/i18n";

interface HpMomentumChartPoint {
  date: Date | string;
  power_up_hp: number;
  power_down_hp: number;
  net_hp: number;
}

interface HpMomentumChartProps {
  data: HpMomentumChartPoint[] | undefined;
  tickCount?: number;
  dateFormat?: string;
}

const HpMomentumChart: React.FC<HpMomentumChartProps> = ({
  data,
  tickCount,
  dateFormat,
}) => {
  const { theme } = useTheme();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const chartData = useMemo(() => data ?? [], [data]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (active && payload && payload.length) {
      const { date, power_up_hp, power_down_hp, net_hp } = payload[0].payload;

      return (
        <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
          <p className="text-gray-400 mb-0.5 text-center">
            {dateFormat
              ? moment(date).format(dateFormat)
              : moment(date).format("MMM D, YYYY")}
          </p>
          <div className="grid grid-cols-1 gap-x-3 gap-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-[0.6rem] text-gray-500 uppercase">
                {t("hpMomentumChart.poweredUp")}
              </span>
              <span className="font-semibold text-right text-emerald-500">
                +{power_up_hp.toLocaleString(undefined, { maximumFractionDigits: 0 })} HP
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[0.6rem] text-gray-500 uppercase">
                {t("hpMomentumChart.poweredDown")}
              </span>
              <span className="font-semibold text-right text-rose-500">
                -{power_down_hp.toLocaleString(undefined, { maximumFractionDigits: 0 })} HP
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t pt-1 dark:border-gray-700">
              <span className="text-[0.6rem] text-gray-500 uppercase">
                {t("hpMomentumChart.netFlow")}
              </span>
              <span
                className={`font-semibold text-right ${
                  net_hp >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {net_hp >= 0 ? "+" : ""}
                {net_hp.toLocaleString(undefined, { maximumFractionDigits: 0 })} HP
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (tickValue: number) => {
    const abs = Math.abs(tickValue);
    const sign = tickValue < 0 ? "-" : "";
    if (abs >= 1000000) {
      return (
        sign +
        (abs / 1000000).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        }) +
        "M"
      );
    }
    if (abs >= 1000) {
      return (
        sign +
        (abs / 1000).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        }) +
        "k"
      );
    }
    return tickValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const xAxisTickFormatter = (value: any) =>
    moment(value).format(dateFormat ? dateFormat : "MMM D");

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: isRTL ? 10 : 0,
          left: isRTL ? 0 : 10,
          bottom: 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickCount={tickCount}
          tickFormatter={xAxisTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          tickCount={tickCount}
          style={{ fontSize: "13px" }}
          stroke={strokeColor}
          tickFormatter={formatYAxis}
          orientation={isRTL ? "right" : "left"}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          align={isRTL ? "right" : "left"}
        />
        <ReferenceLine y={0} stroke={strokeColor} strokeDasharray="3 3" />
        <Line
          name={t("hpMomentumChart.netFlow")}
          type="monotone"
          dataKey="net_hp"
          stroke="#3B82F6"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HpMomentumChart;
export type { HpMomentumChartPoint };
