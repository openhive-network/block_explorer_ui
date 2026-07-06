import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import { computeTrendPct, formatCompact } from "@/utils/chartUtils";
import {
  EngagementGranularity,
  isEngagementBucketProvisional,
} from "./NetworkEngagementChart";

interface NetworkEngagementKpiStripProps {
  data: Hive.NetworkEngagementResponse[];
  granularity: EngagementGranularity;
}

const NetworkEngagementKpiStrip: React.FC<NetworkEngagementKpiStripProps> = ({
  data,
  granularity,
}) => {
  const { t, locale } = useI18n();
  if (!data.length) return null;

  // Right-censored recent buckets are excluded so they don't skew the numbers.
  const mature = data.filter(
    (d) => !isEngagementBucketProvisional(d.period, granularity)
  );
  const base = mature.length ? mature : data;
  const n = base.length;
  const mean = (sel: (d: Hive.NetworkEngagementResponse) => number) =>
    base.reduce((s, d) => s + sel(d), 0) / n;

  const avgVotes = mean((d) => d.avg_votes_per_post);
  const avgComments = mean((d) => d.avg_comments_per_post);
  const avgZeroVote = mean((d) => d.zero_vote_post_pct);
  const avgZeroComment = mean((d) => d.zero_comment_post_pct);
  const totalPosts = base.reduce((s, d) => s + d.total_posts, 0);

  const trendPct = computeTrendPct(base.map((d) => d.avg_votes_per_post));
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

  const fmtN = (v: number) =>
    v.toLocaleString(locale, { maximumFractionDigits: 1 });
  const fmtP = (v: number) =>
    `${v.toLocaleString(locale, { maximumFractionDigits: 1 })}%`;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiTile
          label={t("networkEngagementKpiStrip.avgVotes")}
          value={fmtN(avgVotes)}
        />
        <KpiTile
          label={t("networkEngagementKpiStrip.avgComments")}
          value={fmtN(avgComments)}
        />
        <KpiTile
          label={t("networkEngagementKpiStrip.zeroVote")}
          value={fmtP(avgZeroVote)}
        />
        <KpiTile
          label={t("networkEngagementKpiStrip.zeroComment")}
          value={fmtP(avgZeroComment)}
        />
        <KpiTile
          label={t("networkEngagementKpiStrip.totalPosts")}
          value={formatCompact(totalPosts, locale)}
        />
        <KpiTile
          label={t("networkEngagementKpiStrip.trend")}
          value={
            <span className={cn("inline-flex items-center gap-1", trendColor)}>
              <TrendIcon size={13} />
              {trendPct !== null
                ? `${trendPct >= 0 ? "+" : ""}${trendPct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
                : "—"}
            </span>
          }
          sub={t("networkEngagementKpiStrip.vsPeriodStart")}
        />
      </div>
      {mature.length < data.length && (
        <p className="mt-2 text-[10px] text-amber-500">
          {t("networkEngagementKpiStrip.provisionalNote")}
        </p>
      )}
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

export default NetworkEngagementKpiStrip;
