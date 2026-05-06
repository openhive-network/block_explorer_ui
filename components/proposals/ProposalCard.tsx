import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import type { ProcessedProposal } from "@/hooks/api/proposals/useProposals";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber } from "@/lib/utils";
import { convertVestsToHP } from "@/utils/Calculations";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { formatDateToLocale } from "@/utils/TimeUtils";
import { grabNumericValue } from "@/utils/StringUtils";
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Landmark,
  Loader2,
  PenLine,
  Star,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Vote,
  Wallet,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ProposalVotesDialog } from "./ProposalVotesDialog";
import { MatchDetails } from "@/pages/proposals"; // Added
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import useProposalVote from "@/hooks/api/proposals/useProposalVote";
import useVoterProposals from "@/hooks/api/proposals/useVoterProposals";

// Type definitions
type EnrichedProposal = ProcessedProposal & {
  isFunded: boolean;
  status: "active" | "expired" | "inactive";
  matchDetails?: MatchDetails; // Added
};

// --- SUB-COMPONENTS ---

// ICON-BASED MATCH INDICATORS ---
const MatchIndicators = ({
  matchDetails,
  t,
}: {
  matchDetails: MatchDetails;
  t: (key: string) => string;
}) => {
  return (
    <div className="flex items-center flex-shrink-0 gap-2">
      {matchDetails.isCreatorMatch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white animate-in fade-in zoom-in-75 duration-500">
              <User className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("proposalCard.matchCreatorTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {matchDetails.isVoterMatch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white animate-in fade-in zoom-in-75 duration-700">
              <Vote className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("proposalCard.matchVoterTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {matchDetails.isTitleMatch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white animate-in fade-in zoom-in-75 duration-900">
              <PenLine className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("proposalCard.matchTitleTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

const ProposalStatusBadge = ({
  icon: Icon,
  text,
  badgeClasses,
  iconColor,
}: any) => {
  if (!Icon) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold",
        badgeClasses
      )}
    >
      <Icon
        className="h-3.5 w-3.5"
        color={iconColor}
      />
      {text}
    </div>
  );
};

// --- Funding Progress Bar Component ---
export const FundingProgressBar = ({
  currentVotes,
  threshold,
  t,
}: {
  currentVotes: number;
  threshold: number;
  t: (key: string) => string;
}) => {
  const percentage =
    threshold > 0 ? Math.min((currentVotes / threshold) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {t("proposalCard.fundingProgress")}
        </span>
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {percentage.toFixed(2)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-1.5 rounded-full bg-purple-500 transition-width duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const TimeProgressBar = ({
  startDate,
  endDate,
  isUpcoming,
  t,
}: {
  startDate: Date;
  endDate: Date;
  isUpcoming?: boolean;
  t: (key: string) => string;
}) => {
  const now = new Date().getTime();
  const end = endDate.getTime();
  // For upcoming proposals use total duration; for active/expired use time remaining from now
  const diff = isUpcoming
    ? endDate.getTime() - startDate.getTime()
    : end - now;
  let timeRemainingText: string;
  if (!isUpcoming && diff <= 0) {
    timeRemainingText = t("proposalCard.timeEnded");
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const unit =
        days > 1 ? t("proposalCard.timeDays") : t("proposalCard.timeDay");
      timeRemainingText = isUpcoming
        ? `${days} ${unit}`
        : `${days} ${unit} ${t("proposalCard.timeLeft")}`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours > 0) {
        const unit =
          hours > 1 ? t("proposalCard.timeHours") : t("proposalCard.timeHour");
        timeRemainingText = isUpcoming
          ? `${hours} ${unit}`
          : `${hours} ${unit} ${t("proposalCard.timeLeft")}`;
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes > 0) {
          const unit =
            minutes > 1
              ? t("proposalCard.timeMins")
              : t("proposalCard.timeMin");
          timeRemainingText = isUpcoming
            ? `${minutes} ${unit}`
            : `${minutes} ${unit} ${t("proposalCard.timeLeft")}`;
        } else {
          timeRemainingText = t("proposalCard.timeEndingSoon");
        }
      }
    }
  }
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = now - startDate.getTime();
  const progress = Math.min(
    100,
    Math.max(0, (elapsedDuration / totalDuration) * 100)
  );

  return (
    <div>
      <div className="mb-1 flex justify-end">
        <span className="text-sm font-semibold text-blue-500">
          {timeRemainingText}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-width duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// --- STAR / WATCH BUTTON ---

const StarButton = ({ proposalId }: { proposalId: number }) => {
  const { isLoggedIn } = useAuth();
  const { isWatched, toggleWatch, changedProposalIds, clearProposalChange } = useWatchlist();
  const { t } = useI18n();
  const watched = isWatched("proposals", proposalId);
  const hasChange = watched && changedProposalIds.has(proposalId);

  if (!isLoggedIn) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => { toggleWatch("proposals", proposalId); clearProposalChange(proposalId); }}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all duration-200",
            watched
              ? "border-amber-400 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:border-amber-500 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-amber-600 dark:hover:text-amber-400"
          )}
          aria-label={t(watched ? "watchlist.removeFromWatchlist" : "watchlist.addToWatchlist")}
        >
          <Star className={cn("h-5 w-5", watched && "fill-amber-400")} />
          {hasChange && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t(watched ? "watchlist.removeFromWatchlist" : "watchlist.addToWatchlist")}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// --- VOTE BUTTON ---

const VoteButton = ({ proposalId, status }: { proposalId: number; status: "active" | "inactive" | "expired" }) => {
  const { t } = useI18n();
  const { isVoted, isVoting, error, vote, isLoggedIn } = useProposalVote(proposalId);

  if (!isLoggedIn) return null;

  if (status === "expired") {
    if (!isVoted) return null;
    return (
      <div className="flex h-9 items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-semibold border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-default select-none opacity-70">
        <Heart className="h-4 w-4 fill-slate-400 dark:fill-slate-500" />
        <span>{t("proposalCard.voted")}</span>
      </div>
    );
  }

  const handleVote = async () => {
    await vote(!isVoted);
    setTimeout(() => {
      document.getElementById(`proposal-${proposalId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleVote}
          disabled={isVoting}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-lg border-2 px-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
            error
              ? "border-orange-300 bg-orange-50 text-orange-500 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
              : isVoted
              ? "border-red-400 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-500 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              : "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-600 dark:hover:text-red-400"
          )}
          aria-label={isVoted ? t("proposalCard.unvote") : t("proposalCard.vote")}
        >
          {isVoting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={cn("h-4 w-4", isVoted && !error && "fill-red-500 dark:fill-red-400")} />
          )}
          <span>{isVoted ? t("proposalCard.voted") : t("proposalCard.vote")}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-center">
        <p>{error ?? (isVoted ? t("proposalCard.unvote") : t("proposalCard.vote"))}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// --- IMPACT SIMULATOR ---

const ImpactSimulator = ({
  proposalId,
  proposalHp,
  fundingThresholdVests,
  status,
}: {
  proposalId: number;
  proposalHp: string | null | undefined;
  fundingThresholdVests: number | null;
  status: "active" | "inactive" | "expired";
}) => {
  const { username, isLoggedIn } = useAuth();
  const { t } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;
  const { votedProposalIds } = useVoterProposals(username ?? "");

  const { data: findAccountData, isLoading: isAccountLoading } = useQuery({
    queryKey: ["findAccount", username],
    queryFn: () => fetchingService.findAccounts([username!]),
    enabled: !!username && isLoggedIn,
    refetchOnWindowFocus: false,
  });

  if (!isLoggedIn || status === "expired") return null;

  if (isAccountLoading || !findAccountData?.accounts?.[0] || !dynamicGlobalData || !hiveChain || !proposalHp) {
    return <div className="h-4" />;
  }

  const account = findAccountData.accounts[0] as any;
  const hasProxy = (account.proxy || "") !== "";
  if (hasProxy) return null;

  // Mirror ProposalVotesDialog: directVests (NaiAsset) + proxied_vsf_votes
  const directVests = grabNumericValue(account.vesting_shares?.amount ?? "0");
  const totalProxiedVests =
    Array.isArray(account.proxied_vsf_votes) && account.proxied_vsf_votes.length > 0
      ? account.proxied_vsf_votes.reduce((sum: number, v: unknown) => Number(sum) + Number(v), 0)
      : 0;
  const userEffectiveVests = directVests + totalProxiedVests;

  const { rawTotalVestingFundHive, rawTotalVestingShares } = dynamicGlobalData.headBlockDetails;
  const userHpStr = convertVestsToHP(hiveChain, String(userEffectiveVests), rawTotalVestingFundHive, rawTotalVestingShares) ?? "";
  const userHpNum = grabNumericValue(userHpStr);
  const userHpDisplayStr = `${formatNumber(userHpNum, false, true)} HP`;

  const isVoted = !!(votedProposalIds ?? []).includes(proposalId);
  // Work entirely in HP to avoid NaiAsset vs condenser scale mismatch
  const proposalHpNum = grabNumericValue(proposalHp);
  const simulatedHpNum = isVoted ? proposalHpNum - userHpNum : proposalHpNum + userHpNum;
  const simulatedHpStr = `${formatNumber(simulatedHpNum, false, true)} HP`;

  const fundingThresholdHp =
    fundingThresholdVests != null
      ? grabNumericValue(
          convertVestsToHP(hiveChain, String(fundingThresholdVests), rawTotalVestingFundHive, rawTotalVestingShares) ?? "0"
        )
      : null;
  const isFunded = fundingThresholdHp != null ? proposalHpNum > fundingThresholdHp : false;
  const wouldBeFunded = fundingThresholdHp != null ? simulatedHpNum > fundingThresholdHp : false;
  const wouldBecomeFunded = !isVoted && !isFunded && wouldBeFunded;
  const wouldBeUnfunded = isVoted && isFunded && !wouldBeFunded;

  const Icon = isVoted ? TrendingDown : TrendingUp;
  const sign = isVoted ? "−" : "+";
  const actionLabel = isVoted ? t("impactSimulator.ifUnvoted") : t("impactSimulator.ifVoted");
  const hoverIconColor = isVoted
    ? "group-hover/impact:text-amber-500 dark:group-hover/impact:text-amber-400"
    : "group-hover/impact:text-green-500 dark:group-hover/impact:text-green-400";
  const hoverTextColor = isVoted
    ? "group-hover/impact:text-amber-600 dark:group-hover/impact:text-amber-400"
    : "group-hover/impact:text-green-600 dark:group-hover/impact:text-green-400";

  return (
    <div className="group/impact flex items-center gap-1 text-xs cursor-default select-none min-h-[18px]">
      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0 transition-colors duration-150 text-slate-300 dark:text-slate-600", hoverIconColor)} />
      <span className={cn("transition-colors duration-150 text-slate-300 dark:text-slate-600", hoverTextColor)}>
        {actionLabel}&nbsp;<span className="font-medium">{sign}{userHpDisplayStr}</span>
      </span>
      <span className="overflow-hidden max-w-0 group-hover/impact:max-w-xs transition-all duration-200 whitespace-nowrap text-slate-500 dark:text-slate-400">
        &nbsp;→&nbsp;{simulatedHpStr}&nbsp;total
        {wouldBecomeFunded && <span className="text-green-500 dark:text-green-400 font-semibold">&nbsp;·&nbsp;{t("impactSimulator.wouldFund")}</span>}
        {wouldBeUnfunded && <span className="text-amber-500 dark:text-amber-400 font-semibold">&nbsp;·&nbsp;{t("impactSimulator.wouldUnfund")}</span>}
      </span>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface ProposalCardProps {
  proposal: EnrichedProposal;
  fundingThreshold?: number;
}

export const ProposalCard = ({
  proposal,
  fundingThreshold,
}: ProposalCardProps) => {
  const { t, locale } = useI18n();
  const proposalInternalUrl = `/proposal/@${proposal.creator}/${proposal.permlink}`;

  const dailyPayValue = parseFloat(proposal.daily_pay) || 0;
  const totalMs = proposal.end_date.getTime() - proposal.start_date.getTime();
  const totalDays = totalMs > 0 ? totalMs / (1000 * 60 * 60 * 24) : 0;
  const totalHbdToBePaid = dailyPayValue * totalDays;
  const remainingMs = proposal.end_date.getTime() - new Date().getTime();
  const remainingDays = Math.max(0, remainingMs / (1000 * 60 * 60 * 24));

  // If the proposal is inactive, remaining pay is equal to total. Else, we calculate it based on remaining days
  const remainingHbdToBePaid =
    !proposal.isFunded && proposal.status == "inactive"
      ? totalHbdToBePaid
      : dailyPayValue * remainingDays;

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const voteValueInHp =
    dynamicGlobalData && hiveChain
      ? convertVestsToHP(
          hiveChain,
          proposal.total_votes,
          dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
          dynamicGlobalData.headBlockDetails.rawTotalVestingShares
        )
      : null;

  const formattedVestsTooltip = `${formatNumber(
    proposal.total_votes,
    true,
    false
  )} VESTS`;

  const votesNeededInVests = useMemo(() => {
    const currentVotes = parseFloat(proposal.total_votes);
    if (
      fundingThreshold &&
      !proposal.isFunded &&
      fundingThreshold > currentVotes
    ) {
      return fundingThreshold - currentVotes;
    }
    return null;
  }, [fundingThreshold, proposal.isFunded, proposal.total_votes]);

  const votesNeededInHp = useMemo(() => {
    if (votesNeededInVests && dynamicGlobalData && hiveChain) {
      return convertVestsToHP(
        hiveChain,
        votesNeededInVests.toString(),
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
    }
    return null;
  }, [votesNeededInVests, dynamicGlobalData, hiveChain]);

  const formattedNeededVestsTooltip = votesNeededInVests
    ? `${formatNumber(votesNeededInVests, true, false)} VESTS`
    : "";

  const statusConfig = {
    active: {
      icon: CheckCircle,
      text: t("proposalCard.statusActive"),
      badgeClasses:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20",
      iconColor: "#16a34a",
    },
    expired: {
      icon: XCircle,
      text: t("proposalCard.statusExpired"),
      badgeClasses:
        "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20",
      iconColor: "#dc2626",
    },
    inactive: {
      icon: Clock,
      text: t("proposalCard.statusInactive"),
      badgeClasses:
        "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
      iconColor: "#475569",
    },
  };
  const currentStatusConfig = statusConfig[proposal.status];

  const isReceiverVisible =
    proposal.receiver && proposal.receiver !== proposal.creator;

  const highlightClass = useMemo(() => {
    if (!proposal.matchDetails) return "border-l-transparent";
    if (proposal.matchDetails.isCreatorMatch)
      return "border-l-purple-500 dark:border-l-purple-400";
    if (proposal.matchDetails.isVoterMatch)
      return "border-l-blue-500 dark:border-l-blue-400";
    if (proposal.matchDetails.isTitleMatch)
      return "border-l-slate-500 dark:border-l-slate-400";
    return "border-l-transparent";
  }, [proposal.matchDetails]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        id={`proposal-${proposal.proposal_id}`}
        className={cn(
          "group rounded-xl border bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-lg dark:bg-theme dark:border-slate-800",
          "border-l-4",
          highlightClass
        )}
      >
        <div className="flex flex-col md:grid md:grid-cols-12">
          <div className="flex flex-col p-4 md:col-span-7 lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
              <div className="flex items-baseline gap-2">
                <Link
                  href={proposalInternalUrl}
                  className="text-xl font-bold line-clamp-2 text-link hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {proposal.subject}
                </Link>
                <span className="flex-shrink-0 text-xl font-bold text-slate-400 dark:text-slate-500">
                  #{proposal.proposal_id}
                </span>
              </div>
              {proposal.matchDetails && (
                <MatchIndicators
                  matchDetails={proposal.matchDetails}
                  t={t}
                />
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-explorer-dark-gray">
              <div className="flex items-center gap-2">
                <Image
                  src={getHiveAvatarUrl(proposal.creator)}
                  alt={proposal.creator}
                  width={50}
                  height={50}
                  className="h-8 w-8 rounded-full"
                />
                <span>{t("proposalCard.byCreatorPrefix")}</span>
                <Link
                  href={`/@${proposal.creator}`}
                  className="text-link font-semibold"
                >
                  {proposal.creator}
                </Link>
              </div>
              {isReceiverVisible ? (
                <div className="flex items-center gap-2">
                  <User
                    className="h-4 w-4"
                    color="#94a3b8"
                  />
                  <span>{t("proposalCard.receiverPrefix")}</span>
                  <Link
                    href={`/@${proposal.receiver}`}
                    className="text-link font-semibold truncate"
                  >
                    {proposal.receiver}
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex items-center gap-2 text-base text-explorer-dark-gray">
              <Calendar
                className="h-4 w-4 flex-shrink-0"
                color="#94a3b8"
              />
              <span>{`${formatDateToLocale(
                proposal.start_date,
                locale
              )} - ${formatDateToLocale(proposal.end_date, locale)}`}</span>
            </div>

            <div className="mt-auto pt-4 space-y-4">
              {!proposal.isFunded &&
                fundingThreshold &&
                fundingThreshold > 0 && (
                  <FundingProgressBar
                    currentVotes={parseFloat(proposal.total_votes)}
                    threshold={fundingThreshold}
                    t={t}
                  />
                )}
              <TimeProgressBar
                startDate={proposal.start_date}
                endDate={proposal.end_date}
                isUpcoming={proposal.status === "inactive"}
                t={t}
              />
            </div>
          </div>

          <div className="flex flex-col border-t p-4 md:col-span-5 lg:col-span-4 md:border-t-0 md:border-l dark:border-slate-800">
            <div>
              <div className="flex justify-end items-center gap-2 mb-4">
                <VoteButton proposalId={proposal.proposal_id} status={proposal.status} />
                <StarButton proposalId={proposal.proposal_id} />
                {currentStatusConfig && (
                  <ProposalStatusBadge {...currentStatusConfig} />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-explorer-dark-gray dark:text-white">
                    <Award
                      className="h-4 w-4"
                      color="#a855f7"
                    />
                    {t("proposalCard.votesLabel")}
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-2xl font-bold min-w-0 cursor-default">
                          {voteValueInHp ? (
                            <span>{voteValueInHp}</span>
                          ) : (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          )}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formattedVestsTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                     <ImpactSimulator
                      proposalId={proposal.proposal_id}
                      proposalHp={voteValueInHp}
                      fundingThresholdVests={fundingThreshold ?? null}
                      status={proposal.status}
                    />
                </div>
                {votesNeededInHp && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                          <Landmark className="h-4 w-4" />
                          {t("proposalCard.neededToFund")}
                        </div>
                        <p className="text-xl font-bold min-w-0 text-amber-600 dark:text-amber-500">
                          <span className="truncate">{votesNeededInHp}</span>
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formattedNeededVestsTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <div>
                  <div className="flex items-center gap-2 text-sm text-explorer-dark-gray dark:text-white">
                    <DollarSign
                      className="h-4 w-4"
                      color="#16a34a"
                    />
                    {t("proposalCard.dailyPayLabel")}
                  </div>
                  <p className="text-2xl font-bold">
                    {dailyPayValue.toLocaleString()} HBD
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-auto pt-4">
              <div className="border-t dark:border-slate-800 pt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-explorer-dark-gray dark:text-white">
                    <Landmark
                      className="h-4 w-4"
                      color="#94a3b8"
                    />
                    {t("proposalCard.totalPayoutLabel")}
                  </div>
                  <p className="font-semibold">
                    {totalHbdToBePaid.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    HBD
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-explorer-dark-gray dark:text-white">
                    <Wallet
                      className="h-4 w-4"
                      color="#94a3b8"
                    />
                    {t("proposalCard.remainingPayoutLabel")}
                  </div>
                  <p className="font-semibold">
                    {remainingHbdToBePaid.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    HBD
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <ProposalVotesDialog proposalId={proposal.proposal_id}>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {t("proposalCard.viewVotesButton")}
                  </Button>
                </ProposalVotesDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// --- SKELETON COMPONENT ---

export const ProposalCardSkeleton = () => (
  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-theme">
    <div className="flex animate-pulse flex-col md:grid md:grid-cols-12">
      <div className="flex flex-col p-4 md:col-span-7 lg:col-span-8">
        <div className="h-7 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="mt-3 space-y-2">
          <div className="h-5 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="mt-2 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="mt-auto pt-4">
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="flex flex-col border-t p-4 md:col-span-5 lg:col-span-4 md:border-t-0 md:border-l dark:border-slate-800">
        <div>
          <div className="flex justify-end mb-4">
            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="space-y-4">
            <div className="h-12 rounded-md bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-12 rounded-md bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="border-t dark:border-slate-800 pt-3 space-y-2">
            <div className="h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="mt-4">
            <div className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- RETURN PROPOSAL CARD ---
export const ReturnProposalCard = ({
  proposal,
}: {
  proposal: EnrichedProposal;
}) => {
  const { t, locale } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const proposalInternalUrl = `/proposal/@${proposal.creator}/${proposal.permlink}`;

  const voteValueInHp =
    dynamicGlobalData && hiveChain
      ? convertVestsToHP(
          hiveChain,
          proposal.total_votes,
          dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
          dynamicGlobalData.headBlockDetails.rawTotalVestingShares
        )
      : null;

  const formattedVestsTooltip = `${formatNumber(
    proposal.total_votes,
    true,
    false
  )} VESTS`;
  const totalMs = proposal.end_date.getTime() - proposal.start_date.getTime();
  const totalDays =
    totalMs > 0 ? Math.round(totalMs / (1000 * 60 * 60 * 24)) : 0;

  const statusConfig = {
    active: {
      icon: CheckCircle,
      text: t("proposalCard.statusActive"),
      badgeClasses:
        "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-500/20",
      iconColor: "#16a34a",
    },
    expired: {
      icon: XCircle,
      text: t("proposalCard.statusExpired"),
      badgeClasses:
        "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/20",
      iconColor: "#dc2626",
    },
    inactive: {
      icon: Clock,
      text: t("proposalCard.statusInactive"),
      badgeClasses:
        "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800",
      iconColor: "#475569",
    },
  };
  const currentStatusConfig = statusConfig[proposal.status];

  const highlightClass = useMemo(() => {
    if (!proposal.matchDetails) return "border-l-red-500";
    if (proposal.matchDetails.isCreatorMatch) return "border-l-purple-500";
    if (proposal.matchDetails.isVoterMatch) return "border-l-blue-500";
    if (proposal.matchDetails.isTitleMatch) return "border-l-slate-500";
    return "border-l-red-500";
  }, [proposal.matchDetails]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "group rounded-xl border border-slate-200 bg-green-100/80 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 border-l-4",
          highlightClass
        )}
      >
        <div className="flex flex-col md:grid md:grid-cols-12">
          <div className="flex flex-col p-4 md:col-span-7 lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
              <div className="flex items-baseline gap-2">
                <Link
                  href={proposalInternalUrl}
                  className="text-xl font-bold text-link hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {proposal.subject}
                </Link>
                <span className="flex-shrink-0 text-xl font-bold">
                  #{proposal.proposal_id}
                </span>
              </div>
              {proposal.matchDetails && (
                <MatchIndicators
                  matchDetails={proposal.matchDetails}
                  t={t}
                />
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-explorer-dark-gray">
              <div className="flex items-center gap-2">
                <Image
                  src={getHiveAvatarUrl(proposal.creator)}
                  alt={proposal.creator}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full"
                />
                <span>{t("proposalCard.byCreatorPrefix")}</span>
                <Link
                  href={`/@${proposal.creator}`}
                  className="text-link font-semibold"
                >
                  {proposal.creator}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <User
                  className="h-4 w-4"
                  color="#94a3b8"
                />
                <span>{t("proposalCard.receiverPrefix")}</span>
                <Link
                  href={`/@${proposal.receiver}`}
                  className="text-link font-semibold truncate"
                >
                  {proposal.receiver}
                </Link>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-base text-explorer-dark-gray">
              <Calendar
                className="h-4 w-4 flex-shrink-0"
                color="#94a3b8"
              />
              <span>{`${formatDateToLocale(
                proposal.start_date,
                locale
              )} - ${formatDateToLocale(
                proposal.end_date,
                locale
              )} (${totalDays} ${t("proposalCard.timeDays")})`}</span>
            </div>

            <p className="mt-4 text-slate-600 dark:text-slate-300">
              {t("returnProposalCard.description")}
            </p>
          </div>

          <div className="flex flex-col border-t p-4 md:col-span-5 lg:col-span-4 md:border-t-0 md:border-l dark:border-slate-700/80">
            <div className="flex justify-end items-center gap-2">
              <StarButton proposalId={proposal.proposal_id} />
              {currentStatusConfig && (
                <ProposalStatusBadge {...currentStatusConfig} />
              )}
            </div>
            <div className="flex flex-grow flex-col justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-explorer-dark-gray">
                      <Landmark
                        className="h-4 w-4"
                        color="#64748b"
                      />
                      {t("returnProposalCard.fundingThresholdLabel")}
                    </div>
                    <p className="text-4xl font-bold min-w-0 text-slate-800 dark:text-slate-100">
                      {voteValueInHp ? (
                        <span className="truncate">{voteValueInHp}</span>
                      ) : (
                        <Loader2 className="h-9 w-9 animate-spin" />
                      )}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formattedVestsTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-4">
              <ProposalVotesDialog proposalId={proposal.proposal_id}>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {t("proposalCard.viewVotesButton")}
                </Button>
              </ProposalVotesDialog>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
