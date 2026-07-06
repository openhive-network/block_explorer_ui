import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
  ReferenceArea,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

export type EngagementGranularity = "day" | "week" | "month";
export type EngagementVariant = "depth" | "health";

// Counts are lifetime + cohort-by-creation, so recent buckets are right-censored:
// a bucket whose window could still be accruing votes/replies (within Hive's
// ~7-day payout window) is provisional — excluded from KPIs/trend and flagged.
export const ENGAGEMENT_MATURITY_DAYS = 7;

export const isEngagementBucketProvisional = (
  period: string,
  granularity: EngagementGranularity
): boolean => {
  const cutoff = moment().subtract(ENGAGEMENT_MATURITY_DAYS, "days");
  const start = moment(period);
  const end =
    granularity === "week"
      ? start.clone().add(6, "days")
      : granularity === "month"
        ? start.clone().endOf("month")
        : start;
  return end.isAfter(cutoff);
};

export const VOTES_COLOR = "#3B82F6";
export const COMMENTS_COLOR = "#10B981";
export const ZERO_VOTE_COLOR = "#EF4444";
export const ZERO_COMMENT_COLOR = "#F59E0B";

type SeriesKey =
  | "avg_votes_per_post"
  | "avg_comments_per_post"
  | "zero_vote_post_pct"
  | "zero_comment_post_pct";

interface NetworkEngagementChartProps {
  data: Hive.NetworkEngagementResponse[] | undefined;
  granularity: EngagementGranularity;
  // "depth" = avg votes/comments per post; "health" = ghost-posting %.
  variant: EngagementVariant;
  includeBrush?: boolean;
  tickCount?: number;
  dateFormat?: string;
  compact?: boolean;
}

const NetworkEngagementChart: React.FC<NetworkEngagementChartProps> = ({
  data,
  granularity,
  variant,
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
  const isPct = variant === "health";

  const seriesDefs: { key: SeriesKey; label: string; color: string }[] =
    variant === "depth"
      ? [
          {
            key: "avg_votes_per_post",
            label: t("networkEngagementCard.avgVotes"),
            color: VOTES_COLOR,
          },
          {
            key: "avg_comments_per_post",
            label: t("networkEngagementCard.avgComments"),
            color: COMMENTS_COLOR,
          },
        ]
      : [
          {
            key: "zero_vote_post_pct",
            label: t("networkEngagementCard.zeroVotePct"),
            color: ZERO_VOTE_COLOR,
          },
          {
            key: "zero_comment_post_pct",
            label: t("networkEngagementCard.zeroCommentPct"),
            color: ZERO_COMMENT_COLOR,
          },
        ];

  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const toggle = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const seen = new Set<string>();
    const unique: Hive.NetworkEngagementResponse[] = [];
    for (const item of data) {
      if (!seen.has(item.period)) {
        seen.add(item.period);
        unique.push(item);
      }
    }
    return unique;
  }, [data]);

  const yMax = useMemo(() => {
    if (!chartData.length) return 1;
    const vals: number[] = [];
    chartData.forEach((d) => {
      seriesDefs.forEach((s) => {
        if (!hidden.has(s.key)) vals.push(d[s.key]);
      });
    });
    if (!vals.length) return 1;
    const max = Math.max(...vals);
    return isPct ? Math.min(100, Math.ceil(max * 1.15)) : Math.ceil(max * 1.1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData, hidden, isPct]);

  const provisionalStart = useMemo(
    () =>
      chartData.find((d) =>
        isEngagementBucketProvisional(d.period, granularity)
      )?.period,
    [chartData, granularity]
  );
  const lastPeriod = chartData.length
    ? chartData[chartData.length - 1].period
    : undefined;

  const formatCount = (v: number) =>
    v.toLocaleString(locale, { maximumFractionDigits: 1 });
  const formatPct = (v: number) =>
    `${v.toLocaleString(locale, { maximumFractionDigits: 0 })}%`;
  const formatY = isPct ? formatPct : formatCount;

  const xTickFormatter = (value: string) =>
    moment(value).format(dateFormat ?? "MMM D");

  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-[11px]">
      {seriesDefs.map((it) => {
        const off = hidden.has(it.key);
        return (
          <button
            type="button"
            key={it.key}
            onClick={() => toggle(it.key)}
            aria-pressed={!off}
            className={cn(
              "group inline-flex cursor-pointer select-none items-center gap-1.5 transition-opacity",
              off ? "opacity-40 hover:opacity-70" : "opacity-100"
            )}
          >
            <span
              className="inline-block h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: it.color }}
            />
            <span
              className={cn(
                "text-explorer-dark-gray group-hover:underline dark:text-text",
                off && "line-through"
              )}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as Hive.NetworkEngagementResponse;
    const provisional = isEngagementBucketProvisional(d.period, granularity);
    const rows: [string, string, string][] = [
      [
        t("networkEngagementCard.avgVotes"),
        formatCount(d.avg_votes_per_post),
        VOTES_COLOR,
      ],
      [
        t("networkEngagementCard.avgComments"),
        formatCount(d.avg_comments_per_post),
        COMMENTS_COLOR,
      ],
      [
        t("networkEngagementCard.zeroVotePct"),
        formatPct(d.zero_vote_post_pct),
        ZERO_VOTE_COLOR,
      ],
      [
        t("networkEngagementCard.zeroCommentPct"),
        formatPct(d.zero_comment_post_pct),
        ZERO_COMMENT_COLOR,
      ],
    ];
    return (
      <div className="bg-theme rounded shadow-sm py-1.5 px-2 text-[0.6rem]">
        <p className="text-gray-400 mb-1 text-center">
          {moment(d.period).format(dateFormat ?? "MMM D, YYYY")}
          {provisional && (
            <span className="ml-1 text-amber-500">
              · {t("networkEngagementCard.provisionalTag")}
            </span>
          )}
        </p>
        <div className="space-y-0.5">
          {rows.map(([label, value, color]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <span className="inline-flex items-center gap-1 text-gray-500">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                {label}
              </span>
              <span className="font-semibold tabular-nums">{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pt-0.5 text-gray-400">
            <span>{t("networkEngagementCard.posts")}</span>
            <span className="tabular-nums">
              {d.total_posts?.toLocaleString(locale)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{
          top: compact ? 8 : 16,
          right: 6,
          left: 6,
          bottom: includeBrush ? 40 : 0,
        }}
      >
        <XAxis
          dataKey="period"
          tickCount={tickCount}
          tickFormatter={xTickFormatter}
          style={{ fontSize: "10px" }}
          stroke={strokeColor}
          reversed={isRTL}
        />

        <YAxis
          tickCount={tickCount}
          style={{ fontSize: "11px" }}
          stroke={strokeColor}
          tickFormatter={formatY}
          domain={[0, yMax]}
          orientation={isRTL ? "right" : "left"}
          width={compact ? 36 : 44}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" content={renderLegend} />

        {provisionalStart && lastPeriod && (
          <ReferenceArea
            x1={provisionalStart}
            x2={lastPeriod}
            fill="currentColor"
            fillOpacity={0.06}
          />
        )}

        {seriesDefs.map((s) =>
          hidden.has(s.key) ? null : (
            <Line
              key={s.key}
              name={s.label}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          )
        )}

        {includeBrush && <ChartBrushDefs />}
        {includeBrush && (
          <Brush
            {...brushDefaults}
            dataKey="period"
            tickFormatter={xTickFormatter}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default NetworkEngagementChart;
