import React, { useMemo, useState } from "react";
import {
  Loader2,
  ThumbsUp,
  MessageSquare,
  Ghost,
  EyeOff,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import NetworkEngagementChart, {
  isEngagementBucketProvisional,
} from "./NetworkEngagementChart";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useI18n } from "../../i18n/i18n";
import useNetworkEngagement from "@/hooks/api/homePage/useNetworkEngagement";
import { cn } from "@/lib/utils";
import { computeTrendPct } from "@/utils/chartUtils";

const NetworkEngagementFullChartDialog = dynamic(
  () => import("./NetworkEngagementFullChartDialog"),
  { ssr: false }
);

// For ghost-posting rates a falling trend is the good direction, so coloring is
// driven by positiveIsGood rather than the raw sign.
const TrendBadge: React.FC<{
  value: number;
  positiveIsGood: boolean;
  locale: string;
}> = ({ value, positiveIsGood, locale }) => {
  const up = value > 0;
  const good = up === positiveIsGood;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
        good ? "text-explorer-light-green" : "text-rose-600 dark:text-rose-400"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 2 })}%
    </span>
  );
};

const NetworkEngagementCard = () => {
  const { t, locale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fromDate = useMemo(() => moment().subtract(30, "days").toDate(), []);

  const {
    networkEngagement,
    isNetworkEngagementLoading,
    isNetworkEngagementError,
  } = useNetworkEngagement(fromDate, undefined, "day");

  const chartData = useMemo(() => {
    if (!networkEngagement || networkEngagement.length === 0) return [];
    return [...networkEngagement].sort((a, b) =>
      a.period < b.period ? -1 : 1
    );
  }, [networkEngagement]);

  // KPIs are computed over mature (non-provisional) buckets only.
  const base = useMemo(() => {
    const mature = chartData.filter(
      (d) => !isEngagementBucketProvisional(d.period, "day")
    );
    return mature.length ? mature : chartData;
  }, [chartData]);

  const lastMature = base.length ? base[base.length - 1] : null;
  const lastDateLabel = lastMature
    ? moment(lastMature.period).format("MMM D")
    : "";

  const mean = (sel: (d: (typeof base)[number]) => number) =>
    base.length ? base.reduce((s, d) => s + sel(d), 0) / base.length : null;

  const kpis: {
    key: string;
    labelKey: string;
    Icon: typeof ThumbsUp;
    value: number | null;
    last: number | null;
    trend: number | null;
    pct: boolean;
    positiveIsGood: boolean;
  }[] = [
    {
      key: "votes",
      labelKey: "networkEngagementCard.avgVotes",
      Icon: ThumbsUp,
      value: mean((d) => d.avg_votes_per_post),
      last: lastMature?.avg_votes_per_post ?? null,
      trend: computeTrendPct(base.map((d) => d.avg_votes_per_post)),
      pct: false,
      positiveIsGood: true,
    },
    {
      key: "comments",
      labelKey: "networkEngagementCard.avgComments",
      Icon: MessageSquare,
      value: mean((d) => d.avg_comments_per_post),
      last: lastMature?.avg_comments_per_post ?? null,
      trend: computeTrendPct(base.map((d) => d.avg_comments_per_post)),
      pct: false,
      positiveIsGood: true,
    },
    {
      key: "zeroVote",
      labelKey: "networkEngagementCard.zeroVotePct",
      Icon: Ghost,
      value: mean((d) => d.zero_vote_post_pct),
      last: lastMature?.zero_vote_post_pct ?? null,
      trend: computeTrendPct(base.map((d) => d.zero_vote_post_pct)),
      pct: true,
      positiveIsGood: false,
    },
    {
      key: "zeroComment",
      labelKey: "networkEngagementCard.zeroCommentPct",
      Icon: EyeOff,
      value: mean((d) => d.zero_comment_post_pct),
      last: lastMature?.zero_comment_post_pct ?? null,
      trend: computeTrendPct(base.map((d) => d.zero_comment_post_pct)),
      pct: true,
      positiveIsGood: false,
    },
  ];

  const fmt = (v: number, pct: boolean) =>
    pct
      ? `${v.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
      : v.toLocaleString(locale, { maximumFractionDigits: 1 });

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("widgets.networkEngagementName")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="p-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          {kpis.map(
            ({
              key,
              labelKey,
              Icon,
              value,
              last,
              trend,
              pct,
              positiveIsGood,
            }) => (
              <div
                key={key}
                className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center"
              >
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                    {t(labelKey)}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {t("networkEngagementCard.avg30d")}
                  </span>
                </div>
                {isNetworkEngagementLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mt-1" />
                ) : isNetworkEngagementError ? (
                  <p className="text-red-500 text-[11px] mt-1">
                    {t("common.errorLoadingData")}
                  </p>
                ) : value !== null ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                        {fmt(value, pct)}
                      </p>
                      {trend !== null && (
                        <TrendBadge
                          value={trend}
                          positiveIsGood={positiveIsGood}
                          locale={locale}
                        />
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Icon className="h-3 w-3 shrink-0" />
                      {last !== null &&
                        `${t("networkEngagementCard.latest")} ${fmt(last, pct)} (${lastDateLabel})`}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">
                    {t("common.noDataAvailable")}
                  </p>
                )}
              </div>
            )
          )}
        </div>

        <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {t("networkEngagementCard.last30Days")}
          </h3>
          {isNetworkEngagementLoading ? (
            <div className="flex items-center justify-center h-[190px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <div className="h-[190px] overflow-hidden">
              <NetworkEngagementChart
                data={chartData}
                granularity="day"
                variant="health"
                tickCount={4}
                dateFormat="MMM D"
                compact
              />
            </div>
          )}
        </div>
      </div>

      <NetworkEngagementFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkEngagementCard;
