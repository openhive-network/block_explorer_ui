import React, { useMemo } from "react";
import moment from "moment";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceDot,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";
import Hive from "@/types/Hive";
import { formatRc } from "./networkRcUtils";

const TOTAL_COLOR = "#6366f1";

interface NetworkRcUtilizationChartProps {
  data: Hive.NetworkRcUtilizationResponse[] | undefined;
  includeBrush?: boolean;
  onPointClick?: (period: string) => void;
  provisionalFrom?: string;
}

const NetworkRcUtilizationChart: React.FC<NetworkRcUtilizationChartProps> = ({
  data,
  includeBrush = false,
  onPointClick,
  provisionalFrom,
}) => {
  const { theme } = useTheme();
  const { dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const chartData = useMemo(
    () => (data ?? []).map((d) => ({ period: d.period, rc_total: d.rc_total })),
    [data]
  );

  const provisionalPoint = useMemo(
    () =>
      provisionalFrom
        ? chartData.find((d) => d.period >= provisionalFrom)
        : undefined,
    [chartData, provisionalFrom]
  );

  const formatY = (v: number) => formatRc(v, locale);
  const xTickFormatter = (value: string) => moment(value).format("MMM D");

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]"
      >
        <p className="text-gray-400 mb-0.5 text-center">
          {moment(label).format("MMM D, YYYY")}
        </p>
        <p className="font-semibold text-center" style={{ color: TOTAL_COLOR }}>
          {formatRc(payload[0].value ?? 0, locale)} RC
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        onClick={(state) => {
          const label = (state as { activeLabel?: string | number })
            ?.activeLabel;
          if (onPointClick && label != null) onPointClick(String(label));
        }}
        style={onPointClick ? { cursor: "pointer" } : undefined}
        margin={{
          top: 16,
          right: 6,
          left: 6,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <XAxis
          dataKey="period"
          tickFormatter={xTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={formatY}
          orientation={isRTL ? "right" : "left"}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="rc_total"
          stroke={TOTAL_COLOR}
          fill={TOTAL_COLOR}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={false}
        />
        {provisionalPoint && (
          <ReferenceDot
            x={provisionalPoint.period}
            y={provisionalPoint.rc_total}
            r={3.5}
            fill={theme === "dark" ? "#0f172a" : "#ffffff"}
            stroke={TOTAL_COLOR}
            strokeWidth={2}
            ifOverflow="extendDomain"
          />
        )}
        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush
            {...brushDefaults}
            dataKey="period"
            tickFormatter={xTickFormatter}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NetworkRcUtilizationChart;
