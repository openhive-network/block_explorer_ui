import React, { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import { Loader2, Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import { formatCompact } from "@/utils/chartUtils";
import useOperationTypeStatistics from "@/hooks/api/homePage/useOperationTypeStatistics";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import { getOpHexColor, getOpColorClass } from "@/utils/operationColors";
import { cn } from "@/lib/utils";
import { getOperationTypeForDisplay } from "@/utils/UI";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";

// --- Shared types and helpers used by NetworkOpMixChart and NetworkOpMixFullChartDialog ---

export interface ProcessedOpMixPoint {
  date: string;
  total_transactions: number;
  total_operations: number;
  [opName: string]: number | string;
}

export interface OpMixData {
  points: ProcessedOpMixPoint[];
  topOps: string[];
  aggregateCounts: Record<string, number>;
  totalOps: number;
  totalTxs: number;
  otherOps: { name: string; count: number }[];
}

export function processOpMixData(
  raw: Hive.OperationTypeStatisticsResponse[],
  operationsTypes: Explorer.ExtendedOperationTypePattern[],
  topN = 10,
  includeVirtual = false,
  selectedOpTypeIds?: number[]
): OpMixData {
  const nameById = new Map<number, string>(
    operationsTypes.map((op) => [op.op_type_id, op.operation_name])
  );
  const virtualIds = new Set(
    operationsTypes.filter((op) => op.is_virtual).map((op) => op.op_type_id)
  );
  const selectedSet = selectedOpTypeIds?.length
    ? new Set(selectedOpTypeIds)
    : null;

  const totals = new Map<string, number>();
  for (const period of raw) {
    for (const op of period.operations) {
      if (!includeVirtual && virtualIds.has(op.op_type_id)) continue;
      if (selectedSet && !selectedSet.has(op.op_type_id)) continue;
      const name = nameById.get(op.op_type_id) ?? `op_${op.op_type_id}`;
      totals.set(name, (totals.get(name) ?? 0) + op.op_count);
    }
  }

  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  // When the user explicitly selected specific ops, show all of them — topN only applies to the "auto top" mode.
  const effectiveTopN = selectedSet ? ranked.length : topN;
  const topOps = ranked.slice(0, effectiveTopN).map(([name]) => name);

  const points: ProcessedOpMixPoint[] = raw.map((period) => {
    const point: ProcessedOpMixPoint = {
      date: new Date(period.date).toISOString().slice(0, 10),
      total_transactions: period.total_transactions,
      total_operations: period.total_operations,
    };
    let otherCount = 0;
    for (const op of period.operations) {
      if (!includeVirtual && virtualIds.has(op.op_type_id)) continue;
      if (selectedSet && !selectedSet.has(op.op_type_id)) continue;
      const name = nameById.get(op.op_type_id) ?? `op_${op.op_type_id}`;
      if (topOps.includes(name)) {
        point[name] = ((point[name] as number) ?? 0) + op.op_count;
      } else {
        otherCount += op.op_count;
      }
    }
    point["Other"] = otherCount;
    return point;
  });

  const aggregateCounts: Record<string, number> = {};
  for (const op of topOps) {
    aggregateCounts[op] = points.reduce(
      (s, p) => s + ((p[op] as number) ?? 0),
      0
    );
  }
  aggregateCounts["Other"] = points.reduce(
    (s, p) => s + ((p["Other"] as number) ?? 0),
    0
  );

  const otherOps = ranked
    .slice(effectiveTopN)
    .map(([name, count]) => ({ name, count }));

  return {
    points,
    topOps: [...topOps, "Other"],
    aggregateCounts,
    totalOps: raw.reduce((s, p) => s + p.total_operations, 0),
    totalTxs: raw.reduce((s, p) => s + p.total_transactions, 0),
    otherOps,
  };
}

// --- Card component ---

const NetworkOpMixFullChartDialog = dynamic(
  () => import("./NetworkOpMixFullChartDialog"),
  { ssr: false }
);

const NetworkOpMixCard: React.FC = () => {
  const { t, locale, dir } = useI18n();
  const isRTL = dir === "rtl";
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVirtual, setShowVirtual] = useState(false);
  const [hiddenOps, setHiddenOps] = useState<Set<string>>(new Set());

  const toggleOp = (opName: string) =>
    setHiddenOps((prev) => {
      const next = new Set(prev);
      next.has(opName) ? next.delete(opName) : next.add(opName);
      return next;
    });

  const fromDate = useMemo(() => moment().subtract(30, "days").toDate(), []);
  const toDate = useMemo(() => moment().subtract(1, "days").toDate(), []);

  const {
    operationTypeStatistics,
    isOperationTypeStatisticsLoading,
    isOperationTypeStatisticsError,
  } = useOperationTypeStatistics("daily", "asc", fromDate, toDate);
  const { operationsTypes } = useOperationsTypes();

  const mixData = useMemo(() => {
    if (!operationTypeStatistics?.length || !operationsTypes?.length)
      return null;
    return processOpMixData(
      operationTypeStatistics,
      operationsTypes,
      10,
      showVirtual
    );
  }, [operationTypeStatistics, operationsTypes, showVirtual]);

  const isDark = theme === "dark";
  const tooltipBg = isDark ? "#1e2533" : "#ffffff";
  const tooltipBorder = isDark ? "#2d3748" : "#e5e7eb";
  const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

  const compactOption = useMemo(() => {
    if (!mixData) return null;
    const { topOps, aggregateCounts } = mixData;
    const colorMap = Object.fromEntries(
      topOps.map((op) => [op, getOpHexColor(op)])
    );
    const visibleOps = topOps.filter((op) => !hiddenOps.has(op));
    const totalRaw =
      visibleOps.reduce((s, op) => s + (aggregateCounts[op] ?? 0), 0) || 1;
    return {
      animation: false,
      grid: { top: 0, right: 0, bottom: 0, left: 0, containLabel: false },
      xAxis: { type: "value", show: false, min: 0, max: 100, inverse: isRTL },
      yAxis: { type: "category", data: ["mix"], show: false },
      legend: { show: false },
      tooltip: {
        trigger: "item",
        appendToBody: true,
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: tooltipText, fontSize: 11 },
        formatter: (params: any) =>
          `<div style="direction:${isRTL ? "rtl" : "ltr"}"><b>${params.seriesName}</b>: ${formatCompact(aggregateCounts[params.seriesName] ?? 0, locale)}</div>`,
      },
      series: visibleOps.map((opName) => ({
        name: opName,
        type: "bar",
        stack: "total",
        barWidth: "100%",
        itemStyle: { color: colorMap[opName] },
        data: [((aggregateCounts[opName] ?? 0) / totalRaw) * 100],
      })),
    };
  }, [
    mixData,
    hiddenOps,
    tooltipBg,
    tooltipBorder,
    tooltipText,
    locale,
    isRTL,
  ]);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("networkOpMixCard.title")}
        actions={
          <>
            <button
              onClick={() => setShowVirtual((v) => !v)}
              aria-pressed={showVirtual}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm border font-medium transition-colors",
                showVirtual
                  ? "bg-indigo-500 border-indigo-500 text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              {showVirtual ? <Eye size={11} /> : <EyeOff size={11} />}
              {showVirtual
                ? t("networkOpMixCard.excludeVirtual")
                : t("networkOpMixCard.includeVirtual")}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center leading-none text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t("common.fullChart")}
            </button>
          </>
        }
      />
      <div className="p-2.5">
        {/* KPI row — prominent numbers */}
        <div className="flex gap-4 mb-2.5">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">
              {t("networkOpMixCard.totalOperations")}
            </p>
            {isOperationTypeStatisticsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : mixData ? (
              <p className="text-lg font-bold leading-tight text-explorer-dark-gray dark:text-text">
                {formatCompact(mixData.totalOps, locale)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">
              {t("networkOpMixCard.totalTransactions")}
            </p>
            {isOperationTypeStatisticsLoading ? (
              <Loader2 className="animate-spin h-3 w-3 mt-1" />
            ) : mixData ? (
              <p className="text-lg font-bold leading-tight text-explorer-dark-gray dark:text-text">
                {formatCompact(mixData.totalTxs, locale)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>

        {/* Chart panel — bar + legend in a contained background */}
        <div className="bg-explorer-extra-light-gray rounded-lg shadow-sm p-2">
          {isOperationTypeStatisticsLoading ? (
            <div className="flex items-center justify-center h-9">
              <Loader2 className="animate-spin h-4 w-4" />
            </div>
          ) : isOperationTypeStatisticsError ? (
            <p className="text-red-500 text-[11px]">
              {t("common.errorLoadingData")}
            </p>
          ) : compactOption ? (
            <>
              <ReactECharts
                option={compactOption}
                style={{ width: "100%", height: "28px", display: "block" }}
                notMerge={true}
              />
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
                {mixData!.topOps.map((opName) => {
                  const hidden = hiddenOps.has(opName);
                  return (
                    <button
                      key={opName}
                      type="button"
                      onClick={() => toggleOp(opName)}
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] transition-opacity cursor-pointer",
                        hidden
                          ? "opacity-40 line-through text-gray-400 dark:text-gray-400"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block w-2 h-2 rounded-full flex-shrink-0",
                          getOpColorClass(opName)
                        )}
                      />
                      {opName === "Other"
                        ? "Other"
                        : getOperationTypeForDisplay(opName)}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-9 flex items-center justify-center text-gray-400 text-xs">
              {t("common.noDataAvailable")}
            </div>
          )}
        </div>
      </div>

      <NetworkOpMixFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkOpMixCard;
