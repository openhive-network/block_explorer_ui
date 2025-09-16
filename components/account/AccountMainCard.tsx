import React, { useEffect, useState } from "react";
import {
  Link,
  Star,
  PenSquare,
  CalendarDays,
  Repeat,
  Loader2,
  History,
  Vote,
  ShieldCheck,
  AlertTriangle,
  ShieldOff,
  Building2,
  UserPlus,
  UserCheck,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useManabars from "@/hooks/api/accountPage/useManabars";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Toggle } from "../ui/toggle";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import { config } from "@/Config";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/hybrid-tooltip";
import list from "../../utils/BadActorList";
import ErrorMessage from "../ErrorMessage";
import { Button } from "../ui/button";
import { useI18n } from "../../i18n/i18n";
import TimeAgo from "timeago-react";
import useProposalVoteCount from "@/hooks/api/accountPage/useProposalVoteCount";
import moment from "moment";

import { useSettings } from "@/contexts/SettingsContext";
import { Progress } from "@/components/ui/progress";
import RadialProgress from "../RadialProgress";

interface AccountMainCardProps {
  accountDetails: Explorer.FormattedAccountDetails;
  accountName: string;
  isWitnessError?: boolean;
  isWitnessLoading?: boolean;
  openVotersModal: () => void;
  openVotesHistoryModal: () => void;
  openFollowersModal: () => void;
  openFollowingModal: () => void;
  openSubscriptionsModal: () => void;
  liveDataEnabled: boolean;
  changeLiveRefresh: () => void;
  isForCommunity?: boolean;
}

const StatCard = ({
  icon,
  label,
  value,
  onClick,
  tooltipContent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  tooltipContent?: React.ReactNode;
}) => {
  const cardDiv = (
    <div
      className={cn(
        "bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl flex flex-col items-center justify-center text-center",
        {
          "hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors cursor-pointer":
            !!onClick,
          "cursor-help": !!tooltipContent,
        }
      )}
      onClick={onClick}
      role={onClick ? "button" : "figure"}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onClick) onClick();
      }}
    >
      <div className="text-explorer-orange mb-1">{icon}</div>
      <div className="mb-1 text-base font-bold text-explorer-dark-gray dark:text-white min-h-[1.5rem] flex items-center justify-center">
        {value}
      </div>
      <p className="text-[10px] text-explorer-light-gray dark:text-white uppercase font-semibold tracking-wider">
        {label}
      </p>
    </div>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardDiv}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardDiv;
};

const AccountMainCard: React.FC<AccountMainCardProps> = ({
  accountDetails,
  accountName,
  isWitnessError,
  isWitnessLoading,
  openVotersModal,
  openVotesHistoryModal,
  openFollowersModal,
  openFollowingModal,
  openSubscriptionsModal,
  liveDataEnabled,
  changeLiveRefresh,
  isForCommunity = false,
}) => {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const { manabarsData } = useManabars(accountName, liveDataEnabled);
  const { witnessDetails } = useWitnessDetails(
    accountName,
    accountDetails.is_witness
  );
  const {
    voteCount: proposalVoteCount,
    isLoading: isVoteCountLoading,
  } = useProposalVoteCount(accountName);

  const isWitnessActive =
    witnessDetails?.signing_key !== config.inactiveWitnessKey;

  const [isBadActor, setIsBadActor] = useState(false);
  useEffect(() => {
    // Check if the accountName is in the list
    if (list.includes(accountName)) {
      setIsBadActor(true);
    }
  }, [accountName]);

  const handleCloseWarning = () => {
    setIsBadActor(false);
  };

  let profileMetadata;
  try {
    profileMetadata = JSON.parse(accountDetails.posting_json_metadata);
  } catch (error) {
    profileMetadata = null;
  }

  const about = profileMetadata?.profile?.about || "";
  const lastPostDate = moment.utc(accountDetails.last_post).toDate();

  const lastActiveValue =
    lastPostDate.getFullYear() <= 1970 ? (
      <span className="text-sm">{t("accountMainCard.never")}</span>
    ) : (
      <TimeAgo className="text-sm" locale={locale} datetime={lastPostDate} />
    );


const getGovernanceHealthStatus = () => {
  const expirationTs = accountDetails.governance_vote_expiration_ts;
  if (!expirationTs) {
    return null;
  }

  const expirationDate = moment(expirationTs);
  const now = moment();

  const threeMonthsFromNow = moment().add(3, "months");

  if (expirationDate.isBefore(now)) {
    return {
      icon: <ShieldOff size={20} color="#ef4444" />,
      label: t("accountMainCard.governanceHealth"),
      value: (
        <span className="text-sm text-red-500">
          {t("accountMainCard.governanceExpired")}
        </span>
      ),
      tooltipContent: (
        <p>
          {t("accountMainCard.governanceExpiredTooltip")} {String(expirationTs)}
        </p>
      ),
    };
  }

  if (expirationDate.isBefore(threeMonthsFromNow)) {
    return {
      icon: <AlertTriangle size={20} color="#eab308" />,
      label: t("accountMainCard.governanceHealth"),
      value: (
        <span className="text-sm text-yellow-500">
          {t("accountMainCard.governanceExpiring")}
        </span>
      ),
      tooltipContent: (
        <p>
          {t("accountMainCard.governanceTooltip")} {String(expirationTs)}
        </p>
      ),
    };
  }

  return {
    icon: <ShieldCheck size={20} color="#22c55e" />,
    label: t("accountMainCard.governanceHealth"),
    value: (
      <span className="text-sm text-green-500">
        {t("accountMainCard.governanceActive")}
      </span>
    ),
    tooltipContent: (
      <p>
        {t("accountMainCard.governanceTooltip")} {String(expirationTs)}
      </p>
    ),
  };
};

  const governanceHealthProps = getGovernanceHealthStatus();

  return (
    <Card data-testid="account-details">
      {!isForCommunity && (
        <>
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold" title={accountDetails.name}>
              {accountDetails.name}
            </h3>
            <Toggle
              checked={liveDataEnabled}
              onClick={changeLiveRefresh}
              className="text-base"
              leftLabel={t("headBlockCard.liveData")}
            />
          </CardHeader>

          <CardContent className="p-4 flex flex-col gap-5">
            {isBadActor && (
              <ErrorMessage
                message={t("accountMainCard.badActorMessage")}
                isWarning
                onClose={handleCloseWarning}
              />
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 align-text-top">
              <Image
                className="rounded-full border-4 border-explorer-orange/50 shadow-md"
                src={getHiveAvatarUrl(accountName)}
                alt="avatar"
                width={72}
                height={72}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {accountDetails.is_witness && (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("font-semibold", {
                          "line-through text-red-500": !isWitnessActive,
                        })}
                      >
                        {t("accountMainCard.witness")}
                      </span>
                      {isWitnessActive && witnessDetails?.rank && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1 cursor-default">
                                <Star
                                  data-testid="witness-rank-icon"
                                  fill="currentColor"
                                  size={14}
                                />{" "}
                                {witnessDetails.rank}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("accountMainCard.witnessRank")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {isWitnessActive && witnessDetails?.url && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={witnessDetails.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Link size={14} strokeWidth={2.5} />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("accountMainCard.witnessLink")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-default">
                          <ShieldCheck size={14} />
                          {accountDetails.reputation}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("accountMainCard.reputationTooltip")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            {about && (
              <div className="w-full p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {about}
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}

      <CardContent
        className={cn("p-4 flex flex-col gap-5", isForCommunity && "pt-6")}
      >
        {isForCommunity && (
          <div className="flex items-center gap-2 -mt-2 -mb-2">
            <h3 className="text-lg font-semibold" title={accountDetails.name}>
              {accountDetails.name}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info
                    size={14}
                    className="text-gray-400 dark:text-gray-500 cursor-help"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {t( "accountMainCard.creatorTooltip")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-3">
          <StatCard
            icon={<UserPlus size={20} />}
            label={t("accountMainCard.followers")}
            value={Number(accountDetails.follower_count).toLocaleString()}
            onClick={openFollowersModal}
          />
          <StatCard
            icon={<UserCheck size={20} />}
            label={t("accountMainCard.following")}
            value={Number(accountDetails.following_count).toLocaleString()}
            onClick={openFollowingModal}
          />
          <StatCard
            icon={<Building2 size={20} />}
            label={t("accountMainCard.subscriptions")}
            value={Number(accountDetails.subscriptions.length).toLocaleString()}
            onClick={openSubscriptionsModal}
          />
          <StatCard
            icon={<PenSquare size={20} />}
            label={t("accountMainCard.totalPosts")}
            value={Number(accountDetails.post_count).toLocaleString()}
            tooltipContent={<p>{t("accountMainCard.totalPostsTooltip")}</p>}
          />
          <StatCard
            icon={<Repeat size={20} />}
            label={t("accountMainCard.lastActive")}
            value={lastActiveValue}
            tooltipContent={<p>{t("accountMainCard.lastActiveTooltip")}</p>}
          />
          <StatCard
            icon={<CalendarDays size={20} />}
            label={t("accountMainCard.joined")}
            value={
              <TimeAgo
                className="text-sm"
                locale={locale}
                datetime={
                  new Date(formatAndDelocalizeTime(accountDetails.created))
                }
              />
            }
            tooltipContent={<p>{accountDetails.created}</p>}
          />
          <StatCard
            icon={<Vote size={20} />}
            label={t("accountMainCard.proposalVotes")}
            value={
              isVoteCountLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (proposalVoteCount ?? 0).toLocaleString()
              )
            }
            onClick={() => {
              if (proposalVoteCount && proposalVoteCount > 0) {
                router.push(`/proposals?q=${accountName}&status='all'`);
              }
            }}
          />
          {governanceHealthProps && (
            <StatCard
              icon={governanceHealthProps.icon}
              label={governanceHealthProps.label}
              value={governanceHealthProps.value}
              tooltipContent={governanceHealthProps.tooltipContent}
            />
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
          <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-4">
            {t("accountMainCard.resourcesHeader")}
          </h3>
          {!!manabarsData ? (
            <>
              {settings.progressBarType === "linear" ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium">
                      {t("accountMainCard.votingPower")}
                    </p>
                    <Progress
                      value={manabarsData.upvote.percentageValue}
                      color="#00c040"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {manabarsData.upvote.current} / {manabarsData.upvote.max}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium">
                      {t("accountMainCard.downvotePower")}
                    </p>
                    <Progress
                      value={manabarsData.downvote.percentageValue}
                      color="#c01000"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {manabarsData.downvote.current} /{" "}
                      {manabarsData.downvote.max}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="mb-2 text-sm font-medium">
                      {t("accountMainCard.resourceCredits")}
                    </p>
                    <Progress
                      value={manabarsData.rc.percentageValue}
                      color="#cecafa"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {manabarsData.rc.current} / {manabarsData.rc.max}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] justify-items-center gap-4">
                  <RadialProgress
                    size={70}
                    strokeWidth={6}
                    percentage={manabarsData.upvote.percentageValue}
                    label={t("accountMainCard.votingPower")}
                    color="text-green-500"
                    tooltipContent={
                      <p className="text-sm">
                    {manabarsData?.upvote.current} / {manabarsData?.upvote.max}
                      </p>
                    }
                  />
                  <RadialProgress
                    size={70}
                    strokeWidth={6}
                    percentage={manabarsData.downvote.percentageValue}
                    label={t("accountMainCard.downvotePower")}
                    color="text-red-500"
                    tooltipContent={
                      <p className="text-sm">
                    {manabarsData?.downvote.current} /{" "}
                    {manabarsData?.downvote.max}
                      </p>
                    }
                  />
                  <RadialProgress
                    size={70}
                    strokeWidth={6}
                    percentage={manabarsData.rc.percentageValue}
                    label={t("accountMainCard.resourceCredits")}
                    color="text-indigo-400"
                    tooltipContent={
                      <p className="text-sm">
                    {manabarsData?.rc.current} / {manabarsData?.rc.max}
                      </p>
                    }
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center h-24 w-full">
              <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>

        {accountDetails.is_witness && !isWitnessError && !isWitnessLoading && (
          <div className="w-full flex flex-col gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
            <Button className="w-full" onClick={openVotersModal}>
              <Vote className="mr-2 h-4 w-4" />
              {t("accountMainCard.voters")}
            </Button>
            <Button className="w-full" onClick={openVotesHistoryModal}>
              <History className="mr-2 h-4 w-4" />
              {t("accountMainCard.votesHistory")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountMainCard;