import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Loader2,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SearchRanges from "../searchRanges/SearchRanges";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber } from "@/lib/utils";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useTheme } from "@/contexts/ThemeContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useNetworkTopAccounts from "@/hooks/api/homePage/useNetworkTopAccounts";
import Hive from "@/types/Hive";
import {
  TOP_ACCOUNTS_METRICS,
  formatMetricValue,
  metricUsesDate,
  metricIsVesting,
  makeConverters,
  getPrimaryValue,
  summaryKeyForMetric,
  TopAccountsConverters,
} from "./NetworkTopAccountsCard";
import { useVestingDisplayUnit, VestingDisplayUnit } from "./hpMomentumUtils";
import HiveAvatar from "@/components/ui/HiveAvatar";

const NetworkTopAccountsChart = dynamic(
  () => import("./NetworkTopAccountsChart"),
  { ssr: false }
);

// Bars shown in the chart (top slice); the table always shows every loaded row.
const CHART_ROWS = 15;

interface NetworkTopAccountsFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMetric?: Hive.TopAccountsMetric;
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

interface Column {
  key: string;
  // i18n key used for BOTH the table header and the CSV export header, so the
  // export and the column picker are translated and match what's on screen.
  labelKey: string;
  // Decimal places for the full-precision, locale-formatted CSV value.
  decimals: number;
  render: (
    row: Hive.TopAccountsResponse,
    conv: TopAccountsConverters | null,
    locale: string
  ) => string;
  exportValue: (
    row: Hive.TopAccountsResponse,
    conv: TopAccountsConverters | null
  ) => number;
  primary?: boolean;
}

// Columns shown after Rank/Account, adapted to the active metric. The primary
// column is the one the metric ranks by; the rest are contextual breakdowns.
// The vesting column follows the user's HP/VESTS unit preference.
const columnsForMetric = (
  metric: Hive.TopAccountsMetric,
  unit: VestingDisplayUnit
): Column[] => {
  const hp: Column = {
    key: "hp",
    labelKey:
      unit === "vests"
        ? "topAccountsCard.vestsColumn"
        : "topAccountsCard.hpColumn",
    decimals: unit === "vests" ? 6 : 3,
    primary: true,
    render: (row, conv, locale) =>
      unit === "vests"
        ? formatMetricValue(
            conv?.toVests(row.value_vests_nai) ?? 0,
            "VESTS",
            locale
          )
        : formatMetricValue(conv?.toHp(row.value_vests_nai) ?? 0, "HP", locale),
    exportValue: (row, conv) =>
      unit === "vests"
        ? (conv?.toVests(row.value_vests_nai) ?? 0)
        : (conv?.toHp(row.value_vests_nai) ?? 0),
  };
  const hive = (primary = false): Column => ({
    key: "hive",
    labelKey: "topAccountsCard.hiveColumn",
    decimals: 3,
    primary,
    render: (row, conv, locale) =>
      formatMetricValue(conv?.toHive(row.value_hive_nai) ?? 0, "HIVE", locale),
    exportValue: (row, conv) => conv?.toHive(row.value_hive_nai) ?? 0,
  });
  const hbd: Column = {
    key: "hbd",
    labelKey: "topAccountsCard.hbdColumn",
    decimals: 3,
    render: (row, conv, locale) =>
      formatMetricValue(conv?.toHbd(row.value_hbd_nai) ?? 0, "HBD", locale),
    exportValue: (row, conv) => conv?.toHbd(row.value_hbd_nai) ?? 0,
  };
  const ops = (primary = false): Column => ({
    key: "ops",
    labelKey: "topAccountsCard.opsColumn",
    decimals: 0,
    primary,
    render: (row, _conv, locale) =>
      formatMetricValue(row.op_count, "count", locale),
    exportValue: (row) => row.op_count,
  });

  switch (metric) {
    case "author_rewards":
    case "curation_rewards":
      return [hp, hbd, hive(), ops()];
    case "transfer_volume_in":
    case "transfer_volume_out":
      return [hive(true), hbd, ops()];
    case "hp_balance":
      return [hp];
    case "transaction_count":
    default:
      return [ops(true)];
  }
};

const NetworkTopAccountsFullChartDialog: React.FC<
  NetworkTopAccountsFullChartDialogProps
> = ({ isOpen, onClose, initialMetric = "author_rewards" }) => {
  const { t, locale } = useI18n();

  const [metric, setMetric] = useState<Hive.TopAccountsMetric>(initialMetric);
  const [limitCount, setLimitCount] = useState<number>(25);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "rank", direction: "asc" });
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment().toDate()
  );

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const usesDate = metricUsesDate(metric);
  const [unit, setUnit] = useVestingDisplayUnit();
  const showUnitToggle = metricIsVesting(metric);
  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const converters = useMemo(
    () => makeConverters(hiveChain, dynamicGlobalData),
    [hiveChain, dynamicGlobalData]
  );

  const { topAccounts, isTopAccountsLoading, isTopAccountsError } =
    useNetworkTopAccounts(
      metric,
      usesDate ? fromDate : undefined,
      usesDate ? toDate : undefined,
      limitCount,
      isOpen
    );

  useEffect(() => {
    if (isOpen) {
      setMetric(initialMetric);
      setLimitCount(25);
      setSortConfig({ key: "rank", direction: "asc" });
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();
      const now = moment().toDate();
      setFromDate(thirtyDaysAgo);
      setToDate(now);
      setStartDate(thirtyDaysAgo);
      setEndDate(now);
    }
  }, [
    isOpen,
    initialMetric,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setStartDate,
    setEndDate,
  ]);

  const handleSearch = async () => {
    const { payloadStartDate, payloadEndDate } =
      await searchRanges.getRangesValues();
    setFromDate(payloadStartDate);
    setToDate(payloadEndDate);
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().toDate());
  };

  const columns = useMemo(() => columnsForMetric(metric, unit), [metric, unit]);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#1e293b" : "#e5e7eb";

  // Vesting/transfer metrics need the wax converters (from dynamic global data).
  // transaction_count is a raw op count and needs nothing. Until ready we treat
  // the dialog as loading so it never flashes "0 HP" / all-zero rows.
  const valuesReady = metric === "transaction_count" || converters !== null;

  // Single conversion pass over the loaded rows. chart / share / summary all
  // derive from this instead of re-running the wax converters per row 4x.
  const primary = useMemo(
    () =>
      (topAccounts ?? []).map((row) => ({
        account: row.account,
        ...getPrimaryValue(row, metric, converters, unit),
      })),
    [topAccounts, metric, converters, unit]
  );

  const primaryUnit = primary[0]?.unit ?? "count";
  const total = useMemo(
    () => primary.reduce((sum, p) => sum + p.value, 0),
    [primary]
  );

  const chartData = useMemo(
    () =>
      primary
        .slice(0, CHART_ROWS)
        .map((p) => ({ account: p.account, value: p.value })),
    [primary]
  );
  const chartUnitLabel = primaryUnit === "count" ? "" : primaryUnit;

  const shareByAccount = useMemo(() => {
    const map = new Map<string, number>();
    primary.forEach((p) =>
      map.set(p.account, total > 0 ? (p.value / total) * 100 : 0)
    );
    return map;
  }, [primary, total]);

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  // Only Rank/Account are client-sortable — they reorder the shown rows without
  // changing the set. Value columns rank a server-truncated top-N, so sorting
  // them client-side would misrepresent the leaderboard. Ties break by rank.
  const sortedRows = useMemo(() => {
    const rows = [...(topAccounts ?? [])];
    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    return rows.sort((a, b) => {
      const cmp =
        key === "account"
          ? a.account.localeCompare(b.account, locale)
          : a.rank - b.rank;
      return cmp !== 0 ? cmp * dir : a.rank - b.rank;
    });
  }, [topAccounts, sortConfig, locale]);

  const sortIcon = (key: string) => {
    if (sortConfig.key !== key)
      return <ChevronsUpDown size={14} className="opacity-40 shrink-0" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} className="shrink-0" />
    ) : (
      <ChevronDown size={14} className="shrink-0" />
    );
  };

  const sortableHead = (key: string, label: string, className?: string) => (
    <TableHead
      key={key}
      className={className}
      aria-sort={
        sortConfig.key === key
          ? sortConfig.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => handleSort(key)}
        className="inline-flex items-center gap-1 font-medium hover:text-link transition-colors"
      >
        <span>{label}</span>
        {sortIcon(key)}
      </button>
    </TableHead>
  );

  const summaryText = useMemo(() => {
    if (!valuesReady || primary.length === 0) return null;
    // Share of total network HP only applies to the HP-balance stock metric.
    let pct: number | null = null;
    if (metric === "hp_balance" && converters && converters.networkHp > 0) {
      const combinedHp = (topAccounts ?? []).reduce(
        (sum, row) => sum + (converters.toHp(row.value_vests_nai) ?? 0),
        0
      );
      pct = (combinedHp / converters.networkHp) * 100;
    }
    let text = t(summaryKeyForMetric(metric), {
      count: primary.length,
      value: formatMetricValue(total, primaryUnit, locale),
    });
    if (pct !== null) {
      text += ` · ${t("topAccountsCard.ofNetwork", {
        pct: pct.toLocaleString(locale, { maximumFractionDigits: 1 }),
      })}`;
    }
    return text;
  }, [
    valuesReady,
    primary,
    total,
    primaryUnit,
    metric,
    converters,
    topAccounts,
    locale,
    t,
  ]);

  const fmtPct = (v: number) =>
    `${v.toLocaleString(locale, { maximumFractionDigits: 1 })}%`;

  // CSV export mirrors the table's columns for the active metric. Headers are
  // translated (same i18n keys as the table, so the column picker and CSV are
  // localized) and values are full-precision + locale-formatted. Empty until
  // conversions are ready so we never export all-zero rows.
  const exportData = useMemo(() => {
    if (!sortedRows.length || !valuesReady) return [];
    // Values are already-converted amounts, so skipPrecision=true just groups
    // and fixes the decimals (no re-scaling). VESTS keeps its 6-dp rounding.
    const fmt = (v: number, decimals: number) =>
      formatNumber(v, false, true, decimals);
    return sortedRows.map((row) => {
      const obj: Record<string, string | number> = {
        [t("topAccountsCard.rank")]: row.rank,
        [t("topAccountsCard.account")]: row.account,
      };
      columns.forEach((c) => {
        obj[t(c.labelKey)] = fmt(c.exportValue(row, converters), c.decimals);
      });
      obj[t("topAccountsCard.shareColumn")] = fmt(
        shareByAccount.get(row.account) ?? 0,
        2
      );
      return obj;
    });
  }, [sortedRows, valuesReady, columns, converters, shareByAccount, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("topAccountsCard.dialogTitle")}
            subtitle={t("topAccountsCard.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.topAccountsName")
                )}_${metric}.csv`}
                skipColumnSelection
              >
                <button
                  type="button"
                  title={t("common.export")}
                  className="report-export-btn"
                >
                  <Download className="h-4 w-4" />
                  {t("common.export")}
                </button>
              </DataExport>
            }
          />

          {/* Query filters */}
          <div className="report-filters mb-5">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex flex-col gap-y-3 w-[130px]">
                <Label>{t("topAccountsCard.rows")}</Label>
                <Select
                  value={String(limitCount)}
                  onValueChange={(v) => setLimitCount(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LIMIT_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {t("topAccountsCard.topN", { count: n })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {usesDate && (
                <div className="flex flex-col gap-y-3 flex-1 min-w-[260px]">
                  <Label>{t("common.dateRange")}</Label>
                  <SearchRanges
                    rangesProps={searchRanges}
                    setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={handleSearch}
                      data-testid="apply-filters"
                      disabled={isSearchButtonDisabled}
                    >
                      {t("common.search")}
                    </Button>
                    <Button
                      onClick={handleFilterClear}
                      data-testid="clear-filters"
                    >
                      {t("common.clear")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {TOP_ACCOUNTS_METRICS.map(({ key, labelKey }) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                  metric === key
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
            {showUnitToggle && (
              <SegmentedToggle
                className="ml-auto"
                ariaLabel="HP or VESTS"
                value={unit}
                onChange={setUnit}
                options={unitOptions.map((o) => ({
                  value: o.key,
                  label: o.label,
                }))}
              />
            )}
          </div>

          {/* Table */}
          {isTopAccountsLoading || !valuesReady ? (
            <div className="flex items-center justify-center h-[40vh]">
              <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
            </div>
          ) : isTopAccountsError ? (
            <p className="text-red-500 text-sm py-8 text-center">
              {t("common.errorLoadingData")}
            </p>
          ) : !topAccounts || topAccounts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              {t("common.noDataAvailable")}
            </p>
          ) : (
            <>
              {chartData.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {t("topAccountsCard.topN", { count: chartData.length })}
                  </p>
                  <div style={{ height: chartData.length * 28 + 20 }}>
                    <NetworkTopAccountsChart
                      data={chartData}
                      unitLabel={chartUnitLabel}
                      isDark={isDark}
                      textColor={textColor}
                      gridColor={gridColor}
                      locale={locale}
                    />
                  </div>
                </div>
              )}
              {summaryText && (
                <p className="text-sm text-gray-500 mb-2">{summaryText}</p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    {sortableHead("rank", t("topAccountsCard.rank"), "w-12")}
                    {sortableHead("account", t("topAccountsCard.account"))}
                    {columns.map((col) => (
                      <TableHead key={col.key} className="text-right">
                        {t(col.labelKey)}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">
                      {t("topAccountsCard.shareColumn")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={row.account}>
                      <TableCell className="text-gray-500">
                        {row.rank}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/@${row.account}`}
                          className="flex items-center gap-2 text-link"
                        >
                          <HiveAvatar
                            accountName={row.account}
                            size={28}
                            alt={row.account}
                            className="rounded-full"
                          />
                          <span className="truncate">{row.account}</span>
                        </Link>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          className={cn(
                            "text-right",
                            col.primary
                              ? "font-semibold text-explorer-dark-gray dark:text-text"
                              : "text-gray-500"
                          )}
                        >
                          {col.render(row, converters, locale)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-gray-500">
                        {fmtPct(shareByAccount.get(row.account) ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkTopAccountsFullChartDialog;
