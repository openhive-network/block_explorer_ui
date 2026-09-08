import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CircleDollarSign,
  Hourglass,
  Loader2,
  PenLine,
  Star,
  User,
  Users,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/contexts/AuthContext";
import Hive from "@/types/Hive";
import usePendingRewardsSummary from "@/hooks/api/accountPage/usePendingRewardsSummary";
import { naiAssetToFloat, formatNaiAsset } from "@/utils/Calculations";
import Explorer from "@/types/Explorer";
import SegmentedToggle from "@/components/ui/SegmentedToggle";

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
  highlight?: "amber" | "green";
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
      <div className={`flex items-center gap-1.5 ${indented ? "ps-3" : ""}`}>
        {icon}
        <span className={labelClass}>{label}</span>
      </div>
      <span className={valueClass}>{value}</span>
    </div>
  );
};

const SectionSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <Loader2 className="animate-spin h-5 w-5" />
  </div>
);

const AccountPendingRewardsCard: React.FC<AccountPendingRewardsCardProps> = ({
  accountName,
  isInitiallyOpen,
  dynamicGlobalData,
}) => {
  const { t, locale } = useI18n();
  const { username, isInitializing } = useAuth();
  const [isHidden, setIsHidden] = useState(!isInitiallyOpen);

  // Re-sync when the wallet tab is expanded/collapsed, like the sibling cards.
  useEffect(() => {
    setIsHidden(!isInitiallyOpen);
  }, [isInitiallyOpen]);
  const [currency, setCurrency] = useState<Currency>("HBD");

  const {
    author,
    curation,
    isAuthorLoading,
    isAuthorError,
    isCurationLoading,
    isCurationError,
    grossHbd,
    authorTotalHbd,
    beneficiariesTotalHbd,
    curatorsTotalHbd,
    authorPct,
    beneficiariesPct,
    curatorsPct,
    avgPerPost,
    avgPerVote,
    yourTakeHbd,
    headlineHbd,
    isAllZero,
    authorLiquidHbd,
    authorHpHbd,
    curatorsLiquidHbd,
    curatorsHpHbd,
    curationLiquidHbd,
    curationHpHbd,
    yourTakeLiquidHbd,
    yourTakeHpHbd,
  } = usePendingRewardsSummary(accountName);

  const feedPriceHbdPerHive = useMemo(() => {
    const { rawFeedPrice, rawQuote } =
      dynamicGlobalData?.headBlockDetails ?? {};
    const quoteFloat = naiAssetToFloat(rawQuote);
    return rawFeedPrice && quoteFloat > 0
      ? naiAssetToFloat(rawFeedPrice) / quoteFloat
      : undefined;
  }, [dynamicGlobalData]);

  const toDisplay = (supply: Hive.Supply | undefined): string => {
    const hbdValue = naiAssetToFloat(supply);
    if (currency === "HIVE" && feedPriceHbdPerHive) {
      const hive = hbdValue / feedPriceHbdPerHive;
      return `${hive.toLocaleString(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HIVE`;
    }
    return formatNaiAsset(supply, locale);
  };

  const toDisplayRaw = (hbdValue: number): string => {
    if (currency === "HIVE" && feedPriceHbdPerHive) {
      const hive = hbdValue / feedPriceHbdPerHive;
      return `${hive.toLocaleString(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HIVE`;
    }
    return `${hbdValue.toLocaleString(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} HBD`;
  };

  // Amount only (no currency word) — the unit is already shown on the row above.
  const toAmount = (hbdValue: number): string => {
    const v =
      currency === "HIVE" && feedPriceHbdPerHive
        ? hbdValue / feedPriceHbdPerHive
        : hbdValue;
    return v.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  // Subtle sub-line showing how a reward pays out: liquid (spendable) vs HP,
  // in distinct tints. Currency word omitted — implied by the row's value above.
  const renderSplit = (liquidHbd: number, hpHbd: number): React.ReactNode => {
    if (liquidHbd <= 0 && hpHbd <= 0) return null;
    return (
      <div className="flex items-center gap-1.5 ps-6 pe-1.5 pb-0.5 text-[11px] font-mono">
        {liquidHbd > 0 && (
          <span className="text-emerald-600/80 dark:text-emerald-400/70">
            {toAmount(liquidHbd)} {t("pendingRewardsCard.liquid")}
          </span>
        )}
        {liquidHbd > 0 && hpHbd > 0 && (
          <span className="text-slate-300 dark:text-slate-600">·</span>
        )}
        {hpHbd > 0 && (
          <span className="text-violet-500/80 dark:text-violet-400/70">
            {toAmount(hpHbd)} {t("pendingRewardsCard.hp")}
          </span>
        )}
      </div>
    );
  };

  const bothLoaded = !isAuthorLoading && !isCurationLoading;
  // A combined total that silently drops a failed half understates it — show none.
  const bothLoadedOk = bothLoaded && !isAuthorError && !isCurationError;
  const showAllZero = bothLoadedOk && isAllZero;
  const showHeadline = bothLoadedOk && !isAllZero;
  // takeLabel can't be known until the session restores; rendering earlier
  // prints the wrong label and then swaps it.
  const showSummary = showHeadline && !isInitializing;

  const authorShareLabel = t("pendingRewardsCard.authorShare");
  const beneficiariesShareLabel = t("pendingRewardsCard.beneficiariesShare");
  const curatorsShareLabel = t("pendingRewardsCard.curatorsShare");

  // Card is shared with the MyPendingRewards widget — address the viewer only when it's their own account.
  const takeLabel =
    !!username && username.toLowerCase() === accountName.toLowerCase()
      ? t("pendingRewardsCard.yourTake")
      : t("pendingRewardsCard.accountTake");

  const splitSegments = [
    {
      pct: authorPct,
      value: authorTotalHbd,
      label: authorShareLabel,
      barClass: "bg-teal-400 dark:bg-teal-500",
      textClass: "text-teal-600 dark:text-teal-400",
    },
    {
      pct: beneficiariesPct,
      value: beneficiariesTotalHbd,
      label: beneficiariesShareLabel,
      barClass: "bg-blue-400 dark:bg-blue-500",
      textClass: "text-blue-500 dark:text-blue-400",
    },
    {
      pct: curatorsPct,
      value: curatorsTotalHbd,
      label: curatorsShareLabel,
      barClass: "bg-violet-400 dark:bg-violet-500",
      textClass: "text-violet-500 dark:text-violet-400",
    },
  ].filter((s) => s.pct > 0);

  // On a node without the hivemind pending-rewards routes both calls 404; hide
  // the card entirely rather than showing error boxes to every account visitor.
  if (isAuthorError && isCurationError) return null;

  return (
    <TooltipProvider>
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
              {showHeadline && (
                <span className="font-mono font-semibold text-sm text-slate-700 dark:text-slate-200">
                  {toDisplayRaw(headlineHbd)}
                </span>
              )}
              <span>{isHidden ? <ArrowDown /> : <ArrowUp />}</span>
            </div>
          </div>

          {feedPriceHbdPerHive && (
            <div className="flex justify-end px-4 pb-2">
              <SegmentedToggle<Currency>
                options={(["HBD", "HIVE"] as Currency[]).map((value) => ({
                  value,
                  label: value,
                }))}
                value={currency}
                onChange={setCurrency}
                ariaLabel={t("pendingRewardsCard.currencyToggle")}
                variant="pill"
              />
            </div>
          )}
        </CardHeader>

        <CardContent
          hidden={isHidden}
          data-testid="pending-rewards-content"
          className="px-4 pb-4 pt-0"
        >
          {showAllZero ? (
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-2">
              {t("pendingRewardsCard.noPendingRewards")}
            </p>
          ) : (
            <div className="space-y-3">
              {/* Author Rewards */}
              <div className="rounded-lg border border-teal-200 dark:border-teal-800 border-s-4 border-s-teal-400 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-between items-center px-3 py-2 border-b border-teal-100 dark:border-teal-900/50">
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
                    {author && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                        {author.pending_post_count.toLocaleString(locale)}{" "}
                        {t("pendingRewardsCard.posts")}
                      </span>
                    )}
                  </div>
                </div>

                {isAuthorLoading ? (
                  <SectionSpinner />
                ) : isAuthorError ? (
                  <p className="text-sm text-red-500 text-center py-2">
                    {t("common.errorLoadingData")}
                  </p>
                ) : (
                  author && (
                    <>
                      {/* Proportion bar */}
                      {grossHbd > 0 && splitSegments.length > 0 && (
                        <div className="px-3 pt-2 pb-1">
                          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                            {t("pendingRewardsCard.payoutSplit")}
                          </p>
                          <div className="flex h-2 rounded-full overflow-hidden gap-px">
                            {splitSegments.map((s) => (
                              <Tooltip key={s.label}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`${s.barClass} cursor-help`}
                                    style={{ width: `${s.pct}%` }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  {s.label}{" "}
                                  {s.pct.toLocaleString(locale, {
                                    maximumFractionDigits: 0,
                                  })}
                                  % · {toDisplayRaw(s.value)}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {splitSegments.map((s) => (
                              <span
                                key={s.label}
                                className={`text-xs ${s.textClass}`}
                              >
                                {s.label}{" "}
                                {s.pct.toLocaleString(locale, {
                                  maximumFractionDigits: 0,
                                })}
                                %
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="px-1 py-1.5 space-y-0.5">
                        <RewardRow
                          icon={
                            <CircleDollarSign className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          }
                          label={t("pendingRewardsCard.grossPending")}
                          value={toDisplay(author.gross_reward_basis)}
                          highlight="amber"
                        />
                        {authorTotalHbd > 0 && (
                          <>
                            <RewardRow
                              icon={
                                <User className="h-3 w-3 text-teal-500 flex-shrink-0" />
                              }
                              label={authorShareLabel}
                              value={toDisplay(
                                author.author_reward_basis.total
                              )}
                              indented
                            />
                            {renderSplit(authorLiquidHbd, authorHpHbd)}
                          </>
                        )}
                        {beneficiariesTotalHbd > 0 && (
                          <RewardRow
                            icon={
                              <Users className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            }
                            label={beneficiariesShareLabel}
                            value={toDisplay(
                              author.beneficiaries_reward_basis.total
                            )}
                            indented
                          />
                        )}
                        {curatorsTotalHbd > 0 && (
                          <>
                            <RewardRow
                              icon={
                                <Award className="h-3 w-3 text-violet-400 flex-shrink-0" />
                              }
                              label={curatorsShareLabel}
                              value={toDisplay(
                                author.curators_reward_basis.total
                              )}
                              indented
                            />
                            {renderSplit(curatorsLiquidHbd, curatorsHpHbd)}
                          </>
                        )}
                      </div>
                    </>
                  )
                )}
              </div>

              {/* Curation Rewards */}
              <div className="rounded-lg border border-violet-200 dark:border-violet-800 border-s-4 border-s-violet-400 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-between items-center px-3 py-2 border-b border-violet-100 dark:border-violet-900/50">
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
                    {curation && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
                        {curation.pending_vote_count.toLocaleString(locale)}{" "}
                        {t("pendingRewardsCard.votes")}
                      </span>
                    )}
                  </div>
                </div>

                {isCurationLoading ? (
                  <SectionSpinner />
                ) : isCurationError ? (
                  <p className="text-sm text-red-500 text-center py-2">
                    {t("common.errorLoadingData")}
                  </p>
                ) : (
                  curation && (
                    <div className="px-1 py-1.5">
                      <RewardRow
                        icon={
                          <CircleDollarSign className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                        }
                        label={t("pendingRewardsCard.estimatedPayout")}
                        value={toDisplay(curation.curation_reward_basis.total)}
                      />
                      {renderSplit(curationLiquidHbd, curationHpHbd)}
                    </div>
                  )
                )}
              </div>

              {/* Summary: take (needs both responses) */}
              {showSummary && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                  <RewardRow
                    icon={
                      <Wallet className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    }
                    label={takeLabel}
                    value={toDisplayRaw(yourTakeHbd)}
                    highlight="green"
                  />
                  {renderSplit(yourTakeLiquidHbd, yourTakeHpHbd)}
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-2">
                {currency === "HIVE" && feedPriceHbdPerHive
                  ? t("pendingRewardsCard.hiveDisclaimer")
                  : t("pendingRewardsCard.disclaimer")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default AccountPendingRewardsCard;
