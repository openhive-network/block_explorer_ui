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
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Landmark,
  Loader2,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ProposalVotesDialog } from "./ProposalVotesDialog";

// Type definitions
type EnrichedProposal = ProcessedProposal & {
  isFunded: boolean;
  status: "active" | "expired" | "inactive";
};

// --- SUB-COMPONENTS ---

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
const FundingProgressBar = ({
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

const TimeProgressBar = ({
  startDate,
  endDate,
  t,
}: {
  startDate: Date;
  endDate: Date;
  t: (key: string) => string;
}) => {
  const now = new Date().getTime();
  const end = endDate.getTime();
  const diff = end - now;
  let timeRemainingText: string;
  if (diff <= 0) {
    timeRemainingText = t("proposalCard.timeEnded");
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      const unit =
        days > 1 ? t("proposalCard.timeDays") : t("proposalCard.timeDay");
      timeRemainingText = `${days} ${unit} ${t("proposalCard.timeLeft")}`;
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours > 0) {
        const unit =
          hours > 1 ? t("proposalCard.timeHours") : t("proposalCard.timeHour");
        timeRemainingText = `${hours} ${unit} ${t("proposalCard.timeLeft")}`;
      } else {
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes > 0) {
          const unit =
            minutes > 1
              ? t("proposalCard.timeMins")
              : t("proposalCard.timeMin");
          timeRemainingText = `${minutes} ${unit} ${t(
            "proposalCard.timeLeft"
          )}`;
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
  const remainingHbdToBePaid = dailyPayValue * remainingDays;

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
    true
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
    ? `${formatNumber(votesNeededInVests, true, true)} VESTS`
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="group rounded-xl border bg-slate-50 shadow-sm transition-shadow duration-300 hover:shadow-md dark:bg-theme dark:border-slate-800">
        <div className="flex flex-col md:grid md:grid-cols-12">
          <div className="flex flex-col p-4 md:col-span-7 lg:col-span-8">
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
                t={t}
              />
            </div>
          </div>

          <div className="flex flex-col border-t p-4 md:col-span-5 lg:col-span-4 md:border-t-0 md:border-l dark:border-slate-800">
            <div>
              <div className="flex justify-end mb-4">
                {currentStatusConfig && (
                  <ProposalStatusBadge {...currentStatusConfig} />
                )}
              </div>
              <div className="space-y-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-explorer-dark-gray dark:text-white">
                        <Award
                          className="h-4 w-4"
                          color="#a855f7"
                        />
                        {t("proposalCard.votesLabel")}
                      </div>
                      <p className="text-2xl font-bold min-w-0">
                        {voteValueInHp ? (
                          <span>{voteValueInHp}</span>
                        ) : (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        )}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{formattedVestsTooltip}</p>
                  </TooltipContent>
                </Tooltip>
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
    true
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="group rounded-xl border border-slate-200 bg-green-100/80 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/40 border-l-4 border-l-red-500">
        <div className="flex flex-col md:grid md:grid-cols-12">
          <div className="flex flex-col p-4 md:col-span-7 lg:col-span-8">
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
            <div className="flex justify-end">
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