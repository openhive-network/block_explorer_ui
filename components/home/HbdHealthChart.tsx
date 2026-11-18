import React from "react";
import moment from "moment";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
  ReferenceLine,
} from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "../../i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";
import {
  HbdHealthGranularity,
  HbdHealthPoint,
  HAIRCUT_PCT,
  PRINT_STOP_PCT,
} from "@/utils/hbdHealth";

export const PROTOCOL_COLOR = "#6366f1";
export const GROSS_COLOR = "#f59e0b";
export const INTEREST_COLOR = "#22c55e";

interface HbdHealthChartProps {
  data: HbdHealthPoint[];
  granularity: HbdHealthGranularity;
  includeBrush?: boolean;
  compact?: boolean;
}

// The last row is sampled now; the others at a period boundary (UTC).
const isLiveRow = (date: string) => !date.slice(0, 19).endsWith("T00:00:00");

const HbdHealthChart: React.FC<HbdHealthChartProps> = ({
  data,
  granularity,
  includeBrush = false,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const brushDefaults = useChartBrushDefaults();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const hasProtocol = data.some((p) => p.protocolPct !== null);

  const pct = (v: number | null | undefined, digits = 2) =>
    v === null || v === undefined
      ? "–"
      : `${v.toLocaleString(locale, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        })}%`;
  const amount = (v: number | null) =>
    v === null ? "–" : v.toLocaleString(locale, { maximumFractionDigits: 0 });

  const tickFormat = compact
    ? "MMM YY"
    : granularity === "yearly"
      ? "YYYY"
      : granularity === "monthly"
        ? "MMM YYYY"
        : "MMM D, YYYY";
  const xTick = (value: string) =>
    isLiveRow(value)
      ? t("hbdHealthCard.now")
      : moment.utc(value).format(tickFormat);

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: readonly { payload?: HbdHealthPoint }[];
  }) => {
    const p = active ? payload?.[0]?.payload : undefined;
    if (!p) return null;
    const rows: [string, string, string?][] = [
      [t("hbdHealthCard.protocolRatio"), pct(p.protocolPct), PROTOCOL_COLOR],
      [t("hbdHealthCard.grossShare"), pct(p.grossPct), GROSS_COLOR],
      [t("hbdHealthCard.interestRate"), pct(p.interestRatePct), INTEREST_COLOR],
      [t("hbdHealthCard.treasuryShare"), pct(p.treasurySharePct, 1)],
      [t("hbdHealthCard.hbdSupply"), amount(p.hbdSupply)],
    ];
    return (
      <div className="bg-theme rounded shadow-xs py-1.5 px-2 text-xs max-w-[280px]">
        <p className="text-gray-400 mb-1 text-center">
          {isLiveRow(p.date)
            ? t("hbdHealthCard.now")
            : t("hbdHealthCard.asOf", {
                date: moment.utc(p.date).format("MMM D, YYYY HH:mm"),
              })}
        </p>
        {rows.map(([label, value, color]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="flex items-center gap-1 text-gray-500">
              {color && (
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              {label}
            </span>
            <span className="font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{
          top: compact ? 8 : 20,
          right: compact ? 4 : 10,
          left: compact ? 0 : 10,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={xTick}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
          minTickGap={compact ? 16 : 24}
        />
        <YAxis
          yAxisId="ratio"
          orientation={isRTL ? "right" : "left"}
          tickFormatter={(v: number) => `${v}%`}
          style={{ fontSize: compact ? "10px" : "12px" }}
          stroke={strokeColor}
          width={compact ? 36 : 44}
          domain={[0, (max: number) => Math.ceil(Math.max(max, 32) / 10) * 10]}
        />
        <YAxis
          yAxisId="rate"
          orientation={isRTL ? "left" : "right"}
          tickFormatter={(v: number) => `${v}%`}
          style={{ fontSize: compact ? "10px" : "12px" }}
          stroke={INTEREST_COLOR}
          width={compact ? 32 : 40}
          domain={[0, (max: number) => Math.max(5, Math.ceil(max / 5) * 5)]}
          hide={compact}
        />
        <Tooltip content={renderTooltip} />
        {!compact && (
          <Legend
            verticalAlign="bottom"
            height={36}
            align="center"
            wrapperStyle={{ paddingTop: 8 }}
          />
        )}
        {/* The thresholds apply to the protocol ratio only, never the gross share. */}
        {!compact && hasProtocol && (
          <ReferenceLine
            yAxisId="ratio"
            y={PRINT_STOP_PCT}
            stroke={PROTOCOL_COLOR}
            strokeDasharray="2 4"
            label={{
              value: t("hbdHealthCard.printStopLine"),
              position: "insideTopLeft",
              fontSize: 10,
              fill: PROTOCOL_COLOR,
            }}
          />
        )}
        {!compact && hasProtocol && (
          <ReferenceLine
            yAxisId="ratio"
            y={HAIRCUT_PCT}
            stroke={PROTOCOL_COLOR}
            strokeDasharray="2 4"
            label={{
              value: t("hbdHealthCard.haircutLine"),
              position: "insideTopLeft",
              fontSize: 10,
              fill: PROTOCOL_COLOR,
            }}
          />
        )}
        {hasProtocol && (
          <Line
            yAxisId="ratio"
            name={t("hbdHealthCard.protocolRatio")}
            type="monotone"
            dataKey="protocolPct"
            stroke={PROTOCOL_COLOR}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={!compact}
          />
        )}
        <Line
          yAxisId="ratio"
          name={t("hbdHealthCard.grossShare")}
          type="monotone"
          dataKey="grossPct"
          stroke={GROSS_COLOR}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={!compact}
        />
        <Line
          yAxisId="rate"
          name={t("hbdHealthCard.interestRate")}
          type="stepBefore"
          dataKey="interestRatePct"
          stroke={INTEREST_COLOR}
          strokeWidth={1.5}
          dot={false}
          hide={compact}
          isAnimationActive={!compact}
        />
        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush {...brushDefaults} dataKey="date" tickFormatter={xTick} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default HbdHealthChart;
