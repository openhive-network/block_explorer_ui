import { formatCompact } from "@/utils/chartUtils";
import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";
import { useI18n } from "@/i18n/i18n";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";
import { Info } from "lucide-react";
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UP_COLOR = "#22c55e";
const DOWN_COLOR = "#ef4444";
const SELF_COLOR = "#f59e0b";
const UNVOTE_COLOR = "#6b7280";
const VOTERS_COLOR = "#60a5fa";

interface VotingActivityChartProps {
  data: Hive.NetworkVoteStatsResponse[] | undefined;
  includeBrush?: boolean;
  tickCount?: number;
  showGranularity?: "day" | "week" | "month";
}

const SERIES_META = [
  { dataKey: "upvotes", color: UP_COLOR, dash: undefined },
  { dataKey: "downvotes", color: DOWN_COLOR, dash: undefined },
  { dataKey: "self_votes", color: SELF_COLOR, dash: undefined },
  { dataKey: "unvotes", color: UNVOTE_COLOR, dash: "4 2" },
  { dataKey: "unique_voters", color: VOTERS_COLOR, dash: "5 3" },
];

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  locale: string;
  t: (key: string) => string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  locale,
  t,
}) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const total =
    d.total_votes || d.upvotes + d.downvotes + d.self_votes + d.unvotes;
  const pct = (val: number) =>
    total > 0
      ? `${((val / total) * 100).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
      : "—";

  const voteRows = [
    {
      key: "upvotes",
      label: t("votingActivityChart.upvotes"),
      value: d.upvotes,
      color: UP_COLOR,
    },
    {
      key: "downvotes",
      label: t("votingActivityChart.downvotes"),
      value: d.downvotes,
      color: DOWN_COLOR,
    },
    {
      key: "self_votes",
      label: t("votingActivityChart.selfVotes"),
      value: d.self_votes,
      color: SELF_COLOR,
    },
    {
      key: "unvotes",
      label: t("votingActivityChart.unvotes"),
      value: d.unvotes,
      color: UNVOTE_COLOR,
    },
  ];

  return (
    <div className="bg-theme rounded shadow-md border border-gray-200 dark:border-gray-700 py-2 px-3 text-[0.6rem] min-w-[200px]">
      <p className="text-center text-gray-400 font-medium mb-2">{d.period}</p>
      <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-500 uppercase tracking-wide">
          {t("votingActivityChart.totalVotes")}
        </span>
        <span className="font-bold">{total.toLocaleString(locale)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-0.5 items-center">
        {voteRows.map(({ key, label, value, color }) => (
          <React.Fragment key={key}>
            <span style={{ color }}>{label}</span>
            <span
              className="font-semibold tabular-nums text-right"
              style={{ color }}
            >
              {value.toLocaleString(locale)}
            </span>
            <span className="text-gray-400 tabular-nums text-right">
              {pct(value)}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
        <span className="text-gray-500">
          {t("votingActivityChart.uniqueVoters")}
        </span>
        <span
          className="font-semibold tabular-nums"
          style={{ color: VOTERS_COLOR }}
        >
          {d.unique_voters.toLocaleString(locale)}
        </span>
      </div>
    </div>
  );
};

interface ChartLegendProps {
  payload?: any[];
  hiddenKeys: string[];
  onToggle: (key: string) => void;
  t: (key: string) => string;
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  payload,
  hiddenKeys,
  onToggle,
  t,
}) => {
  if (!payload) return null;
  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] pt-2">
        {payload.map((entry: any) => {
          const meta = SERIES_META.find((s) => s.dataKey === entry.dataKey);
          const hidden = hiddenKeys.includes(entry.dataKey);
          return (
            <div
              key={entry.dataKey}
              className="flex items-center gap-1 cursor-pointer select-none"
              style={{ opacity: hidden ? 0.35 : 1 }}
              onClick={() => onToggle(entry.dataKey)}
            >
              <svg width="18" height="8" style={{ flexShrink: 0 }}>
                <line
                  x1="0"
                  y1="4"
                  x2="18"
                  y2="4"
                  stroke={meta?.color}
                  strokeWidth={entry.dataKey === "upvotes" ? 2.5 : 1.5}
                  strokeDasharray={meta?.dash}
                />
              </svg>
              <span style={{ color: meta?.color }}>{entry.value}</span>
              {entry.dataKey === "unique_voters" && (
                <RadixTooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="text-gray-400 hover:text-gray-300 cursor-help"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info size={10} />
                    </span>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      side="top"
                      className="max-w-[200px] text-center text-[10px]"
                    >
                      {t("votingActivityChart.uniqueVotersInfo")}
                    </TooltipContent>
                  </TooltipPortal>
                </RadixTooltip>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

const VotingActivityChart: React.FC<VotingActivityChartProps> = ({
  data,
  includeBrush = false,
  tickCount = 6,
  showGranularity = "day",
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const brushDefaults = useChartBrushDefaults();

  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => ({
      period: item.period,
      upvotes: item.upvotes,
      downvotes: item.downvotes,
      self_votes: item.self_votes,
      unvotes: item.unvotes,
      unique_voters: item.unique_voters,
      total_votes: item.total_votes,
    }));
  }, [data]);

  // Both axes rescale to visible series only — hiding a series lets the remaining ones fill the chart.
  const votesAxisMax = useMemo(() => {
    if (!chartData.length || hiddenKeys.includes("upvotes")) return "auto";
    return Math.max(...chartData.map((d) => d.upvotes));
  }, [chartData, hiddenKeys]);

  const votersAxisMax = useMemo(() => {
    if (!chartData.length) return "auto";
    const rightKeys = (
      ["downvotes", "self_votes", "unvotes", "unique_voters"] as const
    ).filter((k) => !hiddenKeys.includes(k));
    if (rightKeys.length === 0) return "auto";
    const naturalMax = Math.max(
      ...chartData.map((d) => Math.max(...rightKeys.map((k) => d[k])))
    );
    // When upvotes is visible, double the right axis max so right-axis series
    // stay in the lower half of the chart and don't appear above upvotes.
    return hiddenKeys.includes("upvotes") ? naturalMax : naturalMax * 2;
  }, [chartData, hiddenKeys]);

  const xTickFormatter = (value: string) => {
    if (showGranularity === "month") return moment(value).format("MMM YYYY");
    return moment(value).format("MMM D");
  };

  const toggleKey = (key: string) =>
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{
          top: 10,
          right: isRTL ? 16 : 60,
          left: isRTL ? 60 : 16,
          bottom: includeBrush ? 46 : 0,
        }}
      >
        <defs>
          <linearGradient id="upvoteGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={UP_COLOR} stopOpacity={0.25} />
            <stop offset="95%" stopColor={UP_COLOR} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        {includeBrush && <ChartBrushDefs />}
        <XAxis
          dataKey="period"
          tickCount={tickCount}
          tickFormatter={xTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />
        <YAxis
          yAxisId="votes"
          tickCount={tickCount}
          tickFormatter={(v) => formatCompact(v, locale)}
          domain={[0, votesAxisMax]}
          style={{ fontSize: "10px" }}
          stroke={UP_COLOR}
          orientation={isRTL ? "right" : "left"}
          width={52}
          label={{
            value: t("votingActivityChart.upvotes"),
            angle: -90,
            position: isRTL ? "insideRight" : "insideLeft",
            offset: isRTL ? -4 : 4,
            style: { fontSize: "9px", fill: UP_COLOR, textAnchor: "middle" },
          }}
        />
        <YAxis
          yAxisId="voters"
          tickCount={tickCount}
          tickFormatter={(v) => formatCompact(v, locale)}
          domain={[0, votersAxisMax]}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          orientation={isRTL ? "left" : "right"}
          width={52}
          label={{
            value: t("votingActivityChart.othersAxisLabel"),
            angle: 90,
            position: isRTL ? "insideLeft" : "insideRight",
            offset: isRTL ? -4 : 4,
            style: { fontSize: "9px", fill: strokeColor, textAnchor: "middle" },
          }}
        />
        <Tooltip
          content={<ChartTooltip locale={locale} t={t} />}
          cursor={{ opacity: 0.06 }}
        />
        <Legend
          verticalAlign="bottom"
          content={
            <ChartLegend hiddenKeys={hiddenKeys} onToggle={toggleKey} t={t} />
          }
        />

        {/* Upvotes: gradient-filled area on left axis — the visual anchor */}
        <Area
          yAxisId="votes"
          type="monotone"
          dataKey="upvotes"
          name={t("votingActivityChart.upvotes")}
          stroke={UP_COLOR}
          strokeWidth={2.5}
          fill="url(#upvoteGradient)"
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenKeys.includes("upvotes")}
        />

        {/* Right axis: minority series as plain lines */}
        <Line
          yAxisId="voters"
          type="monotone"
          dataKey="downvotes"
          name={t("votingActivityChart.downvotes")}
          stroke={DOWN_COLOR}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenKeys.includes("downvotes")}
        />
        <Line
          yAxisId="voters"
          type="monotone"
          dataKey="self_votes"
          name={t("votingActivityChart.selfVotes")}
          stroke={SELF_COLOR}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenKeys.includes("self_votes")}
        />
        <Line
          yAxisId="voters"
          type="monotone"
          dataKey="unvotes"
          name={t("votingActivityChart.unvotes")}
          stroke={UNVOTE_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenKeys.includes("unvotes")}
        />
        <Line
          yAxisId="voters"
          type="monotone"
          dataKey="unique_voters"
          name={t("votingActivityChart.uniqueVoters")}
          stroke={VOTERS_COLOR}
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={false}
          activeDot={{ r: 3 }}
          hide={hiddenKeys.includes("unique_voters")}
        />

        {includeBrush && (
          <Brush
            dataKey="period"
            tickFormatter={xTickFormatter}
            {...brushDefaults}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default VotingActivityChart;
