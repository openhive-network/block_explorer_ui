import React, { useMemo } from "react";
import { TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VotingActivityKpiStripProps {
  data: Hive.NetworkVoteStatsResponse[];
  granularity: "day" | "week" | "month";
}

const VotingActivityKpiStrip: React.FC<VotingActivityKpiStripProps> = ({
  data,
  granularity,
}) => {
  const { t, locale } = useI18n();

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const todayStr = moment().format("YYYY-MM-DD");

    let totalVotes = 0;
    let totalUpvotes = 0;
    let totalDownvotes = 0;
    let totalSelfVotes = 0;
    let peakEntry = data[0];
    const firstPeriod = data[0];
    let lastCompleted: Hive.NetworkVoteStatsResponse | null = null;

    for (const d of data) {
      totalVotes += d.total_votes;
      totalUpvotes += d.upvotes;
      totalDownvotes += d.downvotes;
      totalSelfVotes += d.self_votes;
      if (d.total_votes > peakEntry.total_votes) peakEntry = d;
      if (d.period < todayStr) lastCompleted = d;
    }

    const avgPerPeriod = Math.round(totalVotes / data.length);
    const downvotePct =
      totalUpvotes + totalDownvotes > 0
        ? (totalDownvotes / (totalUpvotes + totalDownvotes)) * 100
        : null;
    const upvotePct = totalVotes > 0 ? (totalUpvotes / totalVotes) * 100 : null;
    const selfVotePct =
      totalVotes > 0 ? (totalSelfVotes / totalVotes) * 100 : null;

    const trendPct =
      lastCompleted !== null &&
      lastCompleted.period !== firstPeriod.period &&
      firstPeriod.total_votes > 0
        ? ((lastCompleted.total_votes - firstPeriod.total_votes) /
            firstPeriod.total_votes) *
          100
        : null;

    return {
      totalVotes,
      totalUpvotes,
      totalDownvotes,
      totalSelfVotes,
      avgPerPeriod,
      downvotePct,
      upvotePct,
      selfVotePct,
      peakEntry,
      trendPct,
    };
  }, [data]);

  if (!stats) return null;

  const {
    totalVotes,
    totalUpvotes,
    totalDownvotes,
    totalSelfVotes,
    avgPerPeriod,
    downvotePct,
    upvotePct,
    selfVotePct,
    peakEntry,
    trendPct,
  } = stats;

  const selfVoteHealthLabel =
    selfVotePct === null
      ? null
      : selfVotePct < 5
        ? t("votingActivityKpiStrip.selfVoteHealthLow")
        : selfVotePct < 10
          ? t("votingActivityKpiStrip.selfVoteHealthModerate")
          : t("votingActivityKpiStrip.selfVoteHealthHigh");

  const selfVoteHealthColor =
    selfVotePct === null
      ? ""
      : selfVotePct < 5
        ? "text-explorer-light-green"
        : selfVotePct < 10
          ? "text-amber-500"
          : "text-rose-600 dark:text-rose-400";

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
      <KpiTile
        label={t("votingActivityKpiStrip.totalVotes")}
        value={totalVotes.toLocaleString(locale)}
      />
      <KpiTile
        label={t("votingActivityKpiStrip.upvotes")}
        value={totalUpvotes.toLocaleString(locale)}
        sub={
          upvotePct !== null
            ? `${upvotePct.toLocaleString(locale, { maximumFractionDigits: 1 })}% ${t("votingActivityKpiStrip.ofTotal")}`
            : undefined
        }
      />
      <KpiTile
        label={t("votingActivityKpiStrip.downvoteRate")}
        value={
          downvotePct !== null
            ? `${downvotePct.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
            : "—"
        }
        sub={`${totalDownvotes.toLocaleString(locale)} ${t("votingActivityKpiStrip.downvotes")}`}
      />
      <KpiTile
        label={t("votingActivityKpiStrip.selfVoteRate")}
        infoText={t("votingActivityKpiStrip.selfVoteRateInfo")}
        value={
          selfVotePct !== null
            ? `${selfVotePct.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
            : "—"
        }
        sub={
          selfVoteHealthLabel !== null
            ? `${totalSelfVotes.toLocaleString(locale)} ${t("votingActivityKpiStrip.selfVotes")}`
            : undefined
        }
        subBadge={selfVoteHealthLabel ?? undefined}
        subBadgeColor={selfVoteHealthColor}
      />
      <KpiTile
        label={t("votingActivityKpiStrip.avgPerPeriod", {
          period: periodLabel,
        })}
        value={avgPerPeriod.toLocaleString(locale)}
        sub={t("votingActivityKpiStrip.votes")}
      />
      <KpiTile
        label={t("votingActivityKpiStrip.peakPeriod")}
        value={moment(peakEntry.period).format(peakDateFmt)}
        sub={`${peakEntry.total_votes.toLocaleString(locale)} ${t("votingActivityKpiStrip.votes")}`}
      />
      <KpiTile
        label={t("votingActivityKpiStrip.trend")}
        value={
          <span className="inline-flex items-center gap-1 flex-wrap">
            <span className={cn("inline-flex items-center gap-1", trendColor)}>
              <TrendIcon size={13} />
              {trendPct !== null
                ? `${trendPct >= 0 ? "+" : ""}${trendPct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
                : "—"}
            </span>
            {trendPct !== null && (
              <span className="text-gray-400 font-normal text-[10px]">
                {t("votingActivityKpiStrip.inTotalVotes")}
              </span>
            )}
          </span>
        }
        sub={t("votingActivityKpiStrip.vsPeriodStart")}
      />
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  subBadge?: string;
  subBadgeColor?: string;
  infoText?: string;
}> = ({ label, value, sub, subBadge, subBadgeColor, infoText }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide leading-none flex items-center gap-1">
      <span>{label}</span>
      {infoText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-400 hover:text-gray-500 cursor-help flex-shrink-0">
                <Info size={10} />
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[240px] text-[11px] text-center"
              >
                {infoText}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
      {value}
    </div>
    {(sub || subBadge) && (
      <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
        {sub && <span>{sub}</span>}
        {subBadge && (
          <span className={cn("font-medium", subBadgeColor)}>{subBadge}</span>
        )}
      </div>
    )}
  </div>
);

export default VotingActivityKpiStrip;
