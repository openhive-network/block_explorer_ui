import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import useOperationTypeStatistics from "@/hooks/api/homePage/useOperationTypeStatistics";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { processOpMixData, getOpHexColor } from "./NetworkOpMixCard";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import NetworkOpMixChart from "./NetworkOpMixChart";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { formatCompact, formatLocalePercent } from "@/utils/chartUtils";
import { getOperationTypeForDisplay } from "@/utils/UI";

interface NetworkOpMixFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChartType = "bar" | "area";

type DayBreakdown = {
  date: string;
  ops: { name: string; count: number }[];
};

const CATEGORY_VAR: Record<string, string> = {
  Posting: "posting",
  Curation: "curation",
  Transfer: "transfer",
  Market: "market",
  Vesting: "vesting",
  "Account management": "account-management",
  "Witness management": "witness-management",
  "Witness voting": "witness-voting",
  Proposals: "proposal",
  Custom: "custom",
  Other: "other",
};

function getCategoryHexColor(name: string): string {
  if (typeof window === "undefined") return "#6b7280";
  const suffix = CATEGORY_VAR[name];
  if (!suffix) return "#6b7280";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-operation-${suffix}`)
      .trim() || "#6b7280"
  );
}

const NetworkOpMixFullChartDialog: React.FC<
  NetworkOpMixFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t, locale } = useI18n();

  const [granularity, setGranularity] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [showVirtual, setShowVirtual] = useState(false);
  const [selectedOpTypes, setSelectedOpTypes] = useState<number[]>([]);
  const [normalized, setNormalized] = useState(false);
  const [topN, setTopN] = useState(10);
  const [dayBreakdown, setDayBreakdown] = useState<DayBreakdown | null>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    moment().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    moment().subtract(1, "days").toDate()
  );
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const searchRanges = useSearchRanges();
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  const {
    operationTypeStatistics,
    isOperationTypeStatisticsLoading,
    isOperationTypeStatisticsError,
  } = useOperationTypeStatistics(
    granularity,
    "asc",
    fromDate,
    toDate,
    undefined,
    isOpen
  );
  const { operationsTypes } = useOperationsTypes();

  const mixData = useMemo(() => {
    if (!operationTypeStatistics?.length || !operationsTypes?.length)
      return null;
    return processOpMixData(
      operationTypeStatistics,
      operationsTypes,
      topN,
      showVirtual,
      selectedOpTypes.length ? selectedOpTypes : undefined
    );
  }, [
    operationTypeStatistics,
    operationsTypes,
    topN,
    showVirtual,
    selectedOpTypes,
  ]);

  const kpis = useMemo(() => {
    if (!mixData) return null;
    const topOp = mixData.topOps[0];
    const topOpCount = topOp ? (mixData.aggregateCounts[topOp] ?? 0) : 0;
    const displayedTotal = mixData.topOps.reduce(
      (s, op) => s + (mixData.aggregateCounts[op] ?? 0),
      0
    );
    const topOpShare =
      displayedTotal > 0 ? (topOpCount / displayedTotal) * 100 : 0;
    return {
      totalOps: mixData.totalOps,
      totalTxs: mixData.totalTxs,
      topOp,
      topOpShare,
    };
  }, [mixData]);

  const groupedBreakdown = useMemo(() => {
    if (!dayBreakdown) return null;
    const opsByName = new Map(
      dayBreakdown.ops.map((op) => [op.name, op.count])
    );
    const dayTotal = dayBreakdown.ops.reduce((s, op) => s + op.count, 0) || 1;

    const assigned = new Set<string>();
    const groups: {
      category: string;
      total: number;
      pct: number;
      ops: { name: string; count: number }[];
    }[] = [];

    for (const cat of categorizedOperationTypes) {
      const catOps = cat.types
        .filter((typeName) => opsByName.has(typeName))
        .map((typeName) => ({
          name: typeName,
          count: opsByName.get(typeName)!,
        }))
        .sort((a, b) => b.count - a.count);
      if (catOps.length === 0) continue;
      catOps.forEach((o) => assigned.add(o.name));
      const total = catOps.reduce((s, o) => s + o.count, 0);
      groups.push({
        category: cat.name,
        total,
        pct: (total / dayTotal) * 100,
        ops: catOps,
      });
    }

    // Unrecognized ops → append to Other group or create one
    const unassigned = dayBreakdown.ops.filter((o) => !assigned.has(o.name));
    if (unassigned.length > 0) {
      const existing = groups.find((g) => g.category === "Other");
      if (existing) {
        existing.ops.push(...unassigned);
        existing.ops.sort((a, b) => b.count - a.count);
        existing.total += unassigned.reduce((s, o) => s + o.count, 0);
        existing.pct = (existing.total / dayTotal) * 100;
      } else {
        const total = unassigned.reduce((s, o) => s + o.count, 0);
        groups.push({
          category: "Other",
          total,
          pct: (total / dayTotal) * 100,
          ops: unassigned.sort((a, b) => b.count - a.count),
        });
      }
    }

    groups.sort((a, b) => b.total - a.total);
    const colorMap: Record<string, string> = {};
    for (const g of groups) {
      colorMap[g.category] = getCategoryHexColor(g.category);
      for (const { name } of g.ops) colorMap[name] = getOpHexColor(name);
    }
    return { groups, dayTotal, colorMap };
  }, [dayBreakdown]);

  // Clear day breakdown whenever data refreshes
  useEffect(() => {
    setDayBreakdown(null);
  }, [operationTypeStatistics]);

  useEffect(() => {
    if (isOpen) {
      setGranularity("daily");
      setChartType("bar");
      setShowVirtual(false);
      setSelectedOpTypes([]);
      setNormalized(false);
      setTopN(10);
      setDayBreakdown(null);
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setFromDate(moment().subtract(30, "days").toDate());
      setToDate(moment().subtract(1, "days").toDate());
    }
  }, [isOpen, setLastTimeUnitValue, setRangeSelectKey, setTimeUnitSelectKey]);

  useEffect(() => {
    if (selectedOpTypes.length > 0) setShowVirtual(true);
  }, [selectedOpTypes]);

  const hasOpFilter = selectedOpTypes.length > 0;

  const handleBarClick = useCallback(
    (dataIndex: number) => {
      if (!operationTypeStatistics || !operationsTypes) return;
      const period = operationTypeStatistics[dataIndex];
      if (!period) return;

      const nameById = new Map<number, string>(
        operationsTypes.map((op) => [op.op_type_id, op.operation_name])
      );
      const virtualIds = new Set(
        operationsTypes.filter((op) => op.is_virtual).map((op) => op.op_type_id)
      );

      const selectedSet = selectedOpTypes.length
        ? new Set(selectedOpTypes)
        : null;

      const ops = period.operations
        .filter((op) => showVirtual || !virtualIds.has(op.op_type_id))
        .filter((op) => !selectedSet || selectedSet.has(op.op_type_id))
        .map((op) => ({
          name: nameById.get(op.op_type_id) ?? `op_${op.op_type_id}`,
          count: op.op_count,
        }))
        .sort((a, b) => b.count - a.count);

      const fmt =
        granularity === "yearly"
          ? "YYYY"
          : granularity === "monthly"
            ? "MMM YYYY"
            : "MMM D, YYYY";

      setDayBreakdown({ date: moment(period.date).format(fmt), ops });
      setTimeout(
        () =>
          breakdownRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        60
      );
    },
    [
      operationTypeStatistics,
      operationsTypes,
      showVirtual,
      granularity,
      selectedOpTypes,
    ]
  );

  const handleGranularityChange = (value: "daily" | "monthly" | "yearly") => {
    setGranularity(value);
  };

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate((payloadFromBlock || payloadStartDate) as Date | undefined);
    setToDate((payloadToBlock || payloadEndDate) as Date | undefined);
  };

  const handleClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().subtract(1, "days").toDate());
    setGranularity("daily");
    setSelectedOpTypes([]);
  };

  const showYear = granularity === "yearly";
  const dateFormat = granularity === "monthly" ? "MMM YYYY" : "MMM D";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <DialogHeader>
            <div className="mb-3">
              <DialogTitle>{t("networkOpMixDialog.title")}</DialogTitle>
            </div>
          </DialogHeader>

          {/* Row 1 — main filter controls */}
          <div className="flex flex-wrap gap-3 mb-3 w-full items-start">
            <div className="flex flex-col gap-y-3 w-[140px]">
              <Label>{t("networkOpMixDialog.granularity")}</Label>
              <Select
                onValueChange={(v) =>
                  handleGranularityChange(v as "daily" | "monthly" | "yearly")
                }
                value={granularity}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("common.daily")}</SelectItem>
                  <SelectItem value="monthly">{t("common.monthly")}</SelectItem>
                  <SelectItem value="yearly">{t("common.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-y-3 w-[180px]">
              <Label>{t("networkOpMixDialog.filterOps")}</Label>
              <OperationTypesDialog
                operationTypes={operationsTypes}
                triggerTitle={
                  selectedOpTypes.length
                    ? `${selectedOpTypes.length} ${t("networkOpMixDialog.selected")}`
                    : t("networkOpMixDialog.allOps")
                }
                selectedOperations={selectedOpTypes}
                buttonClassName=""
                setSelectedOperations={(ids) => setSelectedOpTypes(ids ?? [])}
              />
            </div>

            <div className="flex flex-col gap-y-3 flex-1 min-w-[260px]">
              <Label>{t("common.filters")}</Label>
              <SearchRanges
                rangesProps={searchRanges}
                setIsSearchButtonDisabled={setIsSearchButtonDisabled}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={handleSearch}
                  disabled={isSearchButtonDisabled}
                >
                  {t("common.search")}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  {t("common.clear")}
                </Button>
              </div>
            </div>
          </div>

          {/* Row 2 — compact view controls */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {(["bar", "area"] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                  chartType === type
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {t(`networkOpMixDialog.${type}`)}
              </button>
            ))}

            <span className="text-gray-300 dark:text-gray-600 select-none mx-0.5">
              |
            </span>

            <button
              onClick={() => !hasOpFilter && setShowVirtual((v) => !v)}
              className={cn(
                "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                showVirtual
                  ? "bg-indigo-500 text-white"
                  : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                hasOpFilter && "opacity-50 cursor-not-allowed"
              )}
            >
              {showVirtual
                ? t("networkOpMixDialog.excludeVirtual")
                : t("networkOpMixDialog.includeVirtual")}
            </button>

            <span className="text-gray-300 dark:text-gray-600 select-none mx-0.5">
              |
            </span>

            {([false, true] as boolean[]).map((isNorm) => (
              <button
                key={String(isNorm)}
                onClick={() => setNormalized(isNorm)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                  normalized === isNorm
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {isNorm
                  ? t("networkOpMixDialog.percent")
                  : t("networkOpMixDialog.absolute")}
              </button>
            ))}

            <span className="text-gray-300 dark:text-gray-600 select-none mx-0.5">
              |
            </span>

            <span
              className={cn(
                "text-[11px] text-gray-400 dark:text-gray-500 select-none",
                hasOpFilter && "opacity-40"
              )}
            >
              {t("networkOpMixDialog.topN")}
            </span>
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                disabled={hasOpFilter}
                onClick={() => setTopN(n)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded font-medium transition-colors",
                  topN === n
                    ? "bg-indigo-500 text-white"
                    : "bg-explorer-extra-light-gray text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
                  hasOpFilter && "opacity-40 cursor-not-allowed"
                )}
              >
                {n}
              </button>
            ))}
          </div>

          {/* KPI strip */}
          {kpis && (
            <div className="flex items-center gap-5 mb-3 px-3 py-2 bg-explorer-extra-light-gray dark:bg-gray-800/50 rounded-lg">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {t("networkOpMixDialog.totalOps")}
                </span>
                <div className="text-sm font-bold leading-tight">
                  {formatCompact(kpis.totalOps, locale)}
                </div>
              </div>
              <div className="w-px self-stretch bg-border" />
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {t("networkOpMixDialog.totalTxs")}
                </span>
                <div className="text-sm font-bold leading-tight">
                  {formatCompact(kpis.totalTxs, locale)}
                </div>
              </div>
              <div className="w-px self-stretch bg-border" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {t("networkOpMixDialog.topOperation")}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-gray-400 dark:text-gray-500 cursor-default shrink-0" />
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px] text-xs"
                        >
                          {t("networkOpMixDialog.topOperationTooltip")}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm font-bold leading-tight">
                  {kpis.topOp ? getOperationTypeForDisplay(kpis.topOp) : "—"}
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5">
                    {formatLocalePercent(kpis.topOpShare, locale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div
            style={{ height: "420px", width: "100%" }}
            className="flex items-center justify-center"
          >
            {isOperationTypeStatisticsLoading ? (
              <Loader2 className="animate-spin h-16 w-10 dark:text-white" />
            ) : isOperationTypeStatisticsError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : mixData ? (
              <NetworkOpMixChart
                points={mixData.points}
                topOps={mixData.topOps}
                chartType={chartType}
                includeBrush={true}
                showYear={showYear}
                dateFormat={showYear ? undefined : dateFormat}
                normalized={normalized}
                onBarClick={handleBarClick}
              />
            ) : (
              <p className="text-gray-400 text-sm">
                {t("common.noDataAvailable")}
              </p>
            )}
          </div>

          {/* Click hint when no day is selected */}
          {mixData && !dayBreakdown && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
              {t("networkOpMixDialog.clickBarHint")}
            </p>
          )}

          {/* Day breakdown panel — appears on bar click */}
          {dayBreakdown && groupedBreakdown && (
            <div
              ref={breakdownRef}
              className="mt-3 overflow-hidden rounded-xl border border-explorer-light-gray shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="flex items-center justify-between px-4 py-2.5 text-sm font-medium border-b border-explorer-light-gray">
                <span>
                  {t("networkOpMixDialog.dayBreakdown")}
                  <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                    {dayBreakdown.date}
                  </span>
                  <span className="ml-3 text-xs font-normal text-gray-400">
                    {dayBreakdown.ops.length}{" "}
                    {t("networkOpMixDialog.operationsBucketed")}
                  </span>
                </span>
                <button
                  onClick={() => setDayBreakdown(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 pb-4 pt-3 max-h-80 overflow-y-auto scrollableContainer">
                {groupedBreakdown.groups.map((group) => (
                  <div key={group.category} className="mb-5 last:mb-0">
                    {/* Category header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            groupedBreakdown.colorMap[group.category],
                        }}
                      />
                      <span className="text-xs font-semibold">
                        {group.category}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-auto shrink-0">
                        {normalized
                          ? formatLocalePercent(group.pct, locale)
                          : formatCompact(group.total, locale)}
                      </span>
                    </div>
                    {/* Individual ops */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pl-3">
                      {group.ops.map(({ name, count }) => {
                        const pct = (count / groupedBreakdown.dayTotal) * 100;
                        return (
                          <div key={name} className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="inline-block w-2 h-2 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      groupedBreakdown.colorMap[name],
                                  }}
                                />
                                <span className="text-[11px] truncate text-gray-700 dark:text-gray-300">
                                  {getOperationTypeForDisplay(name)}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
                                {normalized
                                  ? formatLocalePercent(pct, locale)
                                  : formatCompact(count, locale)}
                              </span>
                            </div>
                            <div className="h-0.5 bg-explorer-light-gray dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(pct * (100 / (group.pct || 1)), 100)}%`,
                                  backgroundColor:
                                    groupedBreakdown.colorMap[name],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkOpMixFullChartDialog;
