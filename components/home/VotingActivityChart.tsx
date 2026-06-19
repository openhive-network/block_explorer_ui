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
import { useI18n } from "../../i18n/i18n";
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

const VotingActivityChart: React.FC<VotingActivityChartProps> = ({
  data,
  includeBrush = false,
  tickCount = 6,
  showGranularity = "day",
}) => {
  const { theme } = useTheme();
  const { t, dir } = useI18n();
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
      downvote_pct: item.downvote_pct,
    }));
  }, [data]);

  const xTickFormatter = (value: string) => {
    if (showGranularity === "month") return moment(value).format("MMM YYYY");
    return moment(value).format("MMM D");
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return n.toLocaleString();
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-theme rounded shadow-sm py-1.5 px-2 text-[0.6rem] min-w-[160px]">
        <p className="text-gray-400 mb-1 text-center font-medium">{d.period}</p>
        <div className="grid grid-cols-1 gap-y-0.5">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500 uppercase">
              {t("votingActivityChart.upvotes")}
            </span>
            <span className="font-semibold" style={{ color: UP_COLOR }}>
              {d.upvotes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500 uppercase">
              {t("votingActivityChart.downvotes")}
            </span>
            <span className="font-semibold" style={{ color: DOWN_COLOR }}>
              {d.downvotes.toLocaleString()} ({d.downvote_pct}%)
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500 uppercase">
              {t("votingActivityChart.selfVotes")}
            </span>
            <span className="font-semibold" style={{ color: SELF_COLOR }}>
              {d.self_votes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-500 uppercase">
              {t("votingActivityChart.unvotes")}
            </span>
            <span className="font-semibold" style={{ color: UNVOTE_COLOR }}>
              {d.unvotes.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t pt-0.5 mt-0.5 dark:border-gray-700">
            <span className="text-gray-500 uppercase">
              {t("votingActivityChart.uniqueVoters")}
            </span>
            <span className="font-semibold" style={{ color: VOTERS_COLOR }}>
              {d.unique_voters.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const toggleKey = (key: string) =>
    setHiddenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const CustomLegend = ({ payload }: any) => {
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
                onClick={() => toggleKey(entry.dataKey)}
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
          tickFormatter={formatCount}
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
          tickFormatter={formatCount}
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
        <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.06 }} />
        <Legend verticalAlign="bottom" content={<CustomLegend />} />

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
