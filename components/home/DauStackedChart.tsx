import { useTheme } from "@/contexts/ThemeContext";
import moment from "moment";
import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import { DauBreakdownPoint } from "@/hooks/api/homePage/useDauBreakdown";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";
import Hive from "@/types/Hive";

type DauStackedPoint = DauBreakdownPoint & { other: number };

interface DauStackedChartProps {
  data: DauBreakdownPoint[];
  allData?: Hive.DailyActiveUsersResponse[];
  includeBrush?: boolean;
  dateFormat?: string;
}

const STACK_COLORS: Record<string, string> = {
  vote: "#6366f1",
  post: "#3b82f6",
  comment: "#8b5cf6",
  transfer: "#f59e0b",
  custom_json: "#10b981",
  other: "#94a3b8",
};

const STACK_KEYS = [
  "vote",
  "post",
  "comment",
  "transfer",
  "custom_json",
  "other",
] as const;

const DauStackedChart: React.FC<DauStackedChartProps> = ({
  data,
  allData,
  includeBrush = false,
  dateFormat,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const totalByPeriod = useMemo(() => {
    const map = new Map<string, number>();
    allData?.forEach((d) => map.set(d.period, d.operations));
    return map;
  }, [allData]);

  const stackData = useMemo<DauStackedPoint[]>(() => {
    return data.map((point) => {
      const knownOps =
        point.post +
        point.comment +
        point.vote +
        point.transfer +
        point.custom_json;
      const totalOps = totalByPeriod.get(point.period) ?? knownOps;
      return { ...point, other: Math.max(0, totalOps - knownOps) };
    });
  }, [data, totalByPeriod]);

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000)
      return `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
    if (value >= 1_000)
      return `${(value / 1_000).toLocaleString(locale, { maximumFractionDigits: 1 })}K`;
    return value.toLocaleString(locale);
  };

  const xTickFormatter = (value: string) =>
    moment(value).format(dateFormat ?? "MMM D");

  const labelMap: Record<string, string> = {
    vote: t("dailyActiveUsersFullChart.vote"),
    post: t("dailyActiveUsersFullChart.post"),
    comment: t("dailyActiveUsersFullChart.comment"),
    transfer: t("dailyActiveUsersFullChart.transfer"),
    custom_json: t("dailyActiveUsersFullChart.customJson"),
    other: t("dailyActiveUsersFullChart.other"),
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const period = payload[0]?.payload?.period as string;
    const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
    return (
      <div className="bg-theme rounded shadow-sm py-1.5 px-2.5 text-[0.6rem]">
        <p className="text-gray-400 mb-1 text-center">
          {moment(period).format(dateFormat ?? "MMM D, YYYY")}
        </p>
        {[...payload].reverse().map((p) => (
          <div key={p.dataKey} className="flex items-center gap-1.5 mb-0.5">
            <span
              className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-500 flex-1">{labelMap[p.dataKey]}</span>
            <span className="font-semibold" style={{ color: p.color }}>
              {(p.value as number)?.toLocaleString(locale)}
            </span>
          </div>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1 flex justify-between">
          <span className="text-gray-500">{t("dauKpiStrip.totalOps")}</span>
          <span className="font-semibold">{total.toLocaleString(locale)}</span>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={stackData}
        margin={{
          top: 20,
          right: isRTL ? 10 : 30,
          left: isRTL ? 30 : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <defs>
          {STACK_KEYS.map((key) => (
            <linearGradient
              key={key}
              id={`dauStack_${key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={STACK_COLORS[key]}
                stopOpacity={0.7}
              />
              <stop
                offset="95%"
                stopColor={STACK_COLORS[key]}
                stopOpacity={0.3}
              />
            </linearGradient>
          ))}
        </defs>

        <XAxis
          dataKey="period"
          tickFormatter={xTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          tickFormatter={formatYAxis}
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          orientation={isRTL ? "right" : "left"}
          allowDecimals={false}
          width={48}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          align="center"
          wrapperStyle={{ paddingTop: 8 }}
        />

        {STACK_KEYS.map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={labelMap[key]}
            stackId="ops"
            stroke={STACK_COLORS[key]}
            strokeWidth={1}
            fill={`url(#dauStack_${key})`}
            dot={false}
          />
        ))}

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

export default DauStackedChart;
