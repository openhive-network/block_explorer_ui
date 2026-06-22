import React, { useMemo, useState } from "react";
import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  User,
  Undo2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import useNetworkVoteStats from "@/hooks/api/homePage/useNetworkVoteStats";
import Hive from "@/types/Hive";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

const NetworkVotingActivityFullChartDialog = dynamic(
  () => import("./NetworkVotingActivityFullChartDialog"),
  { ssr: false }
);

const trendPct = (
  current: number,
  previous: number | undefined
): number | null => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const TrendBadge: React.FC<{ value: number | null; label: string }> = ({
  value,
  label,
}) => {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-[10px] font-medium ${positive ? "text-green-500" : "text-red-500"}`}
    >
      {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(value).toFixed(1)}% {label}
    </span>
  );
};

const NetworkVotingActivityCard: React.FC = () => {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cutoff30 = moment().subtract(30, "days").format("YYYY-MM-DD");
  const cutoff60 = moment().subtract(60, "days").format("YYYY-MM-DD");

  const { voteStats, isVoteStatsLoading, isVoteStatsError } =
    useNetworkVoteStats(cutoff60, undefined, "day", settings.liveData);

  const accumulate = (days: Hive.NetworkVoteStatsResponse[]) => {
    if (days.length === 0) return null;
    const totals = days.reduce(
      (acc, d) => ({
        total_votes: acc.total_votes + d.total_votes,
        upvotes: acc.upvotes + d.upvotes,
        downvotes: acc.downvotes + d.downvotes,
        unvotes: acc.unvotes + d.unvotes,
        self_votes: acc.self_votes + d.self_votes,
        unique_voters: acc.unique_voters + d.unique_voters,
      }),
      {
        total_votes: 0,
        upvotes: 0,
        downvotes: 0,
        unvotes: 0,
        self_votes: 0,
        unique_voters: 0,
      }
    );
    const downvote_pct =
      totals.upvotes + totals.downvotes > 0
        ? (totals.downvotes / (totals.upvotes + totals.downvotes)) * 100
        : null;
    return {
      ...totals,
      unique_voters: Math.round(totals.unique_voters / days.length),
      downvote_pct,
    };
  };

  const latest = useMemo(() => {
    if (!voteStats || voteStats.length === 0) return null;
    return accumulate(voteStats.filter((d) => d.period >= cutoff30));
  }, [voteStats, cutoff30]);

  const prev = useMemo(() => {
    if (!voteStats || voteStats.length === 0) return null;
    return accumulate(
      voteStats.filter((d) => d.period >= cutoff60 && d.period < cutoff30)
    );
  }, [voteStats, cutoff60, cutoff30]);

  const pct = (count: number) => {
    if (!latest || latest.total_votes === 0) return "0%";
    return (
      ((count / latest.total_votes) * 100).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  };

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3">
        {/* Card header with date */}
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("widgets.votingActivityName")}
          </span>
          <span className="text-[10px] text-gray-400">
            {t("votingActivityCard.last30Days")}
          </span>
        </div>

        {/* Headline KPIs */}
        <div className="flex gap-2 w-full">
          <div className="flex-1 bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center min-w-[120px]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
              {t("votingActivityCard.totalVotes")}
            </h3>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-4 w-4 mt-1" />
            ) : isVoteStatsError ? (
              <p className="text-red-500 text-[11px] mt-1">
                {t("common.errorLoadingData")}
              </p>
            ) : latest ? (
              <>
                <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                  {latest.total_votes.toLocaleString(locale)}
                </p>
                <TrendBadge
                  value={trendPct(latest.total_votes, prev?.total_votes)}
                  label={t("votingActivityCard.vsPrevPeriod")}
                />
              </>
            ) : (
              <p className="text-gray-500 text-xs mt-1">
                {t("common.noDataAvailable")}
              </p>
            )}
          </div>

          <div className="flex-1 bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center min-w-[120px]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
              {t("votingActivityCard.uniqueVoters")}
            </h3>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-4 w-4 mt-1" />
            ) : isVoteStatsError ? (
              <p className="text-red-500 text-[11px] mt-1">
                {t("common.errorLoadingData")}
              </p>
            ) : latest ? (
              <>
                <p className="text-xl font-bold leading-tight text-blue-500">
                  {latest.unique_voters.toLocaleString(locale)}
                </p>
                <TrendBadge
                  value={trendPct(latest.unique_voters, prev?.unique_voters)}
                  label={t("votingActivityCard.vsPrevPeriod")}
                />
              </>
            ) : null}
          </div>
        </div>

        {/* Vote-type breakdown grid */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Upvotes */}
          <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md border-l-2 border-green-500">
            <h4 className="text-[10px] font-semibold uppercase text-green-600 dark:text-green-400 flex items-center gap-1">
              <ThumbsUp size={11} /> {t("votingActivityCard.upvotes")}
            </h4>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : latest ? (
              <>
                <p className="text-base font-bold text-green-600 dark:text-green-400 leading-tight">
                  {latest.upvotes.toLocaleString(locale)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {pct(latest.upvotes)}
                </p>
              </>
            ) : null}
          </div>

          {/* Downvotes */}
          <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md border-l-2 border-red-500">
            <h4 className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400 flex items-center gap-1">
              <ThumbsDown size={11} /> {t("votingActivityCard.downvotes")}
            </h4>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : latest ? (
              <>
                <p className="text-base font-bold text-red-600 dark:text-red-400 leading-tight">
                  {latest.downvotes.toLocaleString(locale)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {latest.downvote_pct !== null ? (
                    <>
                      {latest.downvote_pct.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      %
                      {latest.downvote_pct < 5 && (
                        <>
                          {" "}
                          &mdash;{" "}
                          <span className="text-green-500">
                            {t("votingActivityCard.healthy")}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </>
            ) : null}
          </div>

          {/* Self-votes */}
          <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md border-l-2 border-amber-500">
            <h4 className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <User size={11} /> {t("votingActivityCard.selfVotes")}
            </h4>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : latest ? (
              <>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 leading-tight">
                  {latest.self_votes.toLocaleString(locale)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {pct(latest.self_votes)}
                </p>
              </>
            ) : null}
          </div>

          {/* Unvotes */}
          <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md border-l-2 border-gray-400">
            <h4 className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Undo2 size={11} /> {t("votingActivityCard.unvotes")}
            </h4>
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : latest ? (
              <>
                <p className="text-base font-bold text-gray-500 dark:text-gray-400 leading-tight">
                  {latest.unvotes.toLocaleString(locale)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {pct(latest.unvotes)}
                </p>
              </>
            ) : null}
          </div>
        </div>

        <div className="w-full flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs underline"
          >
            {t("votingActivityCard.fullChart")}
          </button>
        </div>
      </div>

      <NetworkVotingActivityFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkVotingActivityCard;
