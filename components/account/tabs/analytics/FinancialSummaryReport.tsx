import React, { useCallback, useEffect, useMemo, useState } from "react";
import EChart from "@/components/ui/EChart";
import { ChevronLeft, ChevronRight, Coins } from "lucide-react";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { getOpHexColor } from "@/utils/operationColors";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import { getVestsToHiveRatio } from "@/utils/Calculations";
import { spacesToUnderscores } from "@/utils/StringUtils";
import useFinancialSummary from "@/hooks/api/accountPage/useFinancialSummary";
import ReportSearchRanges from "./ReportSearchRanges";
import { BaseReportProps } from "./reportRegistry";
import { useRegisterReportExport } from "./reportExports";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";

type Currency = "hive" | "hbd" | "hp";
type Direction = "incoming" | "outgoing";
type Granularity = "day" | "week" | "month";

interface DataNode {
  name: string;
  value?: number;
  opCount?: number;
  children?: DataNode[];
  itemStyle?: { color?: string };
}

// Same op-type categorisation the OperationTypesDialog / balance-history use.
const OP_TYPE_TO_CATEGORY: Record<string, string> = {};
for (const cat of categorizedOperationTypes) {
  for (const type of cat.types) OP_TYPE_TO_CATEGORY[type] = cat.name;
}

// The claimed reward balance settles (moves to the wallet) the same tokens the
// itemised accrual ops — author/curation/benefactor — already reported when
// earned. Counting both double-counts the same value, so the claim roll-up is
// excluded from every aggregation (chart, totals, export).
const SETTLEMENT_OP_TYPES = new Set(["claim_reward_balance_operation"]);

// One asset per view — HIVE (liquid), HBD (liquid), HP (vesting). They are never
// summed together: mixing liquid HIVE with vesting HP is not a spendable figure.
function getRowValue(
  row: Hive.FinancialSummaryRow,
  currency: Currency,
  hpPerVest: number
): number {
  if (currency === "hbd") return row.hbd_nai / 1000;
  if (currency === "hp") return (row.vests_nai / 1e6) * hpPerVest;
  return row.hive_nai / 1000;
}

// 3 decimals like the operations table; sub-precision slivers show "<0.001".
function formatValue(
  value: number,
  currency: Currency,
  locale: string
): string {
  const unit = currency === "hbd" ? "HBD" : currency === "hp" ? "HP" : "HIVE";
  if (value > 0 && value < 0.001) return `<0.001 ${unit}`;
  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} ${unit}`;
}

function formatOpTypeName(opType: string): string {
  return opType
    .replace(/_operation$/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Lightens (amt > 0) / darkens (amt < 0) a #rrggbb colour.
function shadeColor(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  let r = parseInt(h.slice(0, 2), 16);
  let g = parseInt(h.slice(2, 4), 16);
  let b = parseInt(h.slice(4, 6), 16);
  if (amt >= 0) {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  } else {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  }
  const to = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

// Hierarchy: Category → Operation type → Period, for one direction.
function buildSunburstTree(
  rows: Hive.FinancialSummaryRow[],
  currency: Currency,
  hpPerVest: number,
  direction: Direction,
  rootName: string,
  granularity: Granularity,
  locale: string,
  otherLabel: string
): DataNode {
  const periodFmt = granularity === "month" ? "MMM YYYY" : "MMM D, YYYY";
  type Bucket = { value: number; opCount: number };
  const tree = new Map<string, Map<string, Map<string, Bucket>>>();

  for (const row of rows) {
    if (row.direction !== direction) continue;
    const opType = row.category;
    if (SETTLEMENT_OP_TYPES.has(opType)) continue;
    const catName = OP_TYPE_TO_CATEGORY[opType] ?? otherLabel;

    if (!tree.has(catName)) tree.set(catName, new Map());
    const opMap = tree.get(catName)!;
    if (!opMap.has(opType)) opMap.set(opType, new Map());
    const periodMap = opMap.get(opType)!;
    const prev = periodMap.get(row.period) ?? { value: 0, opCount: 0 };
    periodMap.set(row.period, {
      value: prev.value + getRowValue(row, currency, hpPerVest),
      opCount: prev.opCount + row.op_count,
    });
  }

  const catNodes: DataNode[] = [];
  Array.from(tree.entries()).forEach(([catName, opMap]) => {
    const catColor = getOpHexColor(Array.from(opMap.keys())[0] ?? "Other");
    const opNodes: DataNode[] = [];
    Array.from(opMap.entries()).forEach(([opType, periodMap]) => {
      const opColor = getOpHexColor(opType);
      const periodNodes: DataNode[] = [];
      // Count ops across all periods, even zero-value ones in this currency.
      let opOpsAll = 0;
      Array.from(periodMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([period, bucket]) => {
          opOpsAll += bucket.opCount;
          if (bucket.value > 0)
            periodNodes.push({
              name: moment(period).locale(locale).format(periodFmt),
              value: bucket.value,
              opCount: bucket.opCount,
              itemStyle: { color: opColor },
            });
        });
      const opTotal = periodNodes.reduce((s, n) => s + (n.value ?? 0), 0);
      if (opTotal <= 0) return;
      opNodes.push({
        name: formatOpTypeName(opType),
        value: opTotal,
        opCount: opOpsAll,
        itemStyle: { color: opColor },
        children: periodNodes,
      });
    });
    const catTotal = opNodes.reduce((s, n) => s + (n.value ?? 0), 0);
    const catOps = opNodes.reduce((s, n) => s + (n.opCount ?? 0), 0);
    if (catTotal <= 0) return;
    catNodes.push({
      name: catName,
      value: catTotal,
      opCount: catOps,
      itemStyle: { color: catColor },
      children: opNodes.sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
    });
  });

  return {
    name: rootName,
    value: catNodes.reduce((s, n) => s + (n.value ?? 0), 0),
    opCount: catNodes.reduce((s, n) => s + (n.opCount ?? 0), 0),
    children: catNodes.sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
  };
}

// Emit the UTC calendar day (chain time), so the from_date/to_date the endpoint
// buckets on don't drift by a day for users in non-UTC timezones near midnight.
const toDayStr = (d?: Date | number) =>
  d ? moment.utc(d).format("YYYY-MM-DD") : undefined;

const FinancialSummaryReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({ accountName, widgetId, dynamicGlobalData, fillHeight = true }) => {
  const { t, dir, locale } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [range, setRange] = useState<{
    from?: Date | number;
    to?: Date | number;
  }>(() => ({
    from: moment.utc().subtract(30, "days").toDate(),
    to: moment.utc().toDate(),
  }));
  const [currency, setCurrency] = useState<Currency>("hive");
  const [direction, setDirection] = useState<Direction>("incoming");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [historyStack, setHistoryStack] = useState<DataNode[]>([]);

  const { data, isLoading, isError } = useFinancialSummary(
    accountName,
    toDayStr(range.from),
    toDayStr(range.to),
    granularity
  );

  // HP/VEST = reciprocal of getVestsToHiveRatio (VESTS-per-HIVE).
  const hpPerVest = useMemo(() => {
    const ratio = Number(
      getVestsToHiveRatio(dynamicGlobalData as Explorer.HeadBlockCardData)
    );
    return Number.isFinite(ratio) && ratio > 0 ? 1 / ratio : 0;
  }, [dynamicGlobalData]);

  // hpPerVest is 0 until chain props load; treat that as loading, not "no data".
  const hpPending = currency === "hp" && hpPerVest <= 0 && !!data?.length;

  const rootName = t("financialSummary.rootName");
  const otherLabel = t("financialSummary.otherCategory");
  const rootNode = useMemo(() => {
    if (!data?.length || hpPending) return null;
    return buildSunburstTree(
      data,
      currency,
      hpPerVest,
      direction,
      rootName,
      granularity,
      locale,
      otherLabel
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    currency,
    hpPerVest,
    direction,
    rootName,
    granularity,
    locale,
    otherLabel,
    hpPending,
  ]);

  // Reset the drill path whenever the underlying tree changes.
  useEffect(() => {
    setHistoryStack(rootNode ? [rootNode] : []);
  }, [rootNode]);

  const currentNode = historyStack[historyStack.length - 1] ?? null;

  // Functional updates keep the click handler stable across drills.
  const handleChartClick = useCallback(
    (params: { data?: { name?: string } }) => {
      const clicked = params.data?.name;
      if (!clicked) return;
      setHistoryStack((s) => {
        const current = s[s.length - 1];
        if (!current?.children) return s;
        const match = current.children.find((c) => c.name === clicked);
        if (!match?.children?.length) return s;
        return [...s, match];
      });
    },
    []
  );

  const handleBack = useCallback(
    () => setHistoryStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    []
  );
  const handleCrumb = useCallback(
    (index: number) => setHistoryStack((s) => s.slice(0, index + 1)),
    []
  );

  // CSV export: the full dataset (both directions), translated headers. Wait for
  // the vests→HP ratio so the HP column isn't exported as all-zeros.
  const exportDatasets = useMemo(() => {
    if (!data?.length || hpPerVest <= 0) return [];
    return [
      {
        name: t("financialSummary.exportCsv"),
        filename: `${spacesToUnderscores(
          t("financialSummary.widgetTitle")
        )}_${accountName}`,
        rows: data
          .filter((r) => !SETTLEMENT_OP_TYPES.has(r.category))
          .map((r) => ({
            [t("financialSummary.colPeriod")]: r.period,
            [t("financialSummary.colCategory")]:
              OP_TYPE_TO_CATEGORY[r.category] ?? otherLabel,
            [t("financialSummary.colOpType")]: formatOpTypeName(r.category),
            [t("financialSummary.colDirection")]: t(
              `financialSummary.${r.direction}`
            ),
            [t("financialSummary.colHive")]: Number(
              (r.hive_nai / 1000).toFixed(3)
            ),
            [t("financialSummary.colHbd")]: Number(
              (r.hbd_nai / 1000).toFixed(3)
            ),
            [t("financialSummary.colHp")]: Number(
              ((r.vests_nai / 1e6) * hpPerVest).toFixed(3)
            ),
            [t("financialSummary.colOps")]: r.op_count,
          })),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, accountName, hpPerVest, otherLabel, t]);
  useRegisterReportExport(widgetId, exportDatasets);

  const labelColor = isDark ? "#f1f5f9" : "#1e293b";
  const borderColor = isDark ? "#111827" : "#ffffff";
  const centerColor = isDark ? "#e5e7eb" : "#334155";

  const chartOption = useMemo(() => {
    if (!currentNode?.children?.length) return {};
    const depth = historyStack.length; // 1=groups, 2=sub-groups, 3=dates
    const shadow = isDark ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.85)";
    // Dates are the deepest, most numerous ring — keep their labels to the name.
    const showValue = depth < 3;

    // One ring: the node's immediate children; same-colour siblings get shaded.
    const bases = currentNode.children.map(
      (c) => c.itemStyle?.color ?? "#64748b"
    );
    const uniform = new Set(bases).size === 1;
    const ring = currentNode.children.map((c, i) => ({
      name: c.name,
      value: c.value,
      opCount: c.opCount,
      itemStyle: {
        color: uniform
          ? shadeColor(
              bases[i],
              (i / Math.max(1, currentNode.children!.length - 1)) * 0.55 - 0.1
            )
          : bases[i],
      },
    }));

    return {
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        textStyle: { color: labelColor, fontSize: 12 },
        formatter: (p: any) =>
          `<b>${p.name}</b><br/>${formatValue(p.value ?? 0, currency, locale)}` +
          ((p.data as DataNode)?.opCount != null
            ? `<br/><span style="opacity:.7">${(
                (p.data as DataNode).opCount ?? 0
              ).toLocaleString(locale)} ${t("financialSummary.ops")}</span>`
            : ""),
      },
      graphic: [
        {
          type: "text",
          left: "center",
          top: "center",
          silent: true,
          style: {
            text: `${currentNode.name}\n${formatValue(
              currentNode.value ?? 0,
              currency,
              locale
            )}`,
            textAlign: "center",
            fill: centerColor,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "600",
          },
        },
      ],
      series: [
        {
          type: "sunburst",
          data: ring,
          radius: ["45%", "98%"],
          center: ["50%", "50%"],
          nodeClick: false,
          sort: undefined,
          emphasis: { focus: "self" },
          itemStyle: { borderRadius: 6, borderWidth: 3, borderColor },
          label: {
            color: labelColor,
            rotate: "tangential",
            minAngle: 5,
            textShadowBlur: 4,
            textShadowColor: shadow,
            fontSize: 11,
            formatter: (p: any) =>
              showValue
                ? `${p.name}\n${formatValue(p.value ?? 0, currency, locale)}`
                : p.name,
          },
          animationDuration: 500,
        },
      ],
    };
  }, [
    currentNode,
    historyStack.length,
    currency,
    isDark,
    labelColor,
    borderColor,
    centerColor,
    locale,
    t,
  ]);

  const hasData = !isLoading && !isError && !!currentNode?.children?.length;

  return (
    <div className={fillHeight ? "flex h-full flex-col" : ""} dir={dir}>
      <div
        className={
          fillHeight
            ? "flex min-h-0 flex-1 flex-col gap-2 p-1"
            : "flex flex-col gap-2 p-1"
        }
      >
        {/* Controls */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="flex flex-col items-start gap-2">
            <ReportSearchRanges
              onApply={(from, to) => setRange({ from, to })}
              defaultRangeKey="30"
            />
            <SegmentedToggle<Granularity>
              value={granularity}
              onChange={setGranularity}
              size="md"
              ariaLabel={t("financialSummary.granularity")}
              options={[
                { value: "day", label: t("financialSummary.granDay") },
                { value: "week", label: t("financialSummary.granWeek") },
                { value: "month", label: t("financialSummary.granMonth") },
              ]}
            />
          </div>
          <div className="flex flex-col items-end gap-2">
            <SegmentedToggle<Direction>
              value={direction}
              onChange={setDirection}
              size="md"
              ariaLabel={t("financialSummary.direction")}
              options={[
                { value: "incoming", label: t("financialSummary.incoming") },
                { value: "outgoing", label: t("financialSummary.outgoing") },
              ]}
            />
            <SegmentedToggle<Currency>
              value={currency}
              onChange={setCurrency}
              size="md"
              ariaLabel={t("financialSummary.currency")}
              options={[
                { value: "hive", label: "HIVE" },
                { value: "hbd", label: "HBD" },
                { value: "hp", label: "HP" },
              ]}
            />
          </div>
        </div>

        {/* Breadcrumb */}
        {historyStack.length > 1 && (
          <div className="flex min-h-[22px] flex-wrap items-center gap-1 text-xs">
            <button
              onClick={handleBack}
              className="me-1 inline-flex items-center gap-0.5 font-medium text-link hover:underline"
            >
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              {t("financialSummary.back")}
            </button>
            {historyStack.map((node, i) => {
              const isLast = i === historyStack.length - 1;
              return (
                <span key={i} className="inline-flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-gray-400 rtl:rotate-180" />
                  )}
                  <button
                    disabled={isLast}
                    onClick={() => handleCrumb(i)}
                    className={
                      isLast
                        ? "font-semibold text-foreground"
                        : "text-link hover:underline"
                    }
                  >
                    {node.name}
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Chart / states */}
        {isLoading || hpPending ? (
          <div className="flex flex-1 items-center justify-center py-16 text-sm text-gray-500">
            {t("financialSummary.loading")}
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center py-16 text-sm text-red-500">
            {t("financialSummary.error")}
          </div>
        ) : !hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-gray-500">
            <Coins className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("financialSummary.noData")}</p>
          </div>
        ) : (
          <div
            className={
              fillHeight
                ? "flex min-h-0 flex-1 items-center justify-center"
                : "flex justify-center"
            }
          >
            {/* Cap the donut to a sensible size so it doesn't balloon to fill a
                tall tile, while never overflowing a short one (height-aware). */}
            <div
              className={
                fillHeight
                  ? "h-full w-full max-h-[440px] max-w-[440px]"
                  : "aspect-square w-full max-w-[420px]"
              }
            >
              <EChart
                option={chartOption}
                onEvents={{ click: handleChartClick }}
                onChartReady={(inst) => inst.resize()}
                style={{ height: "100%", width: "100%" }}
                notMerge
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummaryReport;
