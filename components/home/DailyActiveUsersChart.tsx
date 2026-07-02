import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

export type DauMetric = "active_accounts" | "operations" | "both";

interface DailyActiveUsersChartProps {
  data: Hive.DailyActiveUsersResponse[] | undefined;
  metric?: DauMetric;
  includeBrush?: boolean;
  tickCount?: number;
  dateFormat?: string;
  compact?: boolean;
}

const DAU_COLOR = "#6366f1";
const OPS_COLOR = "#f59e0b";

const DailyActiveUsersChart: React.FC<DailyActiveUsersChartProps> = ({
  data,
  metric = "active_accounts",
  includeBrush = false,
  tickCount,
  dateFormat,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const [zoomedDomain, setZoomedDomain] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    setZoomedDomain(null);
  }, [metric]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const seen = new Set<string>();
    const unique: Hive.DailyActiveUsersResponse[] = [];
    for (const item of data) {
      if (!seen.has(item.period)) {
        seen.add(item.period);
        unique.push(item);
      }
    }
    return unique;
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000)
      return `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })}M`;
    if (value >= 1_000)
      return `${(value / 1_000).toLocaleString(locale, { maximumFractionDigits: 1 })}K`;
    return value.toLocaleString(locale);
  };

  const calcDomain = (
    key: "active_accounts" | "operations"
  ): [number, number] => {
    if (!chartData.length) return [0, 1];
    const vals = chartData.map((d) => d[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.12;
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad * 0.5)];
  };

  const primaryDomain = useMemo(
    () => zoomedDomain ?? calcDomain("active_accounts"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartData, zoomedDomain]
  );
  const secondaryDomain = useMemo(
    () => calcDomain("operations"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chartData]
  );

  const handleBrushChange = ({
    startIndex,
    endIndex,
  }: {
    startIndex?: number;
    endIndex?: number;
  }) => {
    if (startIndex === undefined || endIndex === undefined) {
      setZoomedDomain(null);
      return;
    }
    const slice = chartData.slice(startIndex, endIndex + 1);
    if (slice.length) {
      const vals = slice.map((d) => d.active_accounts);
      setZoomedDomain([Math.min(...vals), Math.max(...vals)]);
    }
  };

  const xTickFormatter = (value: string) =>
    moment(value).format(dateFormat ?? "MMM D");

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const { period, active_accounts, operations } = payload[0].payload;
    return (
      <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
        <p className="text-gray-400 mb-0.5 text-center">
          {moment(period).format(dateFormat ?? "MMM D, YYYY")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("dailyActiveUsersCard.activeAccounts")}
            </p>
            <p
              className="font-semibold leading-none"
              style={{ color: DAU_COLOR }}
            >
              {active_accounts?.toLocaleString(locale)}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("dailyActiveUsersCard.operations")}
            </p>
            <p
              className="font-semibold leading-none"
              style={{ color: OPS_COLOR }}
            >
              {operations?.toLocaleString(locale)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const showDau = metric === "active_accounts" || metric === "both";
  const showOps = metric === "operations" || metric === "both";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{
          top: compact ? 8 : 20,
          right: isRTL ? 10 : metric === "both" ? 40 : 30,
          left: isRTL ? (metric === "both" ? 40 : 30) : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <defs>
          <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={DAU_COLOR} stopOpacity={0.5} />
            <stop offset="95%" stopColor={DAU_COLOR} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="opsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={OPS_COLOR} stopOpacity={0.4} />
            <stop offset="95%" stopColor={OPS_COLOR} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="period"
          tickCount={tickCount}
          tickFormatter={xTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />

        {showDau && (
          <YAxis
            yAxisId="dau"
            dataKey="active_accounts"
            tickCount={tickCount}
            style={{ fontSize: "11px" }}
            stroke={DAU_COLOR}
            tickFormatter={formatYAxis}
            domain={primaryDomain}
            orientation={isRTL ? "right" : "left"}
            allowDecimals={false}
            width={48}
          />
        )}

        {showOps && (
          <YAxis
            yAxisId="ops"
            dataKey="operations"
            tickCount={tickCount}
            style={{ fontSize: "11px" }}
            stroke={OPS_COLOR}
            tickFormatter={formatYAxis}
            domain={secondaryDomain}
            orientation={
              metric === "both"
                ? isRTL
                  ? "left"
                  : "right"
                : isRTL
                  ? "right"
                  : "left"
            }
            allowDecimals={false}
            width={48}
          />
        )}

        <Tooltip content={<CustomTooltip />} />

        {!compact && (
          <Legend verticalAlign="bottom" height={36} align="center" />
        )}

        {showDau && (
          <Area
            yAxisId="dau"
            name={t("dailyActiveUsersCard.activeAccounts")}
            type="monotone"
            dataKey="active_accounts"
            stroke={DAU_COLOR}
            strokeWidth={2}
            fill="url(#dauGradient)"
            dot={false}
          />
        )}

        {showOps && (
          <Line
            yAxisId="ops"
            name={t("dailyActiveUsersCard.operations")}
            type="monotone"
            dataKey="operations"
            stroke={OPS_COLOR}
            strokeWidth={2}
            dot={false}
          />
        )}

        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush
            {...brushDefaults}
            dataKey="period"
            tickFormatter={xTickFormatter}
            onChange={handleBrushChange}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default DailyActiveUsersChart;
