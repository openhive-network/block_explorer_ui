import { useEffect, useState, useRef, useMemo } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  listPageMeta,
  pageTitle,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { seoText } from "@/utils/seo/seoStrings";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import PageTitle from "@/components/PageTitle";
import FilterChipsBar from "@/components/ui/FilterChipsBar";
import type { NotFoundReason } from "@/components/AccountLocator";
import ErrorMessage from "@/components/ErrorMessage";
import NoResult from "@/components/NoResult";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import { useI18n } from "@/i18n/i18n";
import DataExport from "@/components/DataExport";
import CustomPagination from "@/components/CustomPagination";
import useTopHolders, {
  CoinType,
  BalanceType,
} from "@/hooks/api/common/useTopHolders";
import { config } from "@/Config";
import { Loader2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP, computeVestingRatios } from "@/utils/Calculations";
import { formatCompact, formatSharePct } from "@/utils/chartUtils";
import { grabNumericValue } from "@/utils/StringUtils";
import { COIN_BRACKETS } from "@/utils/coinBrackets";
import { relocalizeAmount } from "@/utils/localeAmount";
import { isSystemAccount } from "@/utils/systemAccounts";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import useTotalValueLocked from "@/hooks/api/homePage/useTotalValueLocked";
import useTopHoldersConcentration from "@/hooks/api/common/useTopHoldersConcentration";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import ScrollTopButton from "@/components/ScrollTopButton";
import JumpToPage from "@/components/JumpToPage";
import DataCountMessage from "@/components/DataCountMessage";
import TopHoldersConcentrationStrip from "@/components/TopHoldersConcentrationStrip";
import TopHolderYouBadge from "@/components/TopHolderYouBadge";
import AccountLabelBadge from "@/components/AccountLabelBadge";
import { resolveAccountLabel } from "@/utils/accountLabels";
import useActiveWitnessNames from "@/hooks/api/common/useActiveWitnessNames";
import AccountLocator from "@/components/AccountLocator";
import AutoCompleteInput from "@/components/ui/AutoCompleteInput";
import useCompareSelection from "@/hooks/common/useCompareSelection";
import CompareSelectToggle from "@/components/compare/CompareSelectToggle";
import CompareSelectionBar from "@/components/compare/CompareSelectionBar";
import HiveAvatar from "@/components/ui/HiveAvatar";

// Total supply in the same raw unit as a holder's balance (VESTS ×1e6, HIVE/HBD ×1e3).
const getTotalSupplyRaw = (
  coinType: CoinType,
  headBlockDetails: Explorer.HeadBlockDetails | null | undefined
): number | null => {
  if (!headBlockDetails) return null;
  if (coinType === "VESTS") {
    const n = Number(headBlockDetails.rawTotalVestingShares?.amount);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const formatted =
    coinType === "HBD"
      ? headBlockDetails.currentHbdSupply
      : headBlockDetails.currentSupply;
  const n = grabNumericValue(String(formatted ?? ""));
  return Number.isFinite(n) && n > 0 ? n * 1000 : null;
};

// Denominator for every "% of supply" figure and the concentration KPIs
// (Largest / Top-N / Nakamoto). It must match the numerator on BOTH axes, or
// the percentages and the Nakamoto count come out wrong:
//   1. Balance type — a holder's value is liquid-only or savings-only, so the
//      base is that same pool: liquid = total supply − savings; savings = the
//      savings total (from the total-value-locked endpoint). VESTS has no split.
//   2. Account set — treasury (DHF) and burn are excluded from the ranking, so
//      subtract their balances from the base too (i.e. circulating, not total).
// Caveat: Hive's supply fields disagree on the treasury. HIVE's current_supply
// includes the DHF, but current_hbd_supply already omits it — and the DHF holds
// far more HBD than that figure. Subtracting it outright would make the base
// negative, so system balances are only removed when they fit inside the supply.
const getCirculatingBaseRaw = (
  coinType: CoinType,
  balanceType: BalanceType,
  headBlockDetails: Explorer.HeadBlockDetails | null | undefined,
  tvl: Hive.TotalValueLocked | undefined,
  concentrationHolders: { account: string; value: string }[]
): number | null => {
  const supplyRaw = getTotalSupplyRaw(coinType, headBlockDetails);
  if (supplyRaw === null) return null;
  let total: number;
  if (coinType === "VESTS") {
    total = supplyRaw;
  } else {
    if (!tvl) return null;
    const savingsRaw = Number(
      coinType === "HBD" ? tvl.savings_hbd : tvl.savings_hive
    );
    if (!Number.isFinite(savingsRaw)) return null;
    total =
      balanceType === "savings_balance" ? savingsRaw : supplyRaw - savingsRaw;
  }
  if (!Number.isFinite(total) || total <= 0) return null;
  const systemBalance = concentrationHolders
    .filter((h) => isSystemAccount(h.account))
    .reduce((s, h) => s + (Number(h.value) || 0), 0);
  return systemBalance < total ? total - systemBalance : total;
};

export default function TopHoldersPage({ meta }: { meta: SeoMeta }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { settings } = useSettings();
  const compareSelection = useCompareSelection();

  const [page, setPage] = useState(1);
  const [coinType, setCoinType] = useState<CoinType>("HIVE");
  const [balanceType, setBalanceType] = useState<BalanceType>("balance");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [minBalance, setMinBalance] = useState<number | undefined>(undefined);
  const [maxBalance, setMaxBalance] = useState<number | undefined>(undefined);
  const initedFromUrl = useRef(false);
  const unitForcedByReport = useRef(false);
  const prefilledInputs = useRef(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [searchTarget, setSearchTarget] = useState<string | null>(null);
  const [searchNonce, setSearchNonce] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchErrorReason, setSearchErrorReason] =
    useState<NotFoundReason>("noBalance");
  const [foundAccount, setFoundAccount] = useState<string | null>(null);
  const [jumpNonce, setJumpNonce] = useState(0);
  const foundAccountRef = useRef<string | null>(null);
  const accountSearchRef = useRef("");
  const foundRowRef = useRef<HTMLTableRowElement>(null);
  const scrollPending = useRef(false);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const [unit, setUnit] = useState<"vests" | "hp">(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  );

  useEffect(() => {
    if (unitForcedByReport.current) return;
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);

  const pageSize = config.topHolders.pageSize;

  const { holdersData, totalAccounts, isTopHoldersLoading, isTopHoldersError } =
    useTopHolders(coinType, balanceType, page, minBalance, maxBalance);

  const totalCount = totalAccounts;

  const defaultCoinType: CoinType = "HIVE";
  const defaultBalanceType: BalanceType = "balance";

  const filtersChanged =
    coinType !== defaultCoinType || balanceType !== defaultBalanceType;

  const { dynamicGlobalData } = useDynamicGlobal();
  const { hiveChain } = useHiveChainContext();
  const { witnessNames } = useActiveWitnessNames();
  const { username } = useAuth();
  const vestingRatios = useMemo(
    () => computeVestingRatios(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );

  // Hydrate filters from the URL once the router is ready (deep-link / refresh).
  useEffect(() => {
    if (!router.isReady || initedFromUrl.current) return;
    initedFromUrl.current = true;
    const {
      coin,
      balance,
      min,
      max,
      unit: qUnit,
      page: qPage,
      account: qAccount,
    } = router.query;
    const num = (v: unknown): number | undefined => {
      if (typeof v !== "string" || v === "") return undefined;
      const n = Number(v);
      return Number.isNaN(n) || n < 0 ? undefined : n;
    };
    if (coin === "HIVE" || coin === "HBD" || coin === "VESTS") {
      setCoinType(coin);
    }
    if (balance === "balance" || balance === "savings_balance") {
      setBalanceType(coin === "VESTS" ? "balance" : balance);
    }
    const minN = num(min);
    if (minN !== undefined) setMinBalance(minN);
    const maxN = num(max);
    if (maxN !== undefined) setMaxBalance(maxN);
    if (coin === "VESTS") {
      if (qUnit === "hp" || qUnit === "vests") {
        unitForcedByReport.current = true;
        setUnit(qUnit);
      } else if (minN !== undefined || maxN !== undefined) {
        unitForcedByReport.current = true;
        setUnit("hp");
      }
    }
    const p = num(qPage);
    if (p !== undefined && p > 0) setPage(p);
    // Deep link from a profile badge: locate and highlight that account.
    if (typeof qAccount === "string" && qAccount.trim()) {
      const acct = qAccount.trim().toLowerCase().replace(/^@/, "");
      setAccountSearch(acct);
      accountSearchRef.current = acct;
      setSearchTarget(acct);
      setSearchNonce((n) => n + 1);
    }
  }, [router.isReady, router.query]);

  // Mirror the active filters back into the URL (shareable / back-forward).
  useEffect(() => {
    if (!router.isReady || !initedFromUrl.current) return;
    const query: Record<string, string> = {};
    if (coinType !== "HIVE") query.coin = coinType;
    if (balanceType !== "balance") query.balance = balanceType;
    if (minBalance !== undefined) query.min = String(minBalance);
    if (maxBalance !== undefined) query.max = String(maxBalance);
    if (coinType === "VESTS") query.unit = unit;
    if (page > 1) query.page = String(page);
    const account = searchTarget ?? foundAccount;
    if (account) query.account = account;
    router.replace({ pathname: "/top-holders", query }, undefined, {
      shallow: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    coinType,
    balanceType,
    minBalance,
    maxBalance,
    unit,
    page,
    searchTarget,
    foundAccount,
  ]);

  const formatRawBalance = (value: string, coin: CoinType): string => {
    if (!hiveChain) return value;

    if (coin === "VESTS") {
      const fund = dynamicGlobalData?.headBlockDetails?.rawTotalVestingFundHive;
      const shares = dynamicGlobalData?.headBlockDetails?.rawTotalVestingShares;
      if (unit === "hp" && fund && shares) {
        return convertVestsToHP(hiveChain, value, fund, shares) ?? value;
      }
      return hiveChain.formatter.format(hiveChain.vests(value));
    } else if (coin === "HIVE") {
      return hiveChain.formatter.format(hiveChain.hive(value));
    } else if (coin === "HBD") {
      return hiveChain.formatter.format(hiveChain.hbd(value));
    }
    return value;
  };

  const formatBalance = (value: string, coin: CoinType): string =>
    relocalizeAmount(formatRawBalance(value, coin), locale);

  const filterActive = minBalance !== undefined || maxBalance !== undefined;

  const currentUnitLabel =
    coinType === "VESTS" ? (unit === "hp" ? "HP" : "VESTS") : coinType;

  const balanceLabel =
    coinType === "VESTS"
      ? t("topHolders.balanceStaked")
      : balanceType === "savings_balance"
        ? t("topHolders.balanceSavings")
        : t("topHolders.balanceLiquid");

  // Display-unit amount → raw smallest unit (VESTS ×1e6, HIVE/HBD ×1e3).
  const displayToRaw = (amount: number): number => {
    if (coinType === "VESTS") {
      if (unit === "hp") {
        const vph = vestingRatios?.vestsPerHive ?? 0;
        return Math.floor(amount * vph * 1e6);
      }
      return Math.floor(amount * 1e6);
    }
    return Math.floor(amount * 1000);
  };

  const rawToDisplay = (raw: number): number => {
    if (coinType === "VESTS") {
      if (unit === "hp") {
        const vph = vestingRatios?.vestsPerHive ?? 0;
        return vph ? Math.round(raw / 1e6 / vph) : 0;
      }
      return Math.round(raw / 1e6);
    }
    return Math.round(raw / 1000);
  };

  const rangeLabel = (): string => {
    const minStr = formatCompact(
      minBalance !== undefined ? rawToDisplay(minBalance) : 0,
      locale
    );
    if (maxBalance === undefined) return `${minStr}+ ${currentUnitLabel}`;
    return `${minStr}–${formatCompact(
      rawToDisplay(maxBalance),
      locale
    )} ${currentUnitLabel}`;
  };

  // Clears a pinned/found account: highlight, sticky ref, error, and any in-flight locate.
  const clearSelection = () => {
    setFoundAccount(null);
    foundAccountRef.current = null;
    setSearchError(null);
    setSearchTarget(null);
  };

  const applyRange = () => {
    const parse = (s: string): number | undefined | "invalid" => {
      const v = s.trim();
      if (v === "") return undefined;
      const n = Number(v);
      if (Number.isNaN(n) || n < 0) return "invalid";
      return Math.floor(displayToRaw(n));
    };
    const min = parse(minInput);
    const max = parse(maxInput);
    if (min === "invalid" || max === "invalid") {
      setRangeError(t("topHolders.rangeInvalidNumber"));
      return;
    }
    if (min !== undefined && max !== undefined && max < min) {
      setRangeError(t("topHolders.rangeInvalid"));
      return;
    }
    setRangeError(null);
    clearSelection();
    setMinBalance(min);
    setMaxBalance(max);
    setPage(1);
  };

  const clearFilter = () => {
    setMinBalance(undefined);
    setMaxBalance(undefined);
    setMinInput("");
    setMaxInput("");
    setAccountSearch("");
    accountSearchRef.current = "";
    setPage(1);
    clearSelection();
  };

  // The panel's Clear returns to the default view, coin and balance type included.
  const clearAllFilters = () => {
    clearFilter();
    setCoinType("HIVE");
    setBalanceType("balance");
  };

  const handleJumpToRank = (rank: number, account?: string) => {
    setMinBalance(undefined);
    setMaxBalance(undefined);
    setMinInput("");
    setMaxInput("");
    setPage(Math.max(1, Math.ceil(rank / pageSize)));
    if (account) {
      setAccountSearch(account);
      accountSearchRef.current = account;
      setFoundAccount(account);
      foundAccountRef.current = account;
      scrollPending.current = true;
      setJumpNonce((n) => n + 1);
    }
  };

  // Also re-runs on a jump within the page already shown, where data doesn't change.
  useEffect(() => {
    if (scrollPending.current && foundRowRef.current) {
      foundRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      scrollPending.current = false;
    }
  }, [holdersData, jumpNonce]);

  const onAccountSearchChange = (v: string) => {
    setAccountSearch(v);
    accountSearchRef.current = v;
    if (searchError) setSearchError(null);
    if (v.trim() === "") {
      // Clearing the field (X) also un-jumps: drop the selection and return to
      // the top of the list instead of stranding the user on the account's page.
      const hadSelection = foundAccountRef.current !== null;
      clearSelection();
      if (hadSelection) setPage(1);
    }
  };

  const runAccountSearch = () => {
    const acct = accountSearchRef.current
      .trim()
      .toLowerCase()
      .replace(/^@/, "");
    if (!acct) return;
    setSearchError(null);
    setSearchTarget(acct);
    setSearchNonce((n) => n + 1);
  };

  // On coin / balance-type change, re-locate the selected account under the new
  // view so its row stays highlighted (not-found only if it truly has no balance).
  useEffect(() => {
    setRangeError(null);
    const selected = foundAccountRef.current;
    if (!selected) return;
    setSearchError(null);
    setSearchTarget(selected);
    setSearchNonce((n) => n + 1);
  }, [coinType, balanceType]);

  // Prefill inputs once from a deep-linked range; never clobbers an in-progress draft.
  useEffect(() => {
    if (prefilledInputs.current) return;
    if (minBalance === undefined && maxBalance === undefined) return;
    if (coinType === "VESTS" && !vestingRatios) return;
    prefilledInputs.current = true;
    setMinInput(
      minBalance === undefined ? "" : String(rawToDisplay(minBalance))
    );
    setMaxInput(
      maxBalance === undefined ? "" : String(rawToDisplay(maxBalance))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minBalance, maxBalance, coinType, vestingRatios]);

  const totalSupplyRaw = useMemo(
    () => getTotalSupplyRaw(coinType, dynamicGlobalData?.headBlockDetails),
    [coinType, dynamicGlobalData]
  );

  const { totalValueLocked: tvl } = useTotalValueLocked();
  const { holders: concentrationHolders } = useTopHoldersConcentration(
    coinType,
    balanceType
  );
  const circulatingBaseRaw = useMemo(
    () =>
      getCirculatingBaseRaw(
        coinType,
        balanceType,
        dynamicGlobalData?.headBlockDetails,
        tvl,
        concentrationHolders
      ),
    [coinType, balanceType, dynamicGlobalData, tvl, concentrationHolders]
  );

  const applyPreset = (min: number, max: number | null) => {
    if (coinType === "VESTS") {
      const vph = vestingRatios?.vestsPerHive ?? 0;
      if (!vph) return;
      unitForcedByReport.current = true;
      setUnit("hp");
      setMinBalance(Math.floor(min * vph * 1e6));
      setMaxBalance(max === null ? undefined : Math.floor(max * vph * 1e6));
    } else {
      // setUnit is async, so convert here rather than via displayToRaw.
      setMinBalance(Math.floor(min * 1000));
      setMaxBalance(max === null ? undefined : Math.floor(max * 1000));
    }
    prefilledInputs.current = true;
    setMinInput(String(min));
    setMaxInput(max === null ? "" : String(max));
    setPage(1);
    clearSelection();
  };

  // Preset matching the active range (tolerant of rate drift; also on deep-link).
  const activePresetLabel = useMemo(() => {
    if (minBalance === undefined && maxBalance === undefined) return null;
    const near = (a: number | null, b: number | null) => {
      if (a === null || b === null) return a === b;
      return Math.abs(a - b) <= Math.max(1, b * 0.02);
    };
    if (coinType === "VESTS") {
      if (!vestingRatios) return null;
      const vph = vestingRatios.vestsPerHive;
      const minHp = minBalance !== undefined ? minBalance / 1e6 / vph : null;
      const maxHp = maxBalance !== undefined ? maxBalance / 1e6 / vph : null;
      return (
        COIN_BRACKETS.find((p) => near(minHp, p.min) && near(maxHp, p.max))
          ?.chip ?? null
      );
    }
    const min = minBalance !== undefined ? minBalance / 1000 : null;
    const max = maxBalance !== undefined ? maxBalance / 1000 : null;
    return (
      COIN_BRACKETS.find((p) => near(min, p.min) && near(max, p.max))?.chip ??
      null
    );
  }, [coinType, minBalance, maxBalance, vestingRatios]);

  const prepareExportData = () =>
    holdersData.map((holder, index) => {
      const displayValue = formatBalance(holder.value, coinType);

      return {
        [t("topHolders.rank")]:
          holder.rank > 0 ? holder.rank : index + 1 + (page - 1) * pageSize,
        [t("topHolders.account")]: holder.account,
        [t("topHolders.shareOfSupply")]: isSystemAccount(holder.account)
          ? "—"
          : formatSharePct(
              circulatingBaseRaw
                ? Math.min(1, (Number(holder.value) || 0) / circulatingBaseRaw)
                : 0,
              locale
            ),
        [balanceType === "savings_balance"
          ? t("topHolders.savings")
          : t("topHolders.balance")]: displayValue,
      };
    });

  const exportFileName = `${t(
    "topHolders.export"
  )}_${currentUnitLabel.toLowerCase()}.csv`;

  const HolderRow = ({
    rank,
    account,
    value,
    index,
  }: {
    rank: number;
    account: string;
    value: string;
    index: number;
  }) => {
    const displayRank = rank > 0 ? rank : index + 1 + (page - 1) * pageSize;
    const raw = Number(value) || 0;
    const share = circulatingBaseRaw
      ? Math.min(1, raw / circulatingBaseRaw)
      : 0;
    const label = resolveAccountLabel(account, {
      isWitness: witnessNames.has(account),
    });
    const isYou = !!username && account === username;
    const isHighlighted = isYou || account === foundAccount;

    return (
      <TableRow
        key={account}
        ref={account === foundAccount ? foundRowRef : undefined}
        className={`hover:bg-rowHover cursor-pointer text-sm ${
          isHighlighted ? "bg-violet-50 dark:bg-violet-950/40" : ""
        }`}
        data-testid="top-holders-table-row"
      >
        <TableCell className="px-2 sm:px-4">
          {displayRank.toLocaleString(locale)}
        </TableCell>
        <TableCell className="px-2 text-link sm:px-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 sm:gap-x-2">
            <div className="flex min-w-0 items-center gap-x-1.5 sm:gap-x-2">
              <HiveAvatar
                accountName={account}
                size={30}
                alt={`${account}'s profile`}
                className="flex-shrink-0 rounded-full"
              />
              <Link className="break-all text-link" href={`/@${account}`}>
                {account}
              </Link>
              {(label || isYou) && (
                <span className="flex flex-shrink-0 -translate-y-2 items-center gap-1 sm:translate-y-0">
                  {label && <AccountLabelBadge label={label} compactOnMobile />}
                  {isYou && (
                    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      {t("topHolders.you")}
                    </span>
                  )}
                </span>
              )}
            </div>
            {!isSystemAccount(account) && (
              <CompareSelectToggle
                account={account}
                selected={compareSelection.isSelected(account)}
                onToggle={compareSelection.toggle}
                t={t}
              />
            )}
          </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell text-end tabular-nums text-xs text-gray-500 dark:text-gray-400">
          {isSystemAccount(account) ? (
            <span className="inline-flex items-center justify-end gap-1">
              —
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-gray-400 hover:text-gray-500">
                      <Info size={11} />
                    </span>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      side="top"
                      className="max-w-[240px] text-center text-[11px]"
                    >
                      {account === "null"
                        ? t("accountLabel.burnInfo")
                        : t("accountLabel.treasuryInfo")}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </span>
          ) : (
            formatSharePct(share, locale)
          )}
        </TableCell>
        <TableCell className="text-end tabular-nums">
          <div>{formatBalance(value, coinType)}</div>
          <div className="text-xs font-normal text-gray-500 dark:text-gray-400 sm:hidden">
            {isSystemAccount(account) ? "—" : formatSharePct(share, locale)}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const TableHeaderRow = () => (
    <TableHeader>
      <TableRow className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-start">
        <TableHead className="px-2 sm:px-4">{t("topHolders.rank")}</TableHead>
        <TableHead className="px-2 sm:px-4">
          {t("topHolders.account")}
        </TableHead>
        <TableHead className="hidden sm:table-cell text-end">
          <span className="inline-flex items-center justify-end gap-1">
            {t("topHolders.shareOfSupply")}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-gray-400 hover:text-gray-500">
                    <Info size={12} />
                  </span>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="top"
                    className="max-w-[240px] text-center text-[11px]"
                  >
                    {t("topHolders.shareOfSupplyInfo")}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </span>
        </TableHead>
        <TableHead className="text-end pe-6">
          {balanceType === "savings_balance"
            ? t("topHolders.savings")
            : t("topHolders.balance")}
        </TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
    <>
      <Seo meta={meta} title={pageTitle(t("pageTitle.topHolders"))} />
      <div className="page-container">
        <Card className="w-full rounded shadow-md py-2">
          <div className="flex flex-row items-start justify-between w-full relative gap-3">
            <div className="flex flex-col items-start">
              <PageTitle
                titleKey="pageTitle.topHolders"
                className="pb-1 pt-4"
              />
              <p
                className="px-6 pb-3 text-sm text-gray-500 dark:text-gray-400"
                data-testid="top-holders-view"
              >
                {currentUnitLabel} · {balanceLabel}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 mt-3.5 pe-6">
              <FilterSectionToggle
                isFiltersActive={filtersChanged}
                toggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
              />
            </div>
          </div>
        </Card>

        {isFiltersVisible && (
          <div
            className="report-filters mt-2"
            data-testid="top-holders-filters"
          >
            <p className="report-filters-label">{t("common.filters")}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAccountSearch();
              }}
              className="mb-3 flex flex-wrap items-end gap-2"
            >
              <div className="flex w-full flex-col gap-y-2 sm:w-[260px]">
                <Label className="text-xs">{t("topHolders.findAccount")}</Label>
                <AutoCompleteInput
                  value={accountSearch}
                  onChange={onAccountSearchChange}
                  placeholder={t("topHolders.findAccountPlaceholder")}
                  inputType="account_name"
                  className="w-full"
                  inputClassName="!rounded !border !border-solid !border-gray-300 !bg-white dark:!border-gray-600 dark:!bg-gray-800"
                />
              </div>
              <Button
                type="submit"
                className="rounded"
                disabled={!!searchTarget}
              >
                {searchTarget && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t("topHolders.find")}
              </Button>
              {searchError && (
                <span className="pb-2 text-xs text-red-500">
                  {searchErrorReason === "missing"
                    ? t("topHolders.accountMissing", { account: searchError })
                    : searchErrorReason === "error"
                      ? t("common.errorLoadingData")
                      : t("topHolders.accountNotFound", {
                          account: searchError,
                        })}
                </span>
              )}
            </form>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex w-full flex-col gap-y-2 sm:w-[130px]">
                <Label className="text-xs">{t("topHolders.coin")}</Label>
                <Select
                  value={coinType}
                  onValueChange={(v) => {
                    setCoinType(v as CoinType);
                    if (v === "VESTS") setBalanceType("balance");
                    setMinBalance(undefined);
                    setMaxBalance(undefined);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIVE">HIVE</SelectItem>
                    <SelectItem value="HBD">HBD</SelectItem>
                    <SelectItem value="VESTS">
                      {unit === "hp" ? "HP" : "VESTS"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full flex-col gap-y-2 sm:w-[160px]">
                <Label className="text-xs">{t("topHolders.balanceType")}</Label>
                <Select
                  value={balanceType}
                  onValueChange={(v) => {
                    setBalanceType(v as BalanceType);
                    setPage(1);
                  }}
                  disabled={coinType === "VESTS"}
                >
                  <SelectTrigger className="rounded">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance">
                      {t("topHolders.filtersBalance")}
                    </SelectItem>
                    <SelectItem value="savings_balance">
                      {t("topHolders.filtersSavings")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-full flex-col gap-y-2 sm:w-auto">
                <Label className="text-xs">
                  {t("topHolders.range", { unit: currentUnitLabel })}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t("topHolders.min")}
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyRange();
                    }}
                    className="w-full rounded sm:w-28"
                    data-testid="top-holders-min"
                  />
                  <span className="text-gray-400">–</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t("topHolders.max")}
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyRange();
                    }}
                    className="w-full rounded sm:w-28"
                    data-testid="top-holders-max"
                  />
                </div>
              </div>

              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  onClick={applyRange}
                  data-testid="apply-filters"
                  className="rounded"
                >
                  {t("common.search")}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  data-testid="clear-filters"
                  className="rounded"
                >
                  {t("common.clear")}
                </Button>
              </div>

              {rangeError && (
                <div className="w-full">
                  <ErrorMessage
                    message={rangeError}
                    onClose={() => setRangeError(null)}
                    timeout={4000}
                  />
                </div>
              )}

              <div className="flex w-full flex-col gap-y-2">
                <Label className="text-xs">{t("topHolders.quickRanges")}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COIN_BRACKETS.map((p) => {
                    const active = p.chip === activePresetLabel;
                    return (
                      <button
                        key={p.chip}
                        type="button"
                        onClick={() => applyPreset(p.min, p.max)}
                        aria-pressed={active}
                        className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                          active
                            ? "border-indigo-500 bg-indigo-500 text-white"
                            : "border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-indigo-950/50"
                        }`}
                      >
                        {p.chip}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {searchTarget && (
          <AccountLocator
            key={`${searchTarget}-${searchNonce}-${coinType}-${balanceType}`}
            account={searchTarget}
            coinType={coinType}
            balanceType={balanceType}
            onLocated={(rank) => {
              handleJumpToRank(rank, searchTarget);
              setSearchTarget(null);
            }}
            onNotFound={(reason) => {
              setSearchErrorReason(reason);
              setSearchError(searchTarget);
              setFoundAccount(null);
              foundAccountRef.current = null;
              setSearchTarget(null);
              setIsFiltersVisible(true);
            }}
          />
        )}
        <FilterChipsBar
          sticky
          className="mt-2 bg-transparent pb-0"
          onExpand={() => setIsFiltersVisible(true)}
          isLoading={!!searchTarget}
          chips={[
            {
              key: "coin",
              label: t("activeFilters.coin", { value: currentUnitLabel }),
              onRemove:
                coinType === "HIVE"
                  ? undefined
                  : () => {
                      setCoinType("HIVE");
                      setMinBalance(undefined);
                      setMaxBalance(undefined);
                      setPage(1);
                    },
            },
            {
              key: "balance",
              label: balanceLabel,
              onRemove:
                balanceType === "savings_balance"
                  ? () => {
                      setBalanceType("balance");
                      setPage(1);
                    }
                  : undefined,
            },
            ...(filterActive
              ? [{ key: "range", label: rangeLabel(), onRemove: clearFilter }]
              : []),
          ]}
        />
        <TopHoldersConcentrationStrip
          coinType={coinType}
          balanceType={balanceType}
          totalSupplyRaw={totalSupplyRaw}
          supplyDisplay={
            totalSupplyRaw !== null &&
            (coinType !== "VESTS" || unit !== "hp" || vestingRatios)
              ? rawToDisplay(totalSupplyRaw)
              : null
          }
          unitLabel={currentUnitLabel}
          baseRaw={circulatingBaseRaw}
        />

        <div className="flex justify-center w-full mt-4 ">
          <div
            className="flex w-full justify-center items-center flex-wrap bg-theme"
            data-testid="account-top-bar"
          >
            <div className="flex items-center justify-center w-full md:ms-auto md:w-3/4">
              <CustomPagination
                currentPage={page}
                onPageChange={setPage}
                pageSize={pageSize}
                totalCount={totalCount}
              />
            </div>
            <div className="flex items-center mt-2 md:ms-auto w-full md:w-auto justify-center md:justify-end mb-2">
              <JumpToPage
                currentPage={page}
                onPageChange={setPage}
                totalCount={totalCount ?? 1}
                pageSize={config.standardPaginationSize}
              />
            </div>
          </div>
        </div>

        <div className="table-toolbar w-full flex flex-wrap items-center gap-4">
          <div>
            <DataCountMessage
              count={totalCount}
              dataType={t("topHolders.DataType")}
            />
          </div>

          <TopHolderYouBadge
            coinType={coinType}
            balanceType={balanceType}
            onJump={() => {
              if (!username) return;
              setSearchError(null);
              setSearchTarget(username);
              setSearchNonce((n) => n + 1);
            }}
          />

          <div className="ms-auto flex items-center gap-x-4">
            {coinType === "VESTS" && (
              <SegmentedToggle
                ariaLabel={`${t("common.vests")} / ${t("common.hp")}`}
                size="md"
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "vests", label: t("common.vests") },
                  { value: "hp", label: t("common.hp") },
                ]}
              />
            )}
            <DataExport data={prepareExportData()} filename={exportFileName} />
          </div>
        </div>

        <Card className="w-full rounded">
          {isTopHoldersLoading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin mt-1 h-16 w-10 ms-10 dark:text-white" />
            </div>
          )}
          {!isTopHoldersLoading && isTopHoldersError && (
            <p className="text-sm text-center">
              <ErrorMessage message={isTopHoldersError.message} />
            </p>
          )}
          {!isTopHoldersLoading &&
            !isTopHoldersError &&
            holdersData.length === 0 && <NoResult />}
          {!isTopHoldersLoading &&
            !isTopHoldersError &&
            holdersData.length > 0 && (
              <Table
                className="w-full"
                enableMobileScrollArrows
                enableCompactToggle
              >
                <TableHeaderRow />
                <TableBody data-testid="table-body">
                  {holdersData.map((holder, index) => (
                    <HolderRow
                      key={holder.account}
                      rank={holder.rank}
                      account={holder.account}
                      value={holder.value}
                      index={index}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
        </Card>

        <div className="fixed bottom-[10px] end-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>

        <CompareSelectionBar selection={compareSelection} t={t} />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/top-holders",
        seoText("seo.topHolders.title"),
        seoText("seo.topHolders.description")
      ),
    },
  };
};
