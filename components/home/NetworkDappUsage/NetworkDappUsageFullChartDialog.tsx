import React, { useMemo, useState, useEffect, useRef } from "react";
import moment from "moment";
import { Loader2, Download, X, Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchRanges from "../../searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useNetworkTopCustomJson from "@/hooks/api/homePage/useNetworkTopCustomJson";
import useCustomJsonAppRegistry from "@/hooks/api/homePage/useCustomJsonAppRegistry";
import useNetworkCustomJsonUsage from "@/hooks/api/homePage/useNetworkCustomJsonUsage";
import NetworkDappUsageDonut from "./NetworkDappUsageDonut";
import NetworkDappUsageLeaderboard from "./NetworkDappUsageLeaderboard";
import NetworkDappUsageTrendChart from "./NetworkDappUsageTrendChart";
import {
  CustomJsonMetric,
  buildCategorySlices,
  computeCustomJsonKpis,
  formatMetricValue,
  isColoredCategory,
  metricValue,
  rowLabelFor,
} from "./networkCustomJsonUtils";

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}> = ({ label, value, sub }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="mb-0.5 text-[11px] uppercase leading-none tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </div>
    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold leading-tight">
      {value}
    </div>
    {sub && <div className="mt-0.5 text-[10px] text-gray-400">{sub}</div>}
  </div>
);

type Breakdown = "id" | "app";
type Granularity = "day" | "week" | "month";
const PRESETS = [30, 90, 180] as const;
// API caps limit_count at 100; Top N then caps what's shown after category filter.
const FETCH_LIMIT = 100;

const ORDER_BY: Record<
  CustomJsonMetric,
  "op_count" | "op_bytes" | "rc_estimate"
> = { ops: "op_count", bytes: "op_bytes", rc: "rc_estimate" };

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkDappUsageFullChartDialog: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [metric, setMetric] = useState<CustomJsonMetric>("ops");
  const [breakdown, setBreakdown] = useState<Breakdown>("id");
  const [limitCount, setLimitCount] = useState<number>(25);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lookupInput, setLookupInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);

  // Pulse the trend title ~3 times (toggle on/off with a colour transition).
  const pulseTrend = () => {
    let n = 0;
    const tick = () => {
      setPulseOn((v) => !v);
      n += 1;
      if (n < 6) window.setTimeout(tick, 320);
      else setPulseOn(false);
    };
    tick();
  };
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

  const applyPreset = (days: number) => {
    const from = moment().subtract(days, "days").toDate();
    const now = moment().toDate();
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(days);
    setStartDate(from);
    setEndDate(now);
    setFromDate(from);
    setToDate(now);
    setGranularity(days >= 180 ? "month" : days >= 90 ? "week" : "day");
  };

  const activePreset = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const days = moment(toDate).diff(moment(fromDate), "days");
    return (PRESETS as readonly number[]).includes(days) ? days : null;
  }, [fromDate, toDate]);

  // Category order_by pinned so the metric toggle re-ranks client-side, no refetch.
  const {
    topCustomJson: categoryRows,
    isTopCustomJsonLoading: isCatLoading,
    isTopCustomJsonFetching: isCatFetching,
    isTopCustomJsonError: isCatError,
  } = useNetworkTopCustomJson(
    {
      from_date: fromDate,
      to_date: toDate,
      limit_count: 100,
      group_by: "category",
      order_by: "op_count",
    },
    isOpen,
    true
  );
  const {
    topCustomJson: memberRows,
    isTopCustomJsonLoading: isMembersLoading,
    isTopCustomJsonFetching: isMembersFetching,
    isTopCustomJsonError,
  } = useNetworkTopCustomJson(
    {
      from_date: fromDate,
      to_date: toDate,
      limit_count: FETCH_LIMIT,
      group_by: breakdown,
      order_by: ORDER_BY[metric],
    },
    isOpen,
    true
  );
  const { appRegistry } = useCustomJsonAppRegistry(isOpen);

  const categories = useMemo(() => categoryRows ?? [], [categoryRows]);
  const kpis = useMemo(
    () => computeCustomJsonKpis(categories, metric),
    [categories, metric]
  );
  const slices = useMemo(
    () =>
      buildCategorySlices(
        categories,
        metric,
        isDark,
        t("networkDappUsage.others")
      ),
    [categories, metric, isDark, t]
  );
  const legend = useMemo(() => {
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    return slices.map((s) => ({
      name: s.name,
      color: s.color,
      pct: (s.value / total) * 100,
    }));
  }, [slices]);

  const othersLabel = t("networkDappUsage.others");
  // Drilling the folded "Other" slice matches on non-palette membership, not the label.
  const filteredRows = useMemo(() => {
    const all = memberRows ?? [];
    let filtered = all;
    if (selectedCategory === othersLabel) {
      filtered = all.filter((r) => !isColoredCategory(r.category));
    } else if (selectedCategory) {
      filtered = all.filter((r) => r.category === selectedCategory);
    }
    return [...filtered].sort(
      (a, b) => metricValue(b, metric) - metricValue(a, metric)
    );
  }, [memberRows, selectedCategory, othersLabel, metric]);
  const rows = useMemo(
    () => filteredRows.slice(0, limitCount),
    [filteredRows, limitCount]
  );

  const tableRef = useRef<HTMLDivElement>(null);
  const trendRef = useRef<HTMLDivElement>(null);
  const handleTopNChange = (value: string) => {
    setLimitCount(Number(value));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Look up any json_id directly — reaches ids outside the top-N leaderboard.
  const runLookup = (raw: string) => {
    const id = raw.trim();
    if (!id) return;
    setLookupInput(id);
    setShowSuggestions(false);
    setBreakdown("id");
    const match = (memberRows ?? []).find((r) => r.json_id === id);
    setSelectedCategory(
      match
        ? isColoredCategory(match.category)
          ? match.category
          : t("networkDappUsage.others")
        : null
    );
    setSelectedId(id);
    pulseTrend();
    trendRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(lookupInput);
  };
  const clearDrill = () => {
    setSelectedCategory(null);
    setSelectedId(null);
    setLookupInput("");
    setShowSuggestions(false);
  };

  const effectiveId =
    breakdown === "id" ? (selectedId ?? rows[0]?.json_id ?? null) : null;
  const { customJsonUsage, isCustomJsonUsageLoading, isCustomJsonUsageError } =
    useNetworkCustomJsonUsage(
      isOpen ? effectiveId : null,
      fromDate,
      toDate,
      granularity,
      true
    );

  useEffect(() => {
    if (isOpen) {
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
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setStartDate,
    setEndDate,
  ]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);
  };

  const handleFilterClear = () => applyPreset(30);

  const selectCategory = (name: string) => {
    setSelectedCategory((cur) => (cur === name ? null : name));
    setSelectedId(null);
    setLookupInput("");
  };

  const breakdownOptions: { value: Breakdown; label: string }[] = [
    { value: "id", label: t("networkDappUsage.groupId") },
    { value: "app", label: t("networkDappUsage.groupApp") },
  ];
  const metricOptions: { value: CustomJsonMetric; label: string }[] = [
    { value: "ops", label: t("networkDappUsage.metricOps") },
    { value: "bytes", label: t("networkDappUsage.metricBytes") },
    { value: "rc", label: t("networkDappUsage.metricRc") },
  ];
  const presetOptions = PRESETS.map((d) => ({
    value: String(d),
    label: t(`networkDappUsage.d${d}`),
  }));
  const topNOptions = [10, 25, 50, 100].map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const granularityOptions: { value: Granularity; label: string }[] = [
    { value: "day", label: t("common.daily") },
    { value: "week", label: t("common.weekly") },
    { value: "month", label: t("common.monthly") },
  ];

  const selectedRow = rows.find((r) => r.json_id === effectiveId);
  const trendName = selectedRow
    ? rowLabelFor(selectedRow, "id")
    : effectiveId || "";

  const exportData = useMemo(
    () =>
      rows.map((r, i) => ({
        [t("networkDappUsage.colRank")]: i + 1,
        [t("networkDappUsage.colId")]: r.json_id ?? "",
        [t("networkDappUsage.colApp")]: r.app_name ?? "",
        [t("networkDappUsage.colCategory")]: r.category ?? "",
        [t("networkDappUsage.metricOps")]: r.op_count,
        [t("networkDappUsage.metricBytes")]: r.op_bytes,
        [t("networkDappUsage.kpiRc")]: r.rc_estimate,
      })),
    [rows, t]
  );

  const lookupOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    (appRegistry ?? []).forEach((r) => {
      if (r.app_id_pattern && !seen.has(r.app_id_pattern)) {
        seen.add(r.app_id_pattern);
        opts.push({ value: r.app_id_pattern, label: r.app_name });
      }
    });
    (memberRows ?? []).forEach((r) => {
      if (r.json_id && !seen.has(r.json_id)) {
        seen.add(r.json_id);
        opts.push({ value: r.json_id, label: r.app_name ?? "" });
      }
    });
    return opts;
  }, [appRegistry, memberRows]);

  const suggestions = useMemo(() => {
    const q = lookupInput.trim().toLowerCase();
    if (!q) return lookupOptions;
    return lookupOptions.filter(
      (o) =>
        o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [lookupOptions, lookupInput]);

  const trendExportData = useMemo(
    () =>
      (customJsonUsage ?? []).map((r) => ({
        [t("common.date")]: r.period,
        [t("networkDappUsage.metricOps")]: r.op_count,
        [t("networkDappUsage.metricBytes")]: r.op_bytes,
        [t("networkDappUsage.kpiRc")]: r.rc_estimate,
      })),
    [customJsonUsage, t]
  );

  const isLoading = isCatLoading || isMembersLoading;
  const isError = isCatError || isTopCustomJsonError;
  const isUpdating = isCatFetching || isMembersFetching;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("networkDappUsageDialog.title")}
            subtitle={t("networkDappUsageDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.networkDappUsageName")
                )}.csv`}
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

          {/* Filters — granularity (left) + date range (matches other reports) */}
          <div className="report-filters mb-4">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex w-[150px] flex-col gap-y-2">
                <Label>{t("networkDappUsage.granularityLabel")}</Label>
                <Select
                  value={granularity}
                  onValueChange={(v) => setGranularity(v as Granularity)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {granularityOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex min-w-[260px] flex-1 flex-col gap-y-2">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    data-testid="apply-filters"
                    disabled={isSearchButtonDisabled || isUpdating}
                  >
                    {isUpdating && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    {isUpdating
                      ? t("networkDappUsage.searching")
                      : t("common.search")}
                  </Button>
                  <Button
                    onClick={handleFilterClear}
                    data-testid="clear-filters"
                  >
                    {t("common.clear")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* View toggles — all pills (matches the METRIC:/Top row pattern) */}
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("networkDappUsage.breakdownLabel")}:
              </span>
              <SegmentedToggle<Breakdown>
                options={breakdownOptions}
                value={breakdown}
                onChange={(v) => {
                  setBreakdown(v);
                  setSelectedId(null);
                }}
                ariaLabel={t("networkDappUsage.breakdownLabel")}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("networkDappUsage.metricLabel")}:
              </span>
              <SegmentedToggle<CustomJsonMetric>
                options={metricOptions}
                value={metric}
                onChange={setMetric}
                ariaLabel={t("networkDappUsage.metricLabel")}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("networkDappUsage.topN")}:
              </span>
              <SegmentedToggle
                options={topNOptions}
                value={String(limitCount)}
                onChange={handleTopNChange}
                ariaLabel={t("networkDappUsage.topN")}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("networkDappUsage.quickRange")}:
              </span>
              <SegmentedToggle
                options={presetOptions}
                value={activePreset ? String(activePreset) : ""}
                onChange={(v) => applyPreset(Number(v))}
                ariaLabel={t("networkDappUsage.quickRange")}
              />
            </div>
          </div>

          {isUpdating && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("networkDappUsage.updating")}
            </div>
          )}

          {kpis && !isLoading && !isError && (
            <div
              className={`mb-4 grid grid-cols-2 gap-2 transition-opacity sm:grid-cols-3 lg:grid-cols-5 ${
                isUpdating ? "opacity-50" : ""
              }`}
            >
              <KpiTile
                label={t("networkDappUsage.kpiTotalOps")}
                value={formatMetricValue(kpis.totalOps, "ops", locale)}
              />
              <KpiTile
                label={t("networkDappUsage.kpiPayload")}
                value={formatMetricValue(kpis.totalBytes, "bytes", locale)}
              />
              <KpiTile
                label={t("networkDappUsage.kpiRc")}
                value={formatMetricValue(kpis.totalRc, "rc", locale)}
              />
              <KpiTile
                label={t("networkDappUsage.kpiTopCategory")}
                value={kpis.topCategory ?? "—"}
                sub={t("networkDappUsage.shareOfActivity", {
                  pct: kpis.topCategoryShare.toLocaleString(locale, {
                    maximumFractionDigits: 1,
                  }),
                })}
              />
              <KpiTile
                label={t("networkDappUsage.kpiCategories")}
                value={kpis.categoryCount.toLocaleString(locale)}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin dark:text-white" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-amber-600 dark:text-amber-400">
              {t("networkDappUsage.loadTimeout")}
            </p>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              {t("networkDappUsage.emptyState")}
            </p>
          ) : (
            <>
              {/* Category overview ring + legend (click a category to drill in) */}
              <div className="mb-2 grid grid-cols-1 items-center gap-4 rounded-lg bg-explorer-extra-light-gray p-3 shadow-md md:grid-cols-[340px_1fr]">
                <div className="h-[320px]">
                  <NetworkDappUsageDonut
                    slices={slices}
                    metric={metric}
                    selectedName={selectedCategory}
                    onSelectSlice={selectCategory}
                  />
                </div>
                <div>
                  <p className="mb-2 px-1.5 text-[10px] uppercase tracking-widest text-gray-400">
                    {t("networkDappUsage.ringHint")}
                  </p>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                    {legend.map((it) => {
                      const isSel = it.name === selectedCategory;
                      return (
                        <button
                          key={it.name}
                          type="button"
                          onClick={() => selectCategory(it.name)}
                          className={`flex items-center gap-2 rounded px-1.5 py-1 text-left text-xs ${
                            isSel
                              ? "bg-black/5 dark:bg-white/10"
                              : "hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: it.color }}
                          />
                          <span
                            className={`flex-1 truncate ${
                              isSel
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {it.name}
                          </span>
                          <span className="tabular-nums text-gray-500 dark:text-gray-400">
                            {it.pct.toLocaleString(locale, {
                              maximumFractionDigits: 1,
                            })}
                            %
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drilled-in leaderboard */}
              <div
                ref={tableRef}
                className="mb-2 mt-4 flex flex-wrap items-center justify-between gap-2 scroll-mt-2"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {selectedCategory
                      ? t("networkDappUsage.membersOf", {
                          category: selectedCategory,
                        })
                      : t("networkDappUsage.allMembers")}
                  </h3>
                  {filteredRows.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("networkDappUsage.showingCount", {
                        shown: rows.length.toLocaleString(locale),
                        total: filteredRows.length.toLocaleString(locale),
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {breakdown === "id" && (
                    <form
                      onSubmit={handleLookup}
                      className="flex items-center gap-1"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={lookupInput}
                          onChange={(e) => {
                            setLookupInput(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() =>
                            window.setTimeout(
                              () => setShowSuggestions(false),
                              120
                            )
                          }
                          placeholder={t("networkDappUsage.lookupPlaceholder")}
                          aria-label={t("networkDappUsage.lookupLabel")}
                          className="h-7 w-44 rounded border border-gray-200 bg-theme px-2 text-xs outline-none focus:border-indigo-500 dark:border-gray-700"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                          <ul className="absolute right-0 top-full z-50 mt-1 max-h-60 w-56 overflow-auto rounded border border-gray-200 bg-theme py-1 shadow-lg dark:border-gray-700">
                            {suggestions.map((o) => (
                              <li key={o.value}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => runLookup(o.value)}
                                  className="flex w-full flex-col items-start px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                  <span className="text-xs font-medium text-gray-800 dark:text-gray-100">
                                    {o.value}
                                  </span>
                                  {o.label && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                      {o.label}
                                    </span>
                                  )}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="inline-flex h-7 items-center gap-1 rounded bg-indigo-500 px-2 text-xs font-medium text-white hover:bg-indigo-600"
                      >
                        <Search className="h-3 w-3" />
                        {t("networkDappUsage.lookupGo")}
                      </button>
                    </form>
                  )}
                  {(selectedCategory || selectedId) && (
                    <button
                      type="button"
                      onClick={clearDrill}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                      {t("networkDappUsage.showAll")}
                    </button>
                  )}
                </div>
              </div>

              {rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  {t("networkDappUsage.emptyState")}
                </p>
              ) : (
                <div className="max-h-[45vh] overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
                  <NetworkDappUsageLeaderboard
                    rows={rows}
                    metric={metric}
                    groupBy={breakdown}
                    registry={appRegistry}
                    selectedId={selectedId}
                    onSelectId={setSelectedId}
                  />
                </div>
              )}

              {/* Per-id time-series drill-down (granularity control lives in the
                  toggle row above) */}
              {breakdown === "id" && effectiveId && (
                <div
                  ref={trendRef}
                  className="mt-3 scroll-mt-2 rounded-lg bg-explorer-extra-light-gray p-2 shadow-md"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <h3
                      className={`text-[11px] font-semibold uppercase tracking-widest transition-colors duration-300 ${
                        pulseOn
                          ? "text-indigo-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {t("networkDappUsage.trendTitle", { id: trendName })}
                    </h3>
                    {customJsonUsage && customJsonUsage.length > 0 && (
                      <DataExport
                        data={trendExportData}
                        filename={`${spacesToUnderscores(
                          `${t("widgets.networkDappUsageName")}_${trendName}`
                        )}.csv`}
                        skipColumnSelection
                      >
                        <button
                          type="button"
                          title={t("common.export")}
                          className="report-export-btn"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("common.export")}
                        </button>
                      </DataExport>
                    )}
                  </div>
                  <div className="h-[300px]">
                    {isCustomJsonUsageLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : isCustomJsonUsageError ? (
                      <p className="flex h-full items-center justify-center px-6 text-center text-sm text-amber-600 dark:text-amber-400">
                        {t("networkDappUsage.trendTimeout")}
                      </p>
                    ) : customJsonUsage && customJsonUsage.length ? (
                      <NetworkDappUsageTrendChart
                        rows={customJsonUsage}
                        metric={metric}
                        granularity={granularity}
                      />
                    ) : (
                      <p className="pt-8 text-center text-sm text-gray-500">
                        {t("common.noDataAvailable")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] text-gray-400">
                {t("networkDappUsage.customJsonOnlyNote")}
              </p>
              <p className="mt-1 text-[11px] text-gray-400">
                {t("networkDappUsage.rcEstimateHint")}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkDappUsageFullChartDialog;
