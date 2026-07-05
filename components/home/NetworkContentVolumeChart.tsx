import { useTheme } from "@/contexts/ThemeContext";
import Hive from "@/types/Hive";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
} from "recharts";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";
import {
  ChartBrushDefs,
  useChartBrushDefaults,
} from "@/components/ui/ChartBrush";

interface NetworkContentVolumeChartProps {
  data: Hive.NetworkContentVolumeResponse[] | undefined;
  includeBrush?: boolean;
  tickCount?: number;
  dateFormat?: string;
  compact?: boolean;
}

export const POSTS_COLOR = "#6366f1";
export const COMMENTS_COLOR = "#14b8a6";
export const AUTHORS_COLOR = "#f59e0b";

type SeriesKey = "posts" | "comments" | "unique_authors";

const NetworkContentVolumeChart: React.FC<NetworkContentVolumeChartProps> = ({
  data,
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

  // Clickable-legend visibility state (replaces the metric toggle).
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const toggle = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const showPosts = !hidden.has("posts");
  const showComments = !hidden.has("comments");
  const showAuthors = !hidden.has("unique_authors");
  const showContentAxis = showPosts || showComments;
  const stacked = showPosts && showComments;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const seen = new Set<string>();
    const unique: Hive.NetworkContentVolumeResponse[] = [];
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

  // Columns anchor at 0; scale the content axis to the tallest visible column.
  const contentMax = useMemo(() => {
    if (!chartData.length) return 1;
    const vals = chartData.map(
      (d) => (showPosts ? d.posts : 0) + (showComments ? d.comments : 0)
    );
    return Math.max(Math.ceil(Math.max(...vals) * 1.05), 1);
  }, [chartData, showPosts, showComments]);

  // Authors line uses a padded band so its variation is visible.
  const authorsDomain = useMemo((): [number, number] => {
    if (!chartData.length) return [0, 1];
    const vals = chartData.map((d) => d.unique_authors);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.12;
    return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad * 0.5)];
  }, [chartData]);

  const xTickFormatter = (value: string) =>
    moment(value).format(dateFormat ?? "MMM D");

  const legendItems: { key: SeriesKey; label: string; color: string }[] = [
    {
      key: "posts",
      label: t("networkContentVolumeCard.posts"),
      color: POSTS_COLOR,
    },
    {
      key: "comments",
      label: t("networkContentVolumeCard.comments"),
      color: COMMENTS_COLOR,
    },
    {
      key: "unique_authors",
      label: t("networkContentVolumeCard.authors"),
      color: AUTHORS_COLOR,
    },
  ];

  const renderLegend = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 text-[11px]">
      {legendItems.map((it) => {
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
    const { period, posts, comments, unique_authors } = payload[0].payload;
    return (
      <div className="bg-theme rounded shadow-sm py-1 px-2 text-[0.6rem]">
        <p className="text-gray-400 mb-0.5 text-center">
          {moment(period).format(dateFormat ?? "MMM D, YYYY")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("networkContentVolumeCard.posts")}
            </p>
            <p
              className="font-semibold leading-none"
              style={{ color: POSTS_COLOR }}
            >
              {posts?.toLocaleString(locale)}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("networkContentVolumeCard.comments")}
            </p>
            <p
              className="font-semibold leading-none"
              style={{ color: COMMENTS_COLOR }}
            >
              {comments?.toLocaleString(locale)}
            </p>
          </div>
          <div>
            <p className="text-[0.6rem] text-gray-500 uppercase leading-none mb-1">
              {t("networkContentVolumeCard.authors")}
            </p>
            <p
              className="font-semibold leading-none"
              style={{ color: AUTHORS_COLOR }}
            >
              {unique_authors?.toLocaleString(locale)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        barCategoryGap="20%"
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

        {showContentAxis && (
          <YAxis
            yAxisId="content"
            tickCount={tickCount}
            style={{ fontSize: "11px" }}
            stroke={strokeColor}
            tickFormatter={formatYAxis}
            domain={[0, contentMax]}
            orientation={isRTL ? "right" : "left"}
            allowDecimals={false}
            width={compact ? 34 : 44}
          />
        )}

        {showAuthors && (
          <YAxis
            yAxisId="authors"
            tickCount={tickCount}
            style={{ fontSize: "11px" }}
            stroke={AUTHORS_COLOR}
            tickFormatter={formatYAxis}
            domain={authorsDomain}
            orientation={
              showContentAxis
                ? isRTL
                  ? "left"
                  : "right"
                : isRTL
                  ? "right"
                  : "left"
            }
            allowDecimals={false}
            width={compact ? 34 : 44}
          />
        )}

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "currentColor", opacity: 0.06 }}
        />

        <Legend verticalAlign="bottom" content={renderLegend} />

        {showPosts && (
          <Bar
            yAxisId="content"
            name={t("networkContentVolumeCard.posts")}
            dataKey="posts"
            stackId={stacked ? "content" : undefined}
            fill={POSTS_COLOR}
            maxBarSize={48}
            radius={stacked ? [0, 0, 0, 0] : [2, 2, 0, 0]}
          />
        )}

        {showComments && (
          <Bar
            yAxisId="content"
            name={t("networkContentVolumeCard.comments")}
            dataKey="comments"
            stackId={stacked ? "content" : undefined}
            fill={COMMENTS_COLOR}
            maxBarSize={48}
            radius={[2, 2, 0, 0]}
          />
        )}

        {showAuthors && (
          <Line
            yAxisId="authors"
            name={t("networkContentVolumeCard.authors")}
            type="monotone"
            dataKey="unique_authors"
            stroke={AUTHORS_COLOR}
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
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default NetworkContentVolumeChart;
