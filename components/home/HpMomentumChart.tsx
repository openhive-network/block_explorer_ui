import { useTheme } from "@/contexts/ThemeContext";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Line,
  Brush,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import { HpMomentumChartPoint, VESTING_COLORS } from "./hpMomentumUtils";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

interface HpMomentumChartProps {
  data: HpMomentumChartPoint[] | undefined;
  unit: "hp" | "vests";
  tickCount?: number;
  dateFormat?: string;
  includeBrush?: boolean;
  showYear?: boolean;
  showLegend?: boolean;
  defaultHiddenKeys?: string[];
}

const COLOR_UP = VESTING_COLORS.up;
const COLOR_DOWN_FILL = VESTING_COLORS.downFill;
const COLOR_DOWN_INIT = VESTING_COLORS.downInit;
const COLOR_NET = VESTING_COLORS.net;
const COLOR_TREND = "#4b5563";

// Linear regression on the net series — fits `y = m·i + b` so the "Trend"
// line summarises whether the user is net-staking or net-unstaking over the
// visible window.
const computeTrend = (values: number[]): number[] => {
  const n = values.length;
  if (n < 2) return values.map(() => 0);
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) {
    const mean = sumY / n;
    return values.map(() => mean);
  }
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return values.map((_, i) => slope * i + intercept);
};

interface BarPoint extends HpMomentumChartPoint {
  // Bar values are null on zero months so minPointSize doesn't paint a stray
  // sliver; power_down_fill is negated so it renders below zero.
  power_up_bar: number | null;
  power_down_fill_neg: number | null;
  trend: number;
}

const HpMomentumChart: React.FC<HpMomentumChartProps> = ({
  data,
  unit,
  tickCount,
  dateFormat,
  includeBrush = false,
  showYear = false,
  showLegend = true,
  defaultHiddenKeys = ["power_down_init"],
}) => {
  const { theme } = useTheme();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const unitLabel = unit === "hp" ? "HP" : "VESTS";
  const brushDefaults = useChartBrushDefaults();

  const [hiddenDataKeys, setHiddenDataKeys] =
    useState<string[]>(defaultHiddenKeys);

  const chartData = useMemo<BarPoint[]>(() => {
    if (!data || data.length === 0) return [];
    const netValues = data.map((d) => d.net);
    const trend = computeTrend(netValues);
    return data.map((row, i) => ({
      ...row,
      power_up_bar: row.power_up > 0 ? row.power_up : null,
      power_down_fill_neg:
        row.power_down_fill > 0 ? -row.power_down_fill : null,
      trend: trend[i],
    }));
  }, [data]);

  const formatAmount = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || !payload.length) return null;
    const {
      date,
      power_up,
      power_down_fill,
      power_down_init,
      net,
      power_up_count,
      power_down_init_count,
      power_down_fill_count,
    } = payload[0].payload as BarPoint;

    return (
      <div className="bg-theme rounded shadow-sm py-1.5 px-2 text-[0.6rem] min-w-[180px]">
        <p className="text-gray-400 mb-0.5 text-center">
          {showYear
            ? moment(date).format("YYYY")
            : dateFormat
              ? moment(date).format(dateFormat)
              : moment(date).format("MMM D, YYYY")}
        </p>
        <div className="grid grid-cols-1 gap-y-1">
          <div className="flex justify-between gap-3">
            <span className="text-[0.6rem] text-gray-500 uppercase">
              {t("hpMomentumChart.poweredUp")}
            </span>
            <span
              className="font-semibold text-right"
              style={{ color: COLOR_UP }}
            >
              +{formatAmount(power_up)} {unitLabel}
              {power_up_count !== undefined && (
                <span className="text-gray-400 font-normal">
                  {" "}
                  ({power_up_count.toLocaleString()})
                </span>
              )}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[0.6rem] text-gray-500 uppercase">
              {t("hpMomentumChart.poweredDown")}
            </span>
            <span
              className="font-semibold text-right"
              style={{ color: COLOR_DOWN_FILL }}
            >
              -{formatAmount(power_down_fill)} {unitLabel}
              {power_down_fill_count !== undefined && (
                <span className="text-gray-400 font-normal">
                  {" "}
                  ({power_down_fill_count.toLocaleString()})
                </span>
              )}
            </span>
          </div>
          {power_down_init > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-[0.6rem] text-gray-500 uppercase">
                {t("hpMomentumChart.scheduledDown")}
              </span>
              <span
                className="font-semibold text-right"
                style={{ color: COLOR_DOWN_INIT }}
              >
                {formatAmount(power_down_init)} {unitLabel}
                {power_down_init_count !== undefined && (
                  <span className="text-gray-400 font-normal">
                    {" "}
                    ({power_down_init_count.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t pt-1 dark:border-gray-700">
            <span className="text-[0.6rem] text-gray-500 uppercase">
              {t("hpMomentumChart.netFlow")}
            </span>
            <span
              className="font-semibold text-right"
              style={{
                color: net >= 0 ? COLOR_UP : COLOR_DOWN_FILL,
              }}
            >
              {net >= 0 ? "+" : ""}
              {formatAmount(net)} {unitLabel}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const formatYAxis = (tickValue: number) => {
    const abs = Math.abs(tickValue);
    const sign = tickValue < 0 ? "-" : "";
    if (abs >= 1_000_000_000)
      return `${sign}${(abs / 1_000_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })}B`;
    if (abs >= 1_000_000)
      return `${sign}${(abs / 1_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })}M`;
    if (abs >= 1000)
      return `${sign}${(abs / 1000).toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}k`;
    return tickValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const xAxisTickFormatter = (value: any) =>
    moment(value).format(showYear ? "YYYY" : dateFormat ? dateFormat : "MMM D");

  const handleLegendClick = (event: any) => {
    const dataKey = event.dataKey as string;
    setHiddenDataKeys((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey]
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        stackOffset="sign"
        margin={{
          top: 5,
          right: isRTL ? 8 : 4,
          left: isRTL ? 4 : 0,
          bottom: includeBrush ? 46 : 0,
        }}
      >
        {includeBrush && <ChartBrushDefs />}
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
          width={44}
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={formatYAxis}
          orientation={isRTL ? "right" : "left"}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.06 }} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{
              fontSize: "10px",
              cursor: "pointer",
              textAlign: "center",
              width: "100%",
              left: 0,
              bottom: 0,
              paddingInline: 8,
              boxSizing: "border-box",
            }}
            onClick={handleLegendClick}
          />
        )}
        <ReferenceLine y={0} stroke={strokeColor} strokeWidth={1} />
        <Bar
          name={t("hpMomentumChart.poweredUp")}
          dataKey="power_up_bar"
          stackId="flow"
          fill={COLOR_UP}
          radius={[2, 2, 0, 0]}
          // Keep a small bar visible even when dwarfed by the opposite flow (the
          // net-flow line keeps the axis large, so small bars go sub-pixel).
          minPointSize={3}
          hide={hiddenDataKeys.includes("power_up_bar")}
        />
        <Bar
          name={t("hpMomentumChart.poweredDown")}
          dataKey="power_down_fill_neg"
          stackId="flow"
          fill={COLOR_DOWN_FILL}
          radius={[0, 0, 2, 2]}
          minPointSize={3}
          hide={hiddenDataKeys.includes("power_down_fill_neg")}
        />
        <Line
          name={t("hpMomentumChart.scheduledDown")}
          type="monotone"
          dataKey="power_down_init"
          stroke={COLOR_DOWN_INIT}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenDataKeys.includes("power_down_init")}
        />
        <Line
          name={t("hpMomentumChart.netFlow")}
          type="monotone"
          dataKey="net"
          stroke={COLOR_NET}
          strokeWidth={1.75}
          dot={{ r: 2, fill: COLOR_NET }}
          activeDot={{ r: 4 }}
          hide={hiddenDataKeys.includes("net")}
        />
        <Line
          name={t("hpMomentumChart.trend")}
          type="linear"
          dataKey="trend"
          stroke={COLOR_TREND}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          activeDot={false}
          hide={hiddenDataKeys.includes("trend")}
        />
        {includeBrush && (
          <Brush
            dataKey="date"
            tickFormatter={xAxisTickFormatter}
            {...brushDefaults}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default HpMomentumChart;
