import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowUp, ChevronUp, ChevronsUpDown, Database, DollarSign, FileDown, HandCoins, HelpCircle, Loader2, TrendingDown, User, Users, Wallet, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { AccountBalanceCardChart } from "./AccountBalanceCardChart";
import { prepareAccountBalanceReport } from "./AccountBalanceCardExport";
import DataExport from "../../DataExport";
import VestsTooltip from "../../VestsTooltip";

import Explorer from "@/types/Explorer";
import useBlockChainProperties from "@/hooks/api/common/useBlockChainProperties";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber } from "@/lib/utils";
import { changeHBDToDollarsDisplay, grabNumericValue } from "@/utils/StringUtils";

// ====================================================================
// SECTION: Static Configurations
// ====================================================================

/** Maps internal API keys to human-readable i18n translation keys. */
export const cardNameMapKeys = new Map<
  keyof Explorer.FormattedAccountDetails,
  string
>([
  ["hbd_balance", "accountBalanceCard.liquid"],
  ["hbd_saving_balance", "accountBalanceCard.savings"],
  ["reward_hbd_balance", "accountBalanceCard.unclaimed"],
  ["balance", "accountBalanceCard.liquid"],
  ["savings_balance", "accountBalanceCard.savings"],
  ["reward_hive_balance", "accountBalanceCard.unclaimed"],
  ["vesting_shares", "accountBalanceCard.owned"],
  ["reward_vesting_balance", "accountBalanceCard.unclaimed"],
  ["received_vesting_shares", "accountBalanceCard.received"],
  ["delegated_vesting_shares", "accountBalanceCard.delegated"],
  ["vesting_withdraw_rate", "accountBalanceCard.powerDown"],
]);

/** Defines the structure for each asset section (HP, HIVE, HBD) in the wallet. */
export const ASSET_CONFIG = [
  {
    key: "hp",
    name: "accountBalanceCard.hpName",
    description: "accountBalanceCard.hpDescription",
    icon: <Zap className="h-4 w-4" />,
    fields: [
      "vesting_shares",
      "delegated_vesting_shares",
      "received_vesting_shares",
      "reward_vesting_balance",
      "vesting_withdraw_rate",
    ] as const,
  },
  {
    key: "hive",
    name: "HIVE",
    description: "accountBalanceCard.hiveDescription",
    icon: <Image src="/hive-logo.png" alt="Hive logo" width={15} height={15} />,
    fields: ["balance", "savings_balance", "reward_hive_balance"] as const,
  },
  {
    key: "hbd",
    name: "HBD",
    description: "accountBalanceCard.hbdDescription",
    icon: <DollarSign className="h-4 w-4" />,
    fields: [
      "hbd_balance",
      "hbd_saving_balance",
      "reward_hbd_balance",
    ] as const,
  },
];

// ====================================================================
// SECTION: Data Processing Hook
// ====================================================================

/**
 * Calculate and format all financial data for the account
 */
const useFinancialSummary = (userDetails: Explorer.FormattedAccountDetails) => {
  return useMemo(() => {
    const { dollars } = userDetails;

    // --- 1. Raw Numeric Values ---
    const totalValueRaw = grabNumericValue(dollars.account_value);
    const stakedValueRaw = grabNumericValue(dollars.vesting_shares);
    const poweringDownValueRaw = grabNumericValue(dollars.vesting_withdraw_rate);
    const liquidValueRaw = grabNumericValue(dollars.balance) + grabNumericValue(dollars.hbd_balance);
    const savingsValueRaw = grabNumericValue(dollars.savings_balance) + grabNumericValue(dollars.hbd_saving_balance);
    const unclaimedValueRaw = grabNumericValue(dollars.reward_hive_balance) + grabNumericValue(dollars.reward_hbd_balance) + grabNumericValue(dollars.reward_vesting_balance);
    const totalHpRaw = grabNumericValue(userDetails.vesting_shares) + grabNumericValue(userDetails.received_vesting_shares) - grabNumericValue(userDetails.delegated_vesting_shares) - grabNumericValue(userDetails.vesting_withdraw_rate);
    const effectiveHpRaw = grabNumericValue(userDetails.vesting_shares) + grabNumericValue(userDetails.received_vesting_shares) - grabNumericValue(userDetails.delegated_vesting_shares);
    const totalHiveRaw = grabNumericValue(userDetails.balance) + grabNumericValue(String(userDetails.savings_balance)) + grabNumericValue(userDetails.reward_hive_balance);
    const totalHbdRaw = grabNumericValue(userDetails.hbd_balance) + grabNumericValue(userDetails.hbd_saving_balance) + grabNumericValue(userDetails.reward_hbd_balance);
    const totalHiveUsdRaw = grabNumericValue(dollars.balance) + grabNumericValue(dollars.savings_balance) + grabNumericValue(dollars.reward_hive_balance);
    const totalHbdUsdRaw = grabNumericValue(dollars.hbd_balance) + grabNumericValue(dollars.hbd_saving_balance) + grabNumericValue(dollars.reward_hbd_balance);

    // --- 2. Pre-formatted Strings ---
    const formattedDollars = Object.entries(userDetails.dollars).reduce((acc, [key, value]) => {
      acc[key as keyof typeof userDetails.dollars] = changeHBDToDollarsDisplay(value);
      return acc;
    }, {} as Record<keyof typeof userDetails.dollars, string>);

    return {
      raw: {
        totalValue: totalValueRaw,
        liquidValue: liquidValueRaw,
        stakedValue: stakedValueRaw,
        savingsValue: savingsValueRaw,
        unclaimedValue: unclaimedValueRaw,
        poweringDownValue: poweringDownValueRaw,
      },
      formatted: {
        totalValue: formattedDollars.account_value,
        totalHp: `${formatNumber(totalHpRaw, false, true)} HP`,
        totalHive: `${totalHiveRaw.toLocaleString(undefined, { maximumFractionDigits: 3 })} HIVE`,
        totalHbd: `${totalHbdRaw.toLocaleString(undefined, { maximumFractionDigits: 3 })} HBD`,
        effectiveHp: `${effectiveHpRaw.toLocaleString(undefined, { maximumFractionDigits: 3 })} HP`,
        totalHiveUsd: changeHBDToDollarsDisplay(totalHiveUsdRaw.toString()),
        totalHbdUsd: changeHBDToDollarsDisplay(totalHbdUsdRaw.toString()),
        dollars: formattedDollars,
        vests: userDetails.vests,
      },
    };
  }, [userDetails]);
};

// ====================================================================
// SECTION: UI Highlighting Configurations
// ====================================================================

/** Maps a segment key (e.g., "staked") to the API fields it affects. */
const fieldHighlightConfig = new Map<
  string,
  (keyof Explorer.FormattedAccountDetails)[]
>([
  ["staked", ["vesting_shares"]],
  ["savings", ["savings_balance", "hbd_saving_balance"]],
  ["liquid", ["balance", "hbd_balance"]],
  [
    "unclaimed",
    ["reward_hive_balance", "reward_hbd_balance", "reward_vesting_balance"],
  ],
  ["poweringDown", ["vesting_withdraw_rate"]],
]);

/** Maps a segment key to the specific Tailwind CSS classes for highlighting. */
const highlightConfig = {
  staked:
    "bg-purple-100 border-l-2 border-purple-400 dark:bg-purple-500/15 dark:border-purple-500",
  savings:
    "bg-amber-100  border-l-2 border-amber-400  dark:bg-amber-400/15  dark:border-amber-400",
  liquid:
    "bg-sky-100    border-l-2 border-sky-400    dark:bg-sky-500/15    dark:border-sky-500",
  unclaimed:
    "bg-teal-100   border-l-2 border-teal-400   dark:bg-teal-400/15   dark:border-teal-400",
  poweringDown:
    "bg-rose-100 border-l-2 border-rose-400 dark:bg-rose-400/15 dark:border-rose-400",
};

// ====================================================================
// SECTION: Reusable Sub-Components
// ====================================================================

/** Renders the APR tooltip with a help icon and content. */
const HbdAprTooltip = ({ hbdInterestApr, isLoading, t }: any) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="flex items-center space-x-1 text-xs px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold cursor-help">
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span>{hbdInterestApr} APR</span>
        )}
        <HelpCircle className="h-3 w-3" />
      </span>
    </TooltipTrigger>
    <TooltipContent>
      <p>{t("accountBalanceCard.hbdAprTooltip")}</p>
    </TooltipContent>
  </Tooltip>
);

/** Renders a single label-value row within an asset section. */
const DetailRow = ({
  fieldKey,
  label,
  value,
  dollarValue,
  icon,
  labelSuffix,
  className = "",
  valueClassName = "",
  labelClassName = "text-slate-600 dark:text-slate-400",
  isHighlighted,
}: any) => (
  <div
    key={fieldKey}
    className={cn(
      "flex flex-wrap justify-between items-baseline px-1 rounded-md transition-colors gap-x-2",
      className
    )}
  >
    <div className="flex items-center gap-1.5">
      {icon}
      <span
        className={cn(
          "text-sm",
          { "dark:text-slate-100": isHighlighted },
          labelClassName
        )}
      >
        {label}
      </span>
      {labelSuffix}
    </div>
    <div className="flex-grow text-right">
      <div
        className={cn(
          "font-mono text-sm text-slate-800 dark:text-slate-200",
          { "dark:text-slate-100": isHighlighted },
          valueClassName
        )}
      >
        {value}
      </div>
      <div className="text-xs text-slate-500">{dollarValue}</div>
    </div>
  </div>
);

/**
 * Represents a full collapsible section for a single asset (HP, HIVE, or HBD).
 * It includes the header with total value and the detailed breakdown of its components.
 */
const AssetSection = ({
  asset,
  isOpen,
  onToggle,
  userDetails,
  getHighlightClass,
  financialSummary,
  hbdApr,
  t,
  activeSegmentKey,
}: any) => {
  const { blockChainPropertiesDataLoading: isLoadingApr } =
    useBlockChainProperties();

  const renderValue = (
    key: keyof Explorer.FormattedAccountDetails,
    sign: "" | "+" | "-" = ""
  ) => {
    if (key in userDetails.vests) {
      const vestKey = key as keyof Explorer.AccountDetailsVests;
      return (
        <VestsTooltip
          tooltipTrigger={`${sign}${String(userDetails[key])}`}
          tooltipContent={String(userDetails.vests[vestKey])}
        />
      );
    }
    return `${sign}${userDetails[key]}`;
  };

  const hpDetails = [
    {
      key: "vesting_shares",
      icon: User,
      sign: "",
      colorClass: "text-slate-600 dark:text-slate-400",
      valueColor: "text-slate-800 dark:text-slate-200",
    },
    {
      key: "received_vesting_shares",
      icon: HandCoins,
      sign: "+",
      colorClass: "text-green-600 dark:text-green-400",
      valueColor: undefined,
    },
    {
      key: "delegated_vesting_shares",
      icon: Users,
      sign: "-",
      colorClass: "text-red-500 dark:text-red-400",
      valueColor: undefined,
    },
  ] as const;

  const regularFields = asset.fields.filter(
    (f: string) => !f.startsWith("reward_") && !f.startsWith("vesting_")
  );
  const specialFields = asset.fields.filter(
    (f: string) => f.startsWith("reward_") || f.startsWith("vesting_withdraw")
  );

  const assetTotalValue =
    asset.key === "hp"
      ? financialSummary.formatted.totalHp
      : asset.key === "hive"
      ? financialSummary.formatted.totalHive
      : financialSummary.formatted.totalHbd;

  const isClaimable = (field: keyof Explorer.FormattedAccountDetails) => {
    return (
      field.startsWith("reward_") && grabNumericValue(userDetails[field]) > 0
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div
        onClick={onToggle}
        className="flex flex-wrap justify-between items-center p-2 cursor-pointer gap-x-4 gap-y-1"
      >
        <div className="flex items-center space-x-2">
          {asset.icon}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-semibold text-sm flex items-center gap-1.5">
                {t(asset.name)}{" "}
                <HelpCircle className="h-3 w-3" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[260px]">{t(asset.description)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="font-semibold text-sm">
            {assetTotalValue}
          </span>
          <ChevronUp
            className={cn(
              "h-5 w-5 flex-shrink-0",
              { "transform rotate-180": !isOpen }
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700/50 px-2 py-1.5 space-y-0.5">
          {asset.key === "hp"
            ? hpDetails.map((detail) => (
                <DetailRow
                  key={detail.key}
                  fieldKey={detail.key}
                  className={getHighlightClass(detail.key)}
                  isHighlighted={!!getHighlightClass(detail.key)}
                  icon={
                    <detail.icon className={cn("h-4 w-4", detail.colorClass)} />
                  }
                  label={t(cardNameMapKeys.get(detail.key)!)}
                  labelClassName={detail.colorClass}
                  valueClassName={detail.valueColor || detail.colorClass}
                  value={renderValue(detail.key, detail.sign)}
                  dollarValue={financialSummary.formatted.dollars[detail.key]}
                />
              ))
            : regularFields.map(
                (field: keyof Explorer.FormattedAccountDetails) => (
                  <DetailRow
                    key={field}
                    fieldKey={field}
                    className={getHighlightClass(field)}
                    isHighlighted={!!getHighlightClass(field)}
                    label={t(cardNameMapKeys.get(field)!)}
                    value={renderValue(field)}
                    dollarValue={financialSummary.formatted.dollars[field]}
                    labelSuffix={
                      field === "hbd_saving_balance" && hbdApr ? (
                        <HbdAprTooltip
                          hbdInterestApr={hbdApr}
                          isLoading={isLoadingApr}
                          t={t}
                        />
                      ) : null
                    }
                  />
                )
              )}

          {specialFields.length > 0 && (
            <div className="border-t border-slate-200/80 dark:border-slate-700/80 mt-1.5 pt-1.5 space-y-0.5">
              {specialFields.map(
                (field: keyof Explorer.FormattedAccountDetails) => {
                  const hasClaimableAmount = isClaimable(field);
                  const isPoweringDown =
                    field === "vesting_withdraw_rate" &&
                    grabNumericValue(userDetails[field]) > 0;

                  let icon = null;
                  if (isPoweringDown) {
                    icon = <TrendingDown className="h-4 w-4" color="#f43f5e" />; // Use rose color
                  } else if (hasClaimableAmount) {
                    icon = <Database className="h-4 w-4" color="#06b6d4" />;
                  }

                  const isDefaultHighlighted =
                    hasClaimableAmount &&
                    !getHighlightClass(field) &&
                    !activeSegmentKey;

                  return (
                    <DetailRow
                      key={field}
                      fieldKey={field}
                      className={cn(getHighlightClass(field), {
                        "bg-gradient-to-r from-cyan-100 to-transparent dark:from-teal-900/50 dark:to-transparent":
                          isDefaultHighlighted,
                      })}
                      isHighlighted={
                        !!getHighlightClass(field) || isDefaultHighlighted
                      }
                      label={t(cardNameMapKeys.get(field)!)}
                      labelClassName={
                        hasClaimableAmount
                          ? "text-cyan-800 dark:text-teal-300 font-semibold"
                          : "text-slate-600 dark:text-slate-400"
                      }
                      icon={icon}
                      value={renderValue(field)}
                      dollarValue={financialSummary.formatted.dollars[field]}
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ====================================================================
// SECTION: Main Component
// ====================================================================

type AccountBalanceCardProps = {
  userDetails: Explorer.FormattedAccountDetails;
};

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  userDetails,
}) => {
  const { t } = useI18n();
  const [isCardHidden, setIsCardHidden] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hive: false,
    hbd: false,
    hp: false,
  });
  const [activeSegmentKey, setActiveSegmentKey] = useState<string | null>(null);

  const { blockChainPropertiesData } = useBlockChainProperties();
  const financialSummary = useFinancialSummary(userDetails);
  
  const hbdInterestApr = useMemo(() => {
    return blockChainPropertiesData?.hbd_interest_rate
      ? `${(blockChainPropertiesData.hbd_interest_rate / 100).toFixed(2)}%`
      : null;
  }, [blockChainPropertiesData]);
  
  const areAllOpen = useMemo(() => ASSET_CONFIG.every((asset) => !!openSections[asset.key]), [openSections]);
  
  const chartSegments = useMemo(() => {
    const total = financialSummary.raw.totalValue || 1; 
    const formatDisplayValue = (value: number) => `${value.toLocaleString()} $`;

    const liquidPct = (financialSummary.raw.liquidValue / total) * 100;
    const savingsPct = (financialSummary.raw.savingsValue / total) * 100;
    const unclaimedPct = (financialSummary.raw.unclaimedValue / total) * 100;
    const poweringDownPct = (financialSummary.raw.poweringDownValue / total) * 100;
    const sumOfOthers = liquidPct + savingsPct + unclaimedPct + poweringDownPct;
    const stakedPct = Math.max(0, 100 - sumOfOthers);

    const segments = [
      {
        key: "staked",
        label: t("accountBalanceCard.staked"),
        value: financialSummary.raw.stakedValue,
        displayValue: formatDisplayValue(financialSummary.raw.stakedValue),
        percent: stakedPct,
        color: "#8b5cf6",
        iconColorClass: "text-purple-500",
      },
      {
        key: "savings",
        label: t("accountBalanceCard.savings"),
        value: financialSummary.raw.savingsValue,
        displayValue: formatDisplayValue(financialSummary.raw.savingsValue),
        percent: savingsPct,
        color: "#f59e0b",
        iconColorClass: "text-amber-500",
      },
      {
        key: "liquid",
        label: t("accountBalanceCard.liquid"),
        value: financialSummary.raw.liquidValue,
        displayValue: formatDisplayValue(financialSummary.raw.liquidValue),
        percent: liquidPct,
        color: "#0ea5e9",
        iconColorClass: "text-sky-500",
      },
      {
        key: "unclaimed",
        label: t("accountBalanceCard.unclaimed"),
        value: financialSummary.raw.unclaimedValue,
        displayValue: formatDisplayValue(financialSummary.raw.unclaimedValue),
        percent: unclaimedPct,
        color: "#14b8a6",
        iconColorClass: "text-teal-500",
      },
    ];

    if (financialSummary.raw.poweringDownValue > 0) {
      segments.push({
        key: "poweringDown",
        label: t("accountBalanceCard.powerDown"),
        value: financialSummary.raw.poweringDownValue,
        displayValue: formatDisplayValue(financialSummary.raw.poweringDownValue),
        percent: poweringDownPct,
        color: "#f43f5e", // Rose color
        iconColorClass: "text-rose-500",
      });
    }

    return segments;
  }, [financialSummary.raw, t]);


  const handleSegmentClick = (key: string | null) => {
    const newKey = activeSegmentKey === key ? null : key;
    setActiveSegmentKey(newKey);
    if (newKey) {
      if (isCardHidden) setIsCardHidden(false);
      const segmentToAssetMap: { [key: string]: string[] } = {
        staked: ["hp"],
        liquid: ["hive", "hbd"],
        savings: ["hive", "hbd"],
        unclaimed: ["hp", "hive", "hbd"],
        poweringDown: ["hp"],
      };
      const assetsToOpen = segmentToAssetMap[newKey as keyof typeof segmentToAssetMap];
      if (assetsToOpen) {
        setOpenSections((prev) => ({
          ...prev,
          ...assetsToOpen.reduce(
            (acc, assetKey) => ({ ...acc, [assetKey]: true }),
            {}
          ),
        }));
      }
    }
  };
  
  const handleToggleAll = () =>
    setOpenSections((prev) =>
      ASSET_CONFIG.reduce(
        (acc, asset) => ({ ...acc, [asset.key]: !areAllOpen }),
        {}
      )
    );

  const getHighlightClass = (field: keyof Explorer.FormattedAccountDetails) => {
    if (
      !activeSegmentKey ||
      !fieldHighlightConfig.get(activeSegmentKey)?.includes(field)
    )
      return "";
    return (
      highlightConfig[activeSegmentKey as keyof typeof highlightConfig] || ""
    );
  };


  const prepareExportData = useCallback(() => {
    if (!userDetails) return [];
    return prepareAccountBalanceReport( userDetails, financialSummary, chartSegments, hbdInterestApr, t );
  }, [userDetails, financialSummary, chartSegments, hbdInterestApr, t]);

  return (
    <TooltipProvider>
      <Card data-testid="account-balance-card" className="bg-theme shadow-lg dark:shadow-slate-900/50">
        <CardHeader className="p-3">
          {/* Card Header and top-right controls (Export, Expand/Collapse) */}
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className=" flex items-center gap-2 text-xl font-semibold">
              <Wallet className="h-4 w-4" />
              {t("accountBalanceCard.wallet")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <DataExport
                  data={prepareExportData()}
                  filename={`${userDetails.name}_wallet_report`}
                  skipColumnSelection={true}
                >
                  <TooltipTrigger asChild>
                    <button>
                      <FileDown className="h-5 w-5 mt-1.5" />
                    </button>
                  </TooltipTrigger>
                </DataExport>
                <TooltipContent>
                  <p>{t("accountBalanceCard.exportReport")}</p>
                </TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-slate-200 dark:border-slate-700"></div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleToggleAll}
                  >
                    <ChevronsUpDown className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {areAllOpen
                      ? t("accountBalanceCard.collapseAll")
                      : t("accountBalanceCard.expandAll")}
                  </p>
                </TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-slate-200 dark:border-slate-700"></div>
              <button
                onClick={() => setIsCardHidden(!isCardHidden)}
              >
                <ArrowUp
                  className={cn("transition-transform duration-300", {
                    "transform rotate-180": isCardHidden,
                  })}
                />
              </button>
            </div>
          </div>

          {/* Account's Total Value Display */}
          <div>
            <p className="text-3xl font-bold tracking-tight mt-3">
              {financialSummary.formatted.totalValue}
            </p>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-3">
            <AccountBalanceCardChart
              segments={chartSegments}
              activeSegmentKey={activeSegmentKey}
              onSegmentClick={handleSegmentClick}
            />
          </div>
        </CardHeader>

        {/* Collapsible content area with detailed asset breakdown */}
        {!isCardHidden && (
          <CardContent className="px-3 pb-3 pt-1 space-y-2">
            {ASSET_CONFIG.map((asset) => (
              <AssetSection
                key={asset.key}
                asset={asset}
                isOpen={!!openSections[asset.key]}
                onToggle={() =>
                  setOpenSections((p) => ({ ...p, [asset.key]: !p[asset.key] }))
                }
                userDetails={userDetails}
                getHighlightClass={getHighlightClass}
                financialSummary={financialSummary}
                hbdApr={hbdInterestApr}
                t={t}
                activeSegmentKey={activeSegmentKey}
              />
            ))}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default AccountBalanceCard;