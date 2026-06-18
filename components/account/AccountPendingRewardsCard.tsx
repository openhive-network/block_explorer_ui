import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CircleDollarSign,
  Clock,
  Hourglass,
  Loader2,
  PenLine,
  Star,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import usePendingAuthorRewards from "@/hooks/api/accountPage/usePendingAuthorRewards";
import usePendingCurationRewards from "@/hooks/api/accountPage/usePendingCurationRewards";
import useAccountNextPayout from "@/hooks/api/accountPage/useAccountNextPayout";
import { naiAssetToFloat, formatNaiAsset } from "@/utils/Calculations";
import Explorer from "@/types/Explorer";
import { cn } from "@/lib/utils";

type AccountPendingRewardsCardProps = {
  accountName: string;
  isInitiallyOpen: boolean;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
};

type Currency = "HBD" | "HIVE";

type RewardRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  indented?: boolean;
  highlight?: "amber" | "teal" | "violet" | "green";
};

const RewardRow: React.FC<RewardRowProps> = ({
  icon,
  label,
  value,
  indented,
  highlight,
}) => {
  const bgClass =
    highlight === "amber"
      ? "bg-amber-50 dark:bg-amber-900/20 rounded-md"
      : highlight === "green"
        ? "bg-emerald-50 dark:bg-emerald-900/20 rounded-md"
        : "";
  const labelClass = indented
    ? "text-sm text-slate-500 dark:text-slate-400"
    : highlight === "amber"
      ? "text-sm font-medium text-amber-700 dark:text-amber-300"
      : highlight === "green"
        ? "text-sm font-semibold text-emerald-700 dark:text-emerald-300"
        : "text-sm text-slate-600 dark:text-slate-400";
  const valueClass = indented
    ? "font-mono text-sm text-slate-600 dark:text-slate-400"
    : highlight === "amber"
      ? "font-mono text-sm font-semibold text-amber-700 dark:text-amber-300"
      : highlight === "green"
        ? "font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300"
        : "font-mono text-sm text-slate-800 dark:text-slate-200";

  return (
    <div
      className={`flex justify-between items-center px-1.5 py-1 gap-2 ${bgClass}`}
    >
      <div className={`flex items-center gap-1.5 ${indented ? "pl-3" : ""}`}>
        {icon}
        <span className={labelClass}>{label}</span>
      </div>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

const formatCountdown = (date: Date): string => {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "soon";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
};

const AccountPendingRewardsCard: React.FC<AccountPendingRewardsCardProps> = ({
  accountName,
  isInitiallyOpen,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const [isHidden, setIsHidden] = useState(!isInitiallyOpen);
  const [currency, setCurrency] = useState<Currency>("HBD");

  const {
    pendingAuthorRewards,
    isPendingAuthorRewardsLoading,
    isPendingAuthorRewardsError,
  } = usePendingAuthorRewards(accountName);
  const {
    pendingCurationRewards,
    isPendingCurationRewardsLoading,
    isPendingCurationRewardsError,
  } = usePendingCurationRewards(accountName);
  const { nextPayoutDate } = useAccountNextPayout(accountName);

  const feedPriceHbdPerHive = (() => {
    const { rawFeedPrice, rawQuote } =
      dynamicGlobalData?.headBlockDetails ?? {};
    const quoteFloat = naiAssetToFloat(rawQuote);
    return rawFeedPrice && quoteFloat > 0
      ? naiAssetToFloat(rawFeedPrice) / quoteFloat
      : undefined;
  })();

  const toDisplay = (supply: Hive.Supply | undefined): string => {
    const hbdValue = naiAssetToFloat(supply);
    if (currency === "HIVE" && feedPriceHbdPerHive) {
      const hive = hbdValue / feedPriceHbdPerHive;
      return `${hive.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HIVE`;
    }
    return formatNaiAsset(supply);
  };

  const toDisplayRaw = (hbdValue: number): string => {
    if (currency === "HIVE" && feedPriceHbdPerHive) {
      const hive = hbdValue / feedPriceHbdPerHive;
      return `${hive.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HIVE`;
    }
    return `${hbdValue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HBD`;
  };

  const isLoading =
    isPendingAuthorRewardsLoading || isPendingCurationRewardsLoading;

  const combinedGrossDisplay = (() => {
    if (!pendingAuthorRewards || !pendingCurationRewards) return null;
    const totalHbd =
      naiAssetToFloat(pendingAuthorRewards.gross_pending_payout) +
      naiAssetToFloat(pendingCurationRewards.estimated_curation_payout);
    return toDisplayRaw(totalHbd);
  })();

  const isAllZero =
    pendingAuthorRewards &&
    pendingCurationRewards &&
    naiAssetToFloat(pendingAuthorRewards.gross_pending_payout) === 0 &&
    naiAssetToFloat(pendingCurationRewards.estimated_curation_payout) === 0;

  // Proportion bar segments (author section only)
  const gross = naiAssetToFloat(pendingAuthorRewards?.gross_pending_payout);
  const authorPct =
    gross > 0
      ? (naiAssetToFloat(pendingAuthorRewards?.estimated_author_payout) /
          gross) *
        100
      : 0;
  const beneficiariesPct =
    gross > 0
      ? (naiAssetToFloat(pendingAuthorRewards?.estimated_beneficiaries_payout) /
          gross) *
        100
      : 0;
  const curatorsPct = Math.max(0, 100 - authorPct - beneficiariesPct);

  // Efficiency metrics
  const avgPerPost =
    pendingAuthorRewards && pendingAuthorRewards.pending_post_count > 0
      ? naiAssetToFloat(pendingAuthorRewards.estimated_author_payout) /
        pendingAuthorRewards.pending_post_count
      : null;
  const avgPerVote =
    pendingCurationRewards && pendingCurationRewards.pending_vote_count > 0
      ? naiAssetToFloat(pendingCurationRewards.estimated_curation_payout) /
        pendingCurationRewards.pending_vote_count
      : null;

  // Your take
  const yourTakeHbd =
    naiAssetToFloat(pendingAuthorRewards?.estimated_author_payout) +
    naiAssetToFloat(pendingCurationRewards?.estimated_curation_payout);

  return (
    <Card data-testid="pending-rewards-card" className="overflow-hidden pb-0">
      <CardHeader className="p-0 mb-2">
        <div
          onClick={() => setIsHidden(!isHidden)}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="flex items-center gap-2">
            <Hourglass className="h-4 w-4 text-amber-500" />
            <span className="text-lg">{t("pendingRewardsCard.title")}</span>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && combinedGrossDisplay && (
              <span className="font-mono font-semibold text-sm text-slate-700 dark:text-slate-200">
                {combinedGrossDisplay}
              </span>
            )}
            <span>{isHidden ? <ArrowDown /> : <ArrowUp />}</span>
          </div>
        </div>

        {feedPriceHbdPerHive && (
          <div className="flex justify-end px-4 pb-2">
            <div className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden">
              {(["HBD", "HIVE"] as Currency[]).map((cur, idx) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium transition-colors",
                    idx === 0
                      ? "rounded-l-full border-r border-navbar-border"
                      : "rounded-r-full",
                    currency === cur
                      ? "bg-blue-500 text-white"
                      : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent
        hidden={isHidden}
        data-testid="pending-rewards-content"
        className="px-4 pb-4 pt-0"
      >
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        )}

        {!isLoading && isAllZero && (
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-2">
            {t("pendingRewardsCard.noPendingRewards")}
          </p>
        )}

        {!isLoading && !isAllZero && (
          <div className="space-y-3">
            {/* Author Rewards */}
            <div className="rounded-lg border border-teal-200 dark:border-teal-800 border-l-4 border-l-teal-400 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b border-teal-100 dark:border-teal-900/50">
                <div className="flex items-center gap-1.5">
                  <PenLine className="h-3.5 w-3.5 text-teal-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                    {t("pendingRewardsCard.authorRewards")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {avgPerPost !== null && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {t("pendingRewardsCard.avgPerPost")}:{" "}
                      {toDisplayRaw(avgPerPost)}
                    </span>
                  )}
                  {pendingAuthorRewards && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                      {pendingAuthorRewards.pending_post_count}{" "}
                      {t("pendingRewardsCard.posts")}
                    </span>
                  )}
                </div>
              </div>

              {/* Proportion bar */}
              {gross > 0 && (
                <div className="px-3 pt-2 pb-1">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    {t("pendingRewardsCard.payoutSplit")}
                  </p>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px">
                    {authorPct > 0 && (
                      <div
                        className="bg-teal-400 dark:bg-teal-500"
                        style={{ width: `${authorPct}%` }}
                        title={`Author ${authorPct.toFixed(0)}%`}
                      />
                    )}
                    {beneficiariesPct > 0 && (
                      <div
                        className="bg-blue-400 dark:bg-blue-500"
                        style={{ width: `${beneficiariesPct}%` }}
                        title={`Beneficiaries ${beneficiariesPct.toFixed(0)}%`}
                      />
                    )}
                    {curatorsPct > 0 && (
                      <div
                        className="bg-violet-400 dark:bg-violet-500"
                        style={{ width: `${curatorsPct}%` }}
                        title={`Curators ${curatorsPct.toFixed(0)}%`}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    {authorPct > 0 && (
                      <span className="text-xs text-teal-600 dark:text-teal-400">
                        Author {authorPct.toFixed(0)}%
                      </span>
                    )}
                    {beneficiariesPct > 0 && (
                      <span className="text-xs text-blue-500 dark:text-blue-400">
                        Beneficiaries {beneficiariesPct.toFixed(0)}%
                      </span>
                    )}
                    {curatorsPct > 0 && (
                      <span className="text-xs text-violet-500 dark:text-violet-400">
                        Curators {curatorsPct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isPendingAuthorRewardsError ? (
                <p className="text-sm text-red-500 text-center py-2">
                  {t("common.errorLoadingData")}
                </p>
              ) : (
                pendingAuthorRewards && (
                  <div className="px-1 py-1.5 space-y-0.5">
                    <RewardRow
                      icon={
                        <CircleDollarSign className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      }
                      label={t("pendingRewardsCard.grossPending")}
                      value={toDisplay(
                        pendingAuthorRewards.gross_pending_payout
                      )}
                      highlight="amber"
                    />
                    <RewardRow
                      icon={
                        <User className="h-3 w-3 text-teal-500 flex-shrink-0" />
                      }
                      label={t("pendingRewardsCard.authorShare")}
                      value={toDisplay(
                        pendingAuthorRewards.estimated_author_payout
                      )}
                      indented
                    />
                    <RewardRow
                      icon={
                        <Users className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      }
                      label={t("pendingRewardsCard.beneficiariesShare")}
                      value={toDisplay(
                        pendingAuthorRewards.estimated_beneficiaries_payout
                      )}
                      indented
                    />
                    <RewardRow
                      icon={
                        <Award className="h-3 w-3 text-violet-400 flex-shrink-0" />
                      }
                      label={t("pendingRewardsCard.curatorsShare")}
                      value={toDisplay(
                        pendingAuthorRewards.estimated_curators_payout
                      )}
                      indented
                    />
                  </div>
                )
              )}
            </div>

            {/* Curation Rewards */}
            <div className="rounded-lg border border-violet-200 dark:border-violet-800 border-l-4 border-l-violet-400 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b border-violet-100 dark:border-violet-900/50">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-violet-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                    {t("pendingRewardsCard.curationRewards")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {avgPerVote !== null && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {t("pendingRewardsCard.avgPerVote")}:{" "}
                      {toDisplayRaw(avgPerVote)}
                    </span>
                  )}
                  {pendingCurationRewards && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                      {pendingCurationRewards.pending_vote_count.toLocaleString()}{" "}
                      {t("pendingRewardsCard.votes")}
                    </span>
                  )}
                </div>
              </div>

              {isPendingCurationRewardsError ? (
                <p className="text-sm text-red-500 text-center py-2">
                  {t("common.errorLoadingData")}
                </p>
              ) : (
                pendingCurationRewards && (
                  <div className="px-1 py-1.5">
                    <RewardRow
                      icon={
                        <CircleDollarSign className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                      }
                      label={t("pendingRewardsCard.estimatedPayout")}
                      value={toDisplay(
                        pendingCurationRewards.estimated_curation_payout
                      )}
                    />
                  </div>
                )
              )}
            </div>

            {/* Summary: Your Take + Next Payout */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
              <RewardRow
                icon={
                  <Wallet className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                }
                label={t("pendingRewardsCard.yourTake")}
                value={toDisplayRaw(yourTakeHbd)}
                highlight="green"
              />
              {nextPayoutDate && (
                <div className="flex justify-between items-center px-1.5 py-1 gap-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {t("pendingRewardsCard.nextPayout")}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-200">
                    {formatCountdown(nextPayoutDate)}
                  </span>
                </div>
              )}
              {avgPerPost !== null && avgPerVote !== null && (
                <div className="flex justify-around items-center px-2 py-1.5 border-t border-slate-200 dark:border-slate-700 gap-2">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-teal-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t("pendingRewardsCard.avgPerPost")}:
                    </span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {toDisplayRaw(avgPerPost)}
                    </span>
                  </div>
                  <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t("pendingRewardsCard.avgPerVote")}:
                    </span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {toDisplayRaw(avgPerVote)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-2">
              {currency === "HIVE" && feedPriceHbdPerHive
                ? t("pendingRewardsCard.hiveDisclaimer")
                : t("pendingRewardsCard.disclaimer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountPendingRewardsCard;
