import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useFinancialSummary from "@/hooks/api/accountPage/useFinancialSummary";
import { BaseReportProps } from "./reportRegistry";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import moment from "moment";

type Currency = "hive" | "hbd";
type Preset = "7d" | "30d" | "90d" | "1y";

interface DataNode {
  name: string;
  value?: number;
  opCount?: number;
  children?: DataNode[];
  itemStyle?: { color?: string };
}

const FINANCIAL_OP_CATEGORIES = [
  {
    name: "Posting",
    types: ["author_reward_operation", "comment_benefactor_reward_operation"],
  },
  {
    name: "Curation",
    types: ["curation_reward_operation", "claim_reward_balance_operation"],
  },
  {
    name: "Transfer",
    types: [
      "transfer_operation",
      "transfer_to_savings_operation",
      "transfer_from_savings_operation",
      "fill_transfer_from_savings_operation",
    ],
  },
  {
    name: "Market",
    types: [
      "interest_operation",
      "fill_order_operation",
      "liquidity_reward_operation",
    ],
  },
  {
    name: "Vesting",
    types: ["transfer_to_vesting_operation", "fill_vesting_withdraw_operation"],
  },
  { name: "Witness management", types: ["producer_reward_operation"] },
];

const OP_TYPE_TO_CATEGORY: Record<string, string> = {};
for (const cat of FINANCIAL_OP_CATEGORIES) {
  for (const t of cat.types) OP_TYPE_TO_CATEGORY[t] = cat.name;
}

// Maps API display names → canonical op type names (until API returns op type names directly)
const API_CATEGORY_TO_OP_TYPE: Record<string, string> = {
  "Author Reward": "author_reward_operation",
  "Comment Benefactor Reward": "comment_benefactor_reward_operation",
  "Curation Reward": "curation_reward_operation",
  "Claim Reward Balance": "claim_reward_balance_operation",
  Transfer: "transfer_operation",
  "Transfer to Savings": "transfer_to_savings_operation",
  "Transfer from Savings": "transfer_from_savings_operation",
  "Fill Transfer from Savings": "fill_transfer_from_savings_operation",
  Interest: "interest_operation",
  "Fill Order": "fill_order_operation",
  "Liquidity Reward": "liquidity_reward_operation",
  "Power Up": "transfer_to_vesting_operation",
  "Power Down": "fill_vesting_withdraw_operation",
  "Witness Reward": "producer_reward_operation",
};

const CANONICAL_CATEGORY_COLORS: Record<string, string> = {
  Posting: "#3b82f6",
  Curation: "#10b981",
  Transfer: "#8b5cf6",
  Market: "#ef4444",
  Vesting: "#14b8a6",
  "Witness management": "#f97316",
};
const FALLBACK_COLORS = ["#6366f1", "#ec4899", "#84cc16", "#0ea5e9", "#a855f7"];

const PRESET_DAYS: Record<Preset, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function computeDateRange(preset: Preset) {
  const to = moment().format("YYYY-MM-DD");
  const from = moment()
    .subtract(PRESET_DAYS[preset], "days")
    .format("YYYY-MM-DD");
  return { from, to };
}

function parseNaiAmount(raw: string): number {
  return parseFloat(raw.split(" ")[0]) || 0;
}

function computeHpPerVest(
  dynamicGlobalData: Explorer.HeadBlockCardData | undefined
): number {
  const d = dynamicGlobalData?.headBlockDetails;
  if (!d) return 0;
  const fund = parseNaiAmount(d.totalVestingFundHive);
  const shares = parseNaiAmount(d.totalVestingShares);
  return shares > 0 ? fund / shares : 0;
}

function getRowValue(
  row: Hive.FinancialSummaryRow,
  currency: Currency,
  hpPerVest: number
): number {
  if (currency === "hbd") return row.hbd_nai / 1000 + row.hive_nai / 1000;
  return (
    row.hive_nai / 1000 + row.hbd_nai / 1000 + (row.vests_nai / 1e6) * hpPerVest
  );
}

function formatValue(value: number, currency: Currency): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${currency === "hbd" ? "HBD" : "HIVE"}`;
}

function formatOpTypeName(opType: string): string {
  return opType
    .replace(/_operation$/, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatPeriod(period: string): string {
  return moment(period).format("MMM YYYY");
}

// Hierarchy: Canonical Category → Operation Type → Period
// API category display names are mapped to op types, then grouped by canonical category.
function buildSunburstTree(
  rows: Hive.FinancialSummaryRow[],
  currency: Currency,
  hpPerVest: number,
  from: string,
  to: string
): DataNode {
  type Bucket = { value: number; opCount: number };
  // canonical category → op type → period → bucket
  const tree = new Map<string, Map<string, Map<string, Bucket>>>();
  let fallbackIdx = 0;

  for (const row of rows.filter((r) => r.period >= from && r.period <= to)) {
    const opType = API_CATEGORY_TO_OP_TYPE[row.category] ?? row.category;
    const catName = OP_TYPE_TO_CATEGORY[opType] ?? "Other";

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
    const opNodes: DataNode[] = [];

    Array.from(opMap.entries()).forEach(([opType, periodMap]) => {
      const periodNodes: DataNode[] = [];
      Array.from(periodMap.entries()).forEach(([period, bucket]) => {
        if (bucket.value > 0)
          periodNodes.push({
            name: formatPeriod(period),
            value: bucket.value,
            opCount: bucket.opCount,
          });
      });
      const opTotal = periodNodes.reduce((s, n) => s + (n.value ?? 0), 0);
      const opOpCount = periodNodes.reduce((s, n) => s + (n.opCount ?? 0), 0);
      if (opTotal === 0) return;
      opNodes.push({
        name: formatOpTypeName(opType),
        value: opTotal,
        opCount: opOpCount,
        children: periodNodes,
      });
    });

    const catTotal = opNodes.reduce((s, n) => s + (n.value ?? 0), 0);
    const catOpCount = opNodes.reduce((s, n) => s + (n.opCount ?? 0), 0);
    if (catTotal === 0) return;
    catNodes.push({
      name: catName,
      value: catTotal,
      opCount: catOpCount,
      itemStyle: {
        color:
          CANONICAL_CATEGORY_COLORS[catName] ??
          FALLBACK_COLORS[fallbackIdx++ % FALLBACK_COLORS.length],
      },
      children: opNodes,
    });
  });

  const total = catNodes.reduce((s, n) => s + (n.value ?? 0), 0);
  const opTotal = catNodes.reduce((s, n) => s + (n.opCount ?? 0), 0);
  return {
    name: "Financial Activity",
    value: total,
    opCount: opTotal,
    children: catNodes,
  };
}

const FinancialSummaryReport: React.FC<BaseReportProps> = ({
  accountName,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [preset, setPreset] = useState<Preset>("30d");
  const [currency, setCurrency] = useState<Currency>("hive");
  const [historyStack, setHistoryStack] = useState<DataNode[]>([]);

  const { from, to } = useMemo(() => computeDateRange(preset), [preset]);
  const { data, isLoading, isError } = useFinancialSummary(
    accountName,
    from,
    to,
    "month"
  );

  const hpPerVest = useMemo(
    () =>
      computeHpPerVest(
        dynamicGlobalData as Explorer.HeadBlockCardData | undefined
      ),
    [dynamicGlobalData]
  );

  const rootNode = useMemo(() => {
    if (!data?.length) return null;
    return buildSunburstTree(data, currency, hpPerVest, from, to);
  }, [data, currency, hpPerVest, from, to]);

  useEffect(() => {
    if (rootNode) setHistoryStack([rootNode]);
  }, [rootNode]);

  const currentNode = historyStack[historyStack.length - 1] ?? null;

  // Functional update avoids stale closure — onEvents doesn't re-register on every render,
  // so capturing currentNode in deps would keep the old handler after each drill.
  const handleChartClick = useCallback(
    (params: { data?: { name?: string } }) => {
      const clickedName = params.data?.name;
      if (!clickedName) return;
      setHistoryStack((s) => {
        const current = s[s.length - 1];
        if (!current?.children) return s;
        // Clicking the centre circle (current node itself) collapses back
        if (clickedName === current.name)
          return s.length > 1 ? s.slice(0, -1) : s;
        const match = current.children.find((c) => c.name === clickedName);
        if (!match?.children?.length) return s;
        // Guard against duplicate entries (e.g. same name at multiple levels)
        if (s.some((n) => n.name === match.name && n === match)) return s;
        return [...s, match];
      });
    },
    []
  );

  const handleBack = useCallback(() => {
    setHistoryStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setHistoryStack((s) => s.slice(0, index + 1));
  }, []);

  const labelColor = isDark ? "#ffffff" : "#1e293b";
  const borderColor = isDark ? "#1e293b" : "#ffffff";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

  const chartOption = useMemo(() => {
    if (!currentNode) return {};

    const depth = historyStack.length; // 1=root, 2=in category, 3=in op
    const shadow = isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)";

    const fmtPrimary = (params: any) => {
      const val = formatValue(params.value ?? 0, currency);
      const ops = (params.data as DataNode)?.opCount;
      return `${params.name}\n${val}${ops != null ? `\n${ops} ops` : ""}`;
    };

    const fmtSecondary = (params: any) => {
      const ops = (params.data as DataNode)?.opCount;
      return ops != null ? `${params.name}\n${ops} ops` : params.name;
    };

    // Levels are depth-aware to prevent label collisions on outer rings:
    //   depth 1 (root): show categories only; hide ops and period labels
    //   depth 2 (category): show ops fully; show period labels for large segments
    //   depth 3 (op): show periods fully across the whole ring
    const levels =
      depth === 1
        ? [
            {},
            {
              r0: "15%",
              r: "42%",
              label: {
                fontSize: 11,
                fontWeight: "bold",
                rotate: "tangential",
                minAngle: 15,
                formatter: fmtPrimary,
              },
            },
            {
              r0: "42%",
              r: "68%",
              itemStyle: { colorSaturation: 0.75 },
              label: {
                show: true,
                fontSize: 8,
                rotate: "radial",
                minAngle: 30,
                formatter: (p: any) => p.name,
              },
            },
            {
              r0: "68%",
              r: "95%",
              itemStyle: { colorSaturation: 0.55 },
              label: { show: false },
            },
          ]
        : depth === 2
          ? [
              {},
              {
                r0: "15%",
                r: "48%",
                label: {
                  fontSize: 11,
                  fontWeight: "bold",
                  rotate: "tangential",
                  minAngle: 12,
                  formatter: fmtPrimary,
                },
              },
              {
                r0: "48%",
                r: "95%",
                itemStyle: { colorSaturation: 0.7 },
                label: {
                  fontSize: 9,
                  rotate: "radial",
                  minAngle: 20,
                  formatter: fmtSecondary,
                },
              },
            ]
          : [
              {},
              {
                r0: "15%",
                r: "95%",
                label: {
                  fontSize: 10,
                  rotate: "tangential",
                  minAngle: 10,
                  formatter: fmtPrimary,
                },
              },
            ];

    return {
      backgroundColor: "transparent",
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: isDark ? "#334155" : "#e2e8f0",
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params: any) =>
          `<b>${params.name}</b><br/>${formatValue(params.value ?? 0, currency)}` +
          ((params.data as DataNode)?.opCount != null
            ? `<br/><span style="opacity:0.7">${(params.data as DataNode).opCount} ops</span>`
            : ""),
      },
      series: [
        {
          type: "sunburst",
          data: [currentNode],
          radius: ["15%", "95%"],
          nodeClick: false,
          sort: undefined,
          itemStyle: { borderRadius: 8, borderWidth: 4, borderColor },
          label: {
            show: true,
            color: labelColor,
            textShadowBlur: 5,
            textShadowColor: shadow,
            fontSize: 10,
            minAngle: 12,
          },
          levels,
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
    tooltipBg,
    tooltipText,
  ]);

  const breakdownItems = currentNode?.children ?? [];
  const maxBreakdownValue = Math.max(
    ...breakdownItems.map((n) => n.value ?? 0),
    1
  );

  const PRESETS: Preset[] = ["7d", "30d", "90d", "1y"];
  const CURRENCIES: { key: Currency; label: string }[] = [
    { key: "hive", label: "HIVE" },
    { key: "hbd", label: "HBD" },
  ];

  const pillBase =
    "px-2 py-0.5 rounded text-xs border transition-colors cursor-pointer select-none";
  const pillActive =
    "bg-blue-100 dark:bg-blue-900/50 border-blue-500 text-blue-700 dark:text-blue-300";
  const pillIdle =
    "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:border-blue-400";

  return (
    <div className="flex flex-col h-full gap-2 p-1">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`${pillBase} ${preset === p ? pillActive : pillIdle}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {CURRENCIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrency(key)}
              className={`${pillBase} ${currency === key ? pillActive : pillIdle}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      {historyStack.length > 0 && (
        <div className="flex items-center gap-1 min-h-[22px]">
          {historyStack.length > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-0.5 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors mr-1"
            >
              <ChevronLeft className="h-3 w-3" />
              {t("financialSummary.back")}
            </button>
          )}
          {historyStack.map((node, i) => (
            <span key={i} className="flex items-center gap-1 text-xs">
              {i > 0 && <span>{">>"}</span>}
              <span
                className={
                  i === historyStack.length - 1
                    ? "text-foreground font-medium"
                    : "text-blue-500 dark:text-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                }
                onClick={() =>
                  i < historyStack.length - 1 && handleBreadcrumbClick(i)
                }
              >
                {node.name}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* States */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {t("financialSummary.loading")}
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center text-destructive text-sm">
          {t("financialSummary.error")}
        </div>
      )}
      {!isLoading && !isError && !currentNode?.children?.length && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          {t("financialSummary.noData")}
        </div>
      )}

      {/* Chart + breakdown */}
      {!isLoading && !isError && currentNode?.children?.length && (
        <div className="flex gap-3 flex-1 min-h-0">
          <div className="flex-1 min-w-0">
            <ReactECharts
              option={chartOption}
              onEvents={{ click: handleChartClick }}
              style={{ height: "100%", width: "100%", minHeight: 200 }}
              notMerge
            />
          </div>

          {/* Breakdown panel */}
          <div className="w-44 flex flex-col gap-2 overflow-y-auto py-1 shrink-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              {t("financialSummary.breakdown")}
            </div>

            {[...breakdownItems]
              .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
              .map((item, i) => {
                const pct = Math.round(
                  ((item.value ?? 0) / maxBreakdownValue) * 100
                );
                const color =
                  item.itemStyle?.color ??
                  FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                const canDrill = !!item.children?.length;
                return (
                  <div key={i} className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline gap-1">
                      <span
                        className={`text-[11px] font-medium truncate leading-tight ${canDrill ? "cursor-pointer" : ""}`}
                        style={{ color }}
                        onClick={() =>
                          canDrill && setHistoryStack((s) => [...s, item])
                        }
                        title={item.name}
                      >
                        ● {item.name}
                        {item.opCount != null && (
                          <span className="ml-1 font-normal opacity-60 text-[10px]">
                            ({item.opCount})
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatValue(item.value ?? 0, currency)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

            <div className="mt-auto pt-2 border-t border-border">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">
                  {t("financialSummary.total")}
                </span>
                <span className="text-foreground font-semibold">
                  {formatValue(currentNode.value ?? 0, currency)}
                </span>
              </div>
              {currentNode.opCount != null && (
                <div className="flex justify-between text-[10px] mt-0.5">
                  <span className="text-muted-foreground">Ops</span>
                  <span className="text-muted-foreground">
                    {currentNode.opCount}
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full text-xs"
            >
              {t("financialSummary.exportCsv")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummaryReport;
