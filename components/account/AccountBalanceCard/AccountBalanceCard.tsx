import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRightLeft, // For Open Orders
  ArrowUp,
  ChevronUp,
  ChevronsUpDown,
  Database,
  DollarSign,
  FileDown,
  HandCoins,
  HelpCircle,
  Loader2,
  Lock, // A great icon for the "Locked" category
  Timer, // For Pending Conversions
  TrendingDown,
  User,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { AccountBalanceCardChart } from "./AccountBalanceCardChart";
import { prepareAccountBalanceReport } from "./AccountBalanceCardExport";
import DataExport from "../../DataExport";
import VestsTooltip from "../../VestsTooltip";

import Explorer from "@/types/Explorer";
import useBlockChainProperties from "@/hooks/api/common/useBlockChainProperties";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber } from "@/lib/utils";
import {
  changeHBDToDollarsDisplay,
  grabNumericValue,
} from "@/utils/StringUtils";
import useAccountBalances from "@/hooks/api/accountPage/useAccountBalances";

// A new type to combine data from two different sources
type CombinedAccountDetails = Explorer.FormattedAccountDetails & {
  open_orders_hive_amount?: string;
  open_orders_hbd_amount?: string;
  conversion_pending_amount_hive?: string;
  conversion_pending_amount_hbd?: string;
  open_orders_hive_count?: number;
  open_orders_hbd_count?: number;
  conversion_pending_count_hive?: number;
  conversion_pending_count_hbd?: number;
  dollars: Explorer.FormattedAccountDetails['dollars'] & {
    open_orders_hive_amount?: string;
    open_orders_hbd_amount?: string;
    conversion_pending_amount_hive?: string;
    conversion_pending_amount_hbd?: string;
  }
};


// ====================================================================
// SECTION: Static Configurations
// ====================================================================

/** Maps internal API keys to human-readable i18n translation keys. */
export const cardNameMapKeys = new Map<
  keyof CombinedAccountDetails,
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
  ["open_orders_hive_amount", "accountBalanceCard.openOrders"],
  ["open_orders_hbd_amount", "accountBalanceCard.openOrders"],
  ["conversion_pending_amount_hive", "accountBalanceCard.pendingConversions"],
  ["conversion_pending_amount_hbd", "accountBalanceCard.pendingConversions"],
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
    icon: (
      <Image
        src="/hive-logo.png"
        alt="Hive logo"
        width={15}
        height={15}
      />
    ),
    fields: [
        "balance", 
        "savings_balance", 
        "reward_hive_balance",
        "open_orders_hive_amount",
        "conversion_pending_amount_hive",
    ] as const,
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
      "open_orders_hbd_amount",
      "conversion_pending_amount_hbd",
    ] as const,
  },
];

// ====================================================================
// SECTION: Data Processing Hook
// ====================================================================

/**
 * Calculate and format all financial data for the account
 */
const useFinancialSummary = (userDetails: CombinedAccountDetails | null) => {
  return useMemo(() => {
    if (!userDetails) {
      const emptyDollars = Object.keys(userDetails?.dollars || {}).reduce((acc, key) => ({...acc, [key]: '0'}), {}) as CombinedAccountDetails['dollars'];
      return {
        raw: { totalValue: 0, liquidValue: 0, stakedValue: 0, savingsValue: 0, unclaimedValue: 0, poweringDownValue: 0, lockedValue: 0 },
        formatted: { totalValue: "$0.00", totalHp: "0 HP", totalHive: "0 HIVE", totalHbd: "0 HBD", effectiveHp: "0 HP", totalHiveUsd: "$0.00", totalHbdUsd: "$0.00", dollars: emptyDollars, vests: {} }
      };
    }
    console.log('CombinedAccountDetails',userDetails);
    const { dollars } = userDetails;

    const stakedValueRaw = grabNumericValue(dollars.vesting_shares);
    const poweringDownValueRaw = grabNumericValue(dollars.vesting_withdraw_rate);
    const liquidValueRaw = grabNumericValue(dollars.balance) + grabNumericValue(dollars.hbd_balance);
    const savingsValueRaw = grabNumericValue(dollars.savings_balance) + grabNumericValue(dollars.hbd_saving_balance);
    const unclaimedValueRaw =
      grabNumericValue(dollars.reward_hive_balance) +
      grabNumericValue(dollars.reward_hbd_balance) +
      grabNumericValue(dollars.reward_vesting_balance);
    
    const openOrdersValueRaw = 
      grabNumericValue(dollars.open_orders_hive_amount || '0') +
      grabNumericValue(dollars.open_orders_hbd_amount || '0');
    const pendingConversionsValueRaw = 
      grabNumericValue(dollars.conversion_pending_amount_hive || '0') +
      grabNumericValue(dollars.conversion_pending_amount_hbd || '0');
    
    const lockedValueRaw = openOrdersValueRaw + pendingConversionsValueRaw;
    const totalValueRaw = stakedValueRaw + poweringDownValueRaw + liquidValueRaw + savingsValueRaw + unclaimedValueRaw + lockedValueRaw;
    
    const totalHpRaw =
      grabNumericValue(userDetails.vesting_shares) +
      grabNumericValue(userDetails.received_vesting_shares) -
      grabNumericValue(userDetails.delegated_vesting_shares) -
      grabNumericValue(userDetails.vesting_withdraw_rate);
    const effectiveHpRaw =
      grabNumericValue(userDetails.vesting_shares) +
      grabNumericValue(userDetails.received_vesting_shares) -
      grabNumericValue(userDetails.delegated_vesting_shares);
    const totalHiveRaw =
      grabNumericValue(userDetails.balance) +
      grabNumericValue(String(userDetails.savings_balance)) +
      grabNumericValue(userDetails.reward_hive_balance) +
      grabNumericValue(userDetails.open_orders_hive_amount || '0') +
      grabNumericValue(userDetails.conversion_pending_amount_hive || '0');
    const totalHbdRaw =
      grabNumericValue(userDetails.hbd_balance) +
      grabNumericValue(userDetails.hbd_saving_balance) +
      grabNumericValue(userDetails.reward_hbd_balance) +
      grabNumericValue(userDetails.open_orders_hbd_amount || '0') +
      grabNumericValue(userDetails.conversion_pending_amount_hbd || '0');
    const totalHiveUsdRaw =
      grabNumericValue(dollars.balance) +
      grabNumericValue(dollars.savings_balance) +
      grabNumericValue(dollars.reward_hive_balance) +
      grabNumericValue(dollars.open_orders_hive_amount || '0') +
      grabNumericValue(dollars.conversion_pending_amount_hive || '0');
    const totalHbdUsdRaw =
      grabNumericValue(dollars.hbd_balance) +
      grabNumericValue(dollars.hbd_saving_balance) +
      grabNumericValue(dollars.reward_hbd_balance) +
      grabNumericValue(dollars.open_orders_hbd_amount || '0') +
      grabNumericValue(dollars.conversion_pending_amount_hbd || '0');

    const formattedDollars = Object.entries(userDetails.dollars).reduce(
      (acc, [key, value]) => {
        acc[key as keyof typeof userDetails.dollars] =
          changeHBDToDollarsDisplay(value as string);
        return acc;
      },
      {} as Record<keyof typeof userDetails.dollars, string>
    );

    return {
      raw: { totalValue: totalValueRaw, liquidValue: liquidValueRaw, stakedValue: stakedValueRaw, savingsValue: savingsValueRaw, unclaimedValue: unclaimedValueRaw, poweringDownValue: poweringDownValueRaw, lockedValue: lockedValueRaw },
      formatted: { totalValue: changeHBDToDollarsDisplay(totalValueRaw.toString()), totalHp: `${formatNumber(totalHpRaw, false, true)} HP`, totalHive: `${totalHiveRaw.toLocaleString(undefined, { maximumFractionDigits: 3, })} HIVE`, totalHbd: `${totalHbdRaw.toLocaleString(undefined, { maximumFractionDigits: 3, })} HBD`, effectiveHp: `${effectiveHpRaw.toLocaleString(undefined, { maximumFractionDigits: 3, })} HP`, totalHiveUsd: changeHBDToDollarsDisplay(totalHiveUsdRaw.toString()), totalHbdUsd: changeHBDToDollarsDisplay(totalHbdUsdRaw.toString()), dollars: formattedDollars, vests: userDetails.vests, },
    };
  }, [userDetails]);
};

// ====================================================================
// SECTION: UI Highlighting Configurations
// ====================================================================

const fieldHighlightConfig = new Map< string, (keyof CombinedAccountDetails)[] >([
  ["staked", ["vesting_shares"]],
  ["savings", ["savings_balance", "hbd_saving_balance"]],
  ["liquid", ["balance", "hbd_balance"]],
  [ "unclaimed", ["reward_hive_balance", "reward_hbd_balance", "reward_vesting_balance"],],
  ["poweringDown", ["vesting_withdraw_rate"]],
  ["locked", ["open_orders_hive_amount", "open_orders_hbd_amount", "conversion_pending_amount_hive", "conversion_pending_amount_hbd"]],
]);

const highlightConfig = {
  staked: "bg-purple-100 border-l-2 border-purple-400 dark:bg-purple-500/15 dark:border-purple-500",
  savings: "bg-amber-100  border-l-2 border-amber-400  dark:bg-amber-400/15  dark:border-amber-400",
  liquid: "bg-sky-100    border-l-2 border-sky-400    dark:bg-sky-500/15    dark:border-sky-500",
  unclaimed: "bg-teal-100   border-l-2 border-teal-400   dark:bg-teal-400/15   dark:border-teal-400",
  poweringDown: "bg-rose-100 border-l-2 border-rose-400 dark:bg-rose-400/15 dark:border-rose-400",
  locked: "bg-gray-200 border-l-2 border-gray-500 dark:bg-gray-600/25 dark:border-gray-500",
};

// ====================================================================
// SECTION: Reusable Sub-Components
// ====================================================================

const HbdAprTooltip = ({ hbdInterestApr, isLoading, t }: any) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="flex items-center space-x-1 text-xs px-1.5 py-0.5 rounded-md bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold cursor-help">
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>{hbdInterestApr} APR</span>}
        <HelpCircle className="h-3 w-3" />
      </span>
    </TooltipTrigger>
    <TooltipContent><p>{t("accountBalanceCard.hbdAprTooltip")}</p></TooltipContent>
  </Tooltip>
);

const DetailRow = ({
  fieldKey, label, value, dollarValue, icon, labelSuffix, count, countTooltip,
  className = "", valueClassName = "", labelClassName = "text-slate-600 dark:text-slate-400", isHighlighted,
}: any) => {
  // **NEW**: Create a reusable Badge component
  const Badge = (
    <span className="flex items-center justify-center text-xs font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-help">
      {count}
    </span>
  );

  return (
    <div key={fieldKey} className={cn("flex flex-wrap justify-between items-baseline px-1 rounded-md transition-colors gap-x-2", className)}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className={cn("text-sm", { "dark:text-slate-100": isHighlighted }, labelClassName)}>{label}</span>
        {/* **NEW**: Conditionally render the badge with a tooltip */}
        {count > 0 && (
          countTooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>{Badge}</TooltipTrigger>
              <TooltipContent><p>{countTooltip}</p></TooltipContent>
            </Tooltip>
          ) : (
            Badge
          )
        )}
        {labelSuffix}
      </div>
      <div className="flex-grow text-right">
        <div className={cn("font-mono text-sm text-slate-800 dark:text-slate-200", { "dark:text-slate-100": isHighlighted }, valueClassName)}>{value}</div>
        <div className="text-xs text-slate-500">{dollarValue}</div>
      </div>
    </div>
  );
};

const AssetSection = ({
  asset, isOpen, onToggle, userDetails, getHighlightClass, financialSummary, hbdApr, t, activeSegmentKey,
}: any) => {
  const { blockChainPropertiesDataLoading: isLoadingApr } = useBlockChainProperties();

  const amountToCountMap = new Map<keyof CombinedAccountDetails, keyof CombinedAccountDetails>([
    ['open_orders_hive_amount', 'open_orders_hive_count'],
    ['open_orders_hbd_amount', 'open_orders_hbd_count'],
    ['conversion_pending_amount_hive', 'conversion_pending_count_hive'],
    ['conversion_pending_amount_hbd', 'conversion_pending_count_hbd'],
  ]);

  const renderValue = (key: keyof CombinedAccountDetails, sign: "" | "+" | "-" = "") => {
    if (key in userDetails.vests) {
      const vestKey = key as keyof Explorer.AccountDetailsVests;
      return <VestsTooltip tooltipTrigger={`${sign}${String(userDetails[key])}`} tooltipContent={String(userDetails.vests[vestKey])}/>;
    }
    return `${sign}${userDetails[key]}`;
  };

  const hpDetails = [
    { key: "vesting_shares", icon: User, sign: "", colorClass: "text-slate-600 dark:text-slate-400", valueColor: "text-slate-800 dark:text-slate-200", },
    { key: "received_vesting_shares", icon: HandCoins, sign: "+", colorClass: "text-green-600 dark:text-green-400", valueColor: undefined, },
    { key: "delegated_vesting_shares", icon: Users, sign: "-", colorClass: "text-red-500 dark:text-red-400", valueColor: undefined, },
  ] as const;

  const regularFields = asset.fields.filter((f: string) => !f.startsWith("reward_") && !f.startsWith("vesting_") && !f.startsWith("open_orders_") && !f.startsWith("conversion_pending_"));
  const specialFields = asset.fields.filter((f: string) => f.startsWith("reward_") || f.startsWith("vesting_withdraw") || f.startsWith("open_orders_") || f.startsWith("conversion_pending_"));
  const assetTotalValue = asset.key === "hp" ? financialSummary.formatted.totalHp : asset.key === "hive" ? financialSummary.formatted.totalHive : financialSummary.formatted.totalHbd;
  const isClaimable = (field: keyof CombinedAccountDetails) => field.startsWith("reward_") && grabNumericValue(userDetails[field] || '0') > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div onClick={onToggle} className="flex flex-wrap justify-between items-center p-2 cursor-pointer gap-x-4 gap-y-1">
        <div className="flex items-center space-x-2">
          {asset.icon}
          <Tooltip>
            <TooltipTrigger asChild><span className="font-semibold text-sm flex items-center gap-1.5">{t(asset.name)} <HelpCircle className="h-3 w-3" /></span></TooltipTrigger>
            <TooltipContent><p className="max-w-[260px]">{t(asset.description)}</p></TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="font-semibold text-sm">{assetTotalValue}</span>
          <ChevronUp className={cn("h-5 w-5 flex-shrink-0", { "transform rotate-180": !isOpen, })}/>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700/50 px-2 py-1.5 space-y-0.5">
          {asset.key === "hp"
            ? hpDetails.map((detail) => ( <DetailRow key={detail.key} fieldKey={detail.key} className={getHighlightClass(detail.key)} isHighlighted={!!getHighlightClass(detail.key)} icon={<detail.icon className={cn("h-4 w-4", detail.colorClass)} />} label={t(cardNameMapKeys.get(detail.key)!)} labelClassName={detail.colorClass} valueClassName={detail.valueColor || detail.colorClass} value={renderValue(detail.key, detail.sign)} dollarValue={financialSummary.formatted.dollars[detail.key]}/> ))
            : regularFields.map((field: keyof CombinedAccountDetails) => ( <DetailRow key={field} fieldKey={field} className={getHighlightClass(field)} isHighlighted={!!getHighlightClass(field)} label={t(cardNameMapKeys.get(field)!)} value={renderValue(field)} dollarValue={financialSummary.formatted.dollars[field]} labelSuffix={ field === "hbd_saving_balance" && hbdApr ? <HbdAprTooltip hbdInterestApr={hbdApr} isLoading={isLoadingApr} t={t} /> : null}/>)
          )}
          {specialFields.filter((field: keyof CombinedAccountDetails) => grabNumericValue(userDetails[field] || '0') > 0).length > 0 && (
            <div className="border-t border-slate-200/80 dark:border-slate-700/80 mt-1.5 pt-1.5 space-y-0.5">
              {specialFields.map((field: keyof CombinedAccountDetails) => {
                  if (grabNumericValue(userDetails[field] || '0') <= 0) return null;
                  const hasClaimableAmount = isClaimable(field);
                  const isPoweringDown = field === "vesting_withdraw_rate";
                  const isOpenOrder = field.startsWith("open_orders_");
                  const isPendingConversion = field.startsWith("conversion_pending_");
                  let icon = null;
                  if (isPoweringDown) icon = <TrendingDown className="h-4 w-4 text-rose-500" />;
                  else if (hasClaimableAmount) icon = <Database className="h-4 w-4 text-teal-500" />;
                  else if (isOpenOrder) icon = <ArrowRightLeft className="h-4 w-4 text-slate-500" />;
                  else if (isPendingConversion) icon = <Timer className="h-4 w-4 text-lime-500" />;
                  const isDefaultHighlighted = hasClaimableAmount && !getHighlightClass(field) && !activeSegmentKey;
                  const countKey = amountToCountMap.get(field);
                  const count = countKey ? userDetails[countKey] as number : 0;
                  
                  // **NEW**: Determine the correct tooltip text
                  let countTooltip = "";
                  if (isOpenOrder) countTooltip = t("accountBalanceCard.openOrdersTooltip");
                  if (isPendingConversion) countTooltip = t("accountBalanceCard.pendingConversionsTooltip");

                  return (
                    <DetailRow key={field} fieldKey={field} className={cn(getHighlightClass(field), {"bg-gradient-to-r from-cyan-100 to-transparent dark:from-teal-900/50 dark:to-transparent": isDefaultHighlighted,})} isHighlighted={!!getHighlightClass(field) || isDefaultHighlighted} label={t(cardNameMapKeys.get(field)!)} labelClassName={hasClaimableAmount ? "text-cyan-800 dark:text-teal-300 font-semibold" : "text-slate-600 dark:text-slate-400"} icon={icon} value={renderValue(field)} dollarValue={financialSummary.formatted.dollars[field]} count={count} countTooltip={countTooltip}/>
                  );
              }).filter(Boolean)}
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

type AccountBalanceCardProps = { header: string; userDetails: Explorer.FormattedAccountDetails; accountName : string; isInitiallyOpen: boolean; };

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({ header, userDetails, accountName, isInitiallyOpen,}) => {
  const { t } = useI18n();
  const { accountBalancesData } = useAccountBalances(accountName);
  const [isCardHidden, setIsCardHidden] = useState(!isInitiallyOpen);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ hive: false, hbd: false, hp: false,});
  const [activeSegmentKey, setActiveSegmentKey] = useState<string | null>(null);
  const { blockChainPropertiesData } = useBlockChainProperties();

  const combinedUserDetails: CombinedAccountDetails | null = useMemo(() => {
    if (!userDetails || !accountBalancesData) return null;
    const hiveBalanceRaw = grabNumericValue(userDetails.balance);
    const hiveBalanceUsdRaw = grabNumericValue(userDetails.dollars.balance);
    const hivePrice = hiveBalanceRaw > 0 ? hiveBalanceUsdRaw / hiveBalanceRaw : 0;
    const hbdBalanceRaw = grabNumericValue(userDetails.hbd_balance);
    const hbdBalanceUsdRaw = grabNumericValue(userDetails.dollars.hbd_balance);
    const hbdPrice = hbdBalanceRaw > 0 ? hbdBalanceUsdRaw / hbdBalanceRaw : 1; 
    const { open_orders_hive_amount, open_orders_hbd_amount, conversion_pending_amount_hive, conversion_pending_amount_hbd, open_orders_hive_count, open_orders_hbd_count, conversion_pending_count_hive, conversion_pending_count_hbd } = accountBalancesData;
    const dollarsOpenOrdersHive = open_orders_hive_amount * hivePrice;
    const dollarsOpenOrdersHbd = open_orders_hbd_amount * hbdPrice;
    const dollarsPendingConversionsHive = conversion_pending_amount_hive * hivePrice;
    const dollarsPendingConversionsHbd = conversion_pending_amount_hbd * hbdPrice;
    return {
        ...userDetails,
        open_orders_hive_amount: `${open_orders_hive_amount.toFixed(3)} HIVE`,
        open_orders_hbd_amount: `${open_orders_hbd_amount.toFixed(3)} HBD`,
        conversion_pending_amount_hive: `${conversion_pending_amount_hive.toFixed(3)} HIVE`,
        conversion_pending_amount_hbd: `${conversion_pending_amount_hbd.toFixed(3)} HBD`,
        open_orders_hive_count,
        open_orders_hbd_count,
        conversion_pending_count_hive,
        conversion_pending_count_hbd,
        dollars: { ...userDetails.dollars, open_orders_hive_amount: dollarsOpenOrdersHive.toString(), open_orders_hbd_amount: dollarsOpenOrdersHbd.toString(), conversion_pending_amount_hive: dollarsPendingConversionsHive.toString(), conversion_pending_amount_hbd: dollarsPendingConversionsHbd.toString(), },
    };
  }, [userDetails, accountBalancesData]);

  const financialSummary = useFinancialSummary(combinedUserDetails);
  const hbdInterestApr = useMemo(() => { return blockChainPropertiesData?.hbd_interest_rate ? `${(blockChainPropertiesData.hbd_interest_rate / 100).toFixed(2)}%` : null; }, [blockChainPropertiesData]);
  const areAllOpen = useMemo(() => ASSET_CONFIG.every((asset) => !!openSections[asset.key]), [openSections]);

  const chartSegments = useMemo(() => {
    const total = financialSummary.raw.totalValue || 1;
    const formatDisplayValue = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const segments = [
      { key: "staked", label: t("accountBalanceCard.staked"), value: financialSummary.raw.stakedValue, displayValue: formatDisplayValue(financialSummary.raw.stakedValue), percent: (financialSummary.raw.stakedValue / total) * 100, color: "#8b5cf6", iconColorClass: "text-purple-500", },
      { key: "savings", label: t("accountBalanceCard.savings"), value: financialSummary.raw.savingsValue, displayValue: formatDisplayValue(financialSummary.raw.savingsValue), percent: (financialSummary.raw.savingsValue / total) * 100, color: "#f59e0b", iconColorClass: "text-amber-500", },
      { key: "liquid", label: t("accountBalanceCard.liquid"), value: financialSummary.raw.liquidValue, displayValue: formatDisplayValue(financialSummary.raw.liquidValue), percent: (financialSummary.raw.liquidValue / total) * 100, color: "#0ea5e9", iconColorClass: "text-sky-500", },
      { key: "unclaimed", label: t("accountBalanceCard.unclaimed"), value: financialSummary.raw.unclaimedValue, displayValue: formatDisplayValue(financialSummary.raw.unclaimedValue), percent: (financialSummary.raw.unclaimedValue / total) * 100, color: "#14b8a6", iconColorClass: "text-teal-500", },
    ];
    if (financialSummary.raw.poweringDownValue > 0) { segments.push({ key: "poweringDown", label: t("accountBalanceCard.powerDown"), value: financialSummary.raw.poweringDownValue, displayValue: formatDisplayValue(financialSummary.raw.poweringDownValue), percent: (financialSummary.raw.poweringDownValue / total) * 100, color: "#f43f5e", iconColorClass: "text-rose-500", }); }
    if (financialSummary.raw.lockedValue > 0) { segments.push({ key: "locked", label: t("accountBalanceCard.locked"), value: financialSummary.raw.lockedValue, displayValue: formatDisplayValue(financialSummary.raw.lockedValue), percent: (financialSummary.raw.lockedValue / total) * 100, color: "#4b5563", iconColorClass: "text-gray-600", }); }
    return segments.sort((a,b) => b.value - a.value);
  }, [financialSummary.raw, t]);

  const handleSegmentClick = (key: string | null) => {
    const newKey = activeSegmentKey === key ? null : key;
    setActiveSegmentKey(newKey);
    if (newKey) {
      if (isCardHidden) setIsCardHidden(false);
      const segmentToAssetMap: { [key: string]: string[] } = { staked: ["hp"], liquid: ["hive", "hbd"], savings: ["hive", "hbd"], unclaimed: ["hp", "hive", "hbd"], poweringDown: ["hp"], locked: ["hive", "hbd"], };
      const assetsToOpen = segmentToAssetMap[newKey as keyof typeof segmentToAssetMap];
      if (assetsToOpen) { setOpenSections((prev) => ({ ...prev, ...assetsToOpen.reduce( (acc, assetKey) => ({ ...acc, [assetKey]: true }), {}), })); }
    }
  };
  
  const handleToggleAll = () => setOpenSections((prev) => ASSET_CONFIG.reduce((acc, asset) => ({ ...acc, [asset.key]: !areAllOpen }), {}));
  const getHighlightClass = (field: keyof CombinedAccountDetails) => { if (!activeSegmentKey || !fieldHighlightConfig.get(activeSegmentKey)?.includes(field)) return ""; return (highlightConfig[activeSegmentKey as keyof typeof highlightConfig] || ""); };

  const prepareExportData = useCallback(() => {
    if (!combinedUserDetails) return [];
    // @ts-ignore
    return prepareAccountBalanceReport(combinedUserDetails, financialSummary, chartSegments, hbdInterestApr, t);
  }, [combinedUserDetails, financialSummary, chartSegments, hbdInterestApr, t]);

  if (!combinedUserDetails) { return null; }

  return (
    <TooltipProvider>
      <Card data-testid="account-balance-card" className="bg-theme shadow-lg dark:shadow-slate-900/50">
        <CardHeader className="p-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className=" flex items-center gap-2 text-xl font-semibold">
              <Wallet className="h-4 w-4" />
              {header}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <DataExport data={prepareExportData()} filename={`${userDetails.name}_${t("accountBalanceCard.walletReport")}`} skipColumnSelection={true}>
                  <TooltipTrigger asChild><button><FileDown className="h-5 w-5 mt-1.5" /></button></TooltipTrigger>
                </DataExport>
                <TooltipContent><p>{t("accountBalanceCard.exportReport")}</p></TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-slate-200 dark:border-slate-700"></div>
              <Tooltip>
                <TooltipTrigger asChild><button onClick={handleToggleAll}><ChevronsUpDown className="h-5 w-5" /></button></TooltipTrigger>
                <TooltipContent><p>{areAllOpen ? t("accountBalanceCard.collapseAll") : t("accountBalanceCard.expandAll")}</p></TooltipContent>
              </Tooltip>
              <div className="w-px h-4 bg-slate-200 dark:border-slate-700"></div>
              <button onClick={() => setIsCardHidden(!isCardHidden)}>
                <ArrowUp className={cn("transition-transform duration-300", { "transform rotate-180": isCardHidden, })}/>
              </button>
            </div>
          </div>
          <div><p className="text-3xl font-bold tracking-tight mt-3">{financialSummary.formatted.totalValue}</p></div>
          <div className="mt-3"><AccountBalanceCardChart segments={chartSegments} activeSegmentKey={activeSegmentKey} onSegmentClick={handleSegmentClick}/></div>
        </CardHeader>

        {!isCardHidden && (
          <CardContent className="px-3 pb-3 pt-1 space-y-2">
            {ASSET_CONFIG.map((asset) => (
              <AssetSection key={asset.key} asset={asset} isOpen={!!openSections[asset.key]} onToggle={() => setOpenSections((p) => ({ ...p, [asset.key]: !p[asset.key] }))} userDetails={combinedUserDetails} getHighlightClass={getHighlightClass} financialSummary={financialSummary} hbdApr={hbdInterestApr} t={t} activeSegmentKey={activeSegmentKey}/>
            ))}
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default AccountBalanceCard;