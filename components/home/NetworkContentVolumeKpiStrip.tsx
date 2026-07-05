import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import { formatCompact, computeTrendPct } from "@/utils/chartUtils";

type TrendField = "posts" | "comments" | "unique_authors";

interface NetworkContentVolumeKpiStripProps {
  data: Hive.NetworkContentVolumeResponse[];
  granularity: "day" | "week" | "month";
  trendMetric?: TrendField;
}

const NetworkContentVolumeKpiStrip: React.FC<
  NetworkContentVolumeKpiStripProps
> = ({ data, granularity, trendMetric = "posts" }) => {
  const { t, locale } = useI18n();

  if (data.length === 0) return null;

  const totalPosts = data.reduce((s, d) => s + d.posts, 0);
  const totalComments = data.reduce((s, d) => s + d.comments, 0);
  const avgAuthors = Math.round(
    data.reduce((s, d) => s + d.unique_authors, 0) / data.length
  );
  const commentsPerPost =
    totalPosts > 0
      ? (totalComments / totalPosts).toLocaleString(locale, {
          maximumFractionDigits: 1,
        })
      : "—";

  const peakEntry = data.reduce((max, d) =>
    d[trendMetric] > max[trendMetric] ? d : max
  );

  // Trend excludes the current incomplete period (day/week/month)
  const currentPeriodStart = moment()
    .startOf(
      granularity === "day"
        ? "day"
        : granularity === "week"
          ? "isoWeek"
          : "month"
    )
    .format("YYYY-MM-DD");
  const completedData = data.filter((d) => d.period < currentPeriodStart);
  const trendPct = computeTrendPct(completedData.map((d) => d[trendMetric]));
  const trendSign: 1 | -1 | 0 =
    trendPct === null ? 0 : trendPct > 0 ? 1 : trendPct < 0 ? -1 : 0;
  const TrendIcon =
    trendSign > 0 ? TrendingUp : trendSign < 0 ? TrendingDown : Minus;
  const trendColor =
    trendSign > 0
      ? "text-explorer-light-green"
      : trendSign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";

  const granularityKeyMap: Record<string, string> = {
    day: "common.day",
    week: "common.week",
    month: "common.month",
  };
  const periodLabel = t(granularityKeyMap[granularity] ?? "common.day");
  const peakDateFmt = granularity === "month" ? "MMM YYYY" : "MMM D, YYYY";

  const trendMetricLabel =
    trendMetric === "posts"
      ? t("networkContentVolumeCard.posts")
      : trendMetric === "comments"
        ? t("networkContentVolumeCard.comments")
        : t("networkContentVolumeCard.authors");

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <KpiTile
        label={t("networkContentVolumeKpiStrip.totalPosts")}
        value={formatCompact(totalPosts, locale)}
      />
      <KpiTile
        label={t("networkContentVolumeKpiStrip.totalComments")}
        value={formatCompact(totalComments, locale)}
      />
      <KpiTile
        label={t("networkContentVolumeKpiStrip.commentsPerPost")}
        value={commentsPerPost}
      />
      <KpiTile
        label={t("networkContentVolumeKpiStrip.avgAuthors", {
          period: periodLabel,
        })}
        value={formatCompact(avgAuthors, locale)}
      />
      <KpiTile
        label={t("networkContentVolumeKpiStrip.peakPeriod")}
        value={moment(peakEntry.period).format(peakDateFmt)}
        sub={`${formatCompact(peakEntry[trendMetric], locale)} ${trendMetricLabel}`}
      />
      <KpiTile
        label={t("networkContentVolumeKpiStrip.trend")}
        value={
          <span className={cn("inline-flex items-center gap-1", trendColor)}>
            <TrendIcon size={13} />
            {trendPct !== null
              ? `${trendPct >= 0 ? "+" : ""}${trendPct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
              : "—"}
          </span>
        }
        sub={t("networkContentVolumeKpiStrip.vsPeriodStart")}
      />
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
}> = ({ label, value, sub }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide leading-none">
      {label}
    </div>
    <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default NetworkContentVolumeKpiStrip;
