import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader2, Sparkles, Waypoints } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import ReportSearchRanges from "./ReportSearchRanges";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useAccountInteractions from "@/hooks/api/accountPage/useAccountInteractions";
import Hive from "@/types/Hive";
import {
  INTERACTION_TYPES,
  INTERACTION_TYPE_COLORS,
  groupInteractions,
  buildSankey,
  truncatedTypes,
} from "@/utils/socialInteractions";
import { BaseReportProps } from "./reportRegistry";
import { useRegisterReportExport } from "./reportExports";

type TopNKey = "5" | "10" | "15";

// SearchRanges block modes have no dates here → undefined (all-time).
const toDayStr = (v: Date | number | undefined): string | undefined =>
  v instanceof Date ? moment.utc(v).format("YYYY-MM-DD") : undefined;

// ECharts renders tooltip HTML raw, so escape every interpolated value.
const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const esc = (value: unknown) =>
  String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

// Tooltip card: avatar (via getHiveAvatarUrl) + @handle + subtitle.
const avatarCard = (account: string, subtitleHtml: string) =>
  `<div style="display:flex;align-items:center;gap:8px;max-width:260px">
    <img src="${esc(getHiveAvatarUrl(account))}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex:0 0 auto" />
    <div style="line-height:1.4">
      <div style="font-weight:600">@${esc(account)}</div>
      ${subtitleHtml}
    </div>
  </div>`;

const Kpi: React.FC<{ label: string; value: string; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-2.5 py-1.5">
    <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
      {value}
      {sub && (
        <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400 tabular-nums">
          {sub}
        </span>
      )}
    </div>
  </div>
);

const SocialInteractionsReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({ accountName, widgetId, fillHeight = true }) => {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  const [range, setRange] = useState<{ from?: string; to?: string }>(() => ({
    from: moment.utc().subtract(30, "days").format("YYYY-MM-DD"),
    to: moment.utc().format("YYYY-MM-DD"),
  }));
  const [topN, setTopN] = useState(10);
  const [view, setView] = useState<"flow" | "table">("flow");
  const [sort, setSort] = useState<{
    key: "total" | Hive.AccountInteractionType;
    dir: "asc" | "desc";
  }>({ key: "total", dir: "desc" });
  const [activeTypes, setActiveTypes] = useState<
    Set<Hive.AccountInteractionType>
  >(() => new Set(INTERACTION_TYPES));

  // Reset the type filter when switching accounts.
  useEffect(() => {
    setActiveTypes(new Set(INTERACTION_TYPES));
  }, [accountName]);

  const requestedFrom = range.from ?? null;

  const { interactions, isInteractionsLoading, isInteractionsError } =
    useAccountInteractions(accountName, range.from, range.to, topN);

  const groups = useMemo(
    () => groupInteractions(interactions, accountName),
    [interactions, accountName]
  );
  const totalInteractions = useMemo(
    () => groups.reduce((sum, g) => sum + g.total, 0),
    [groups]
  );

  const labels = useMemo(
    () => ({
      you: `@${accountName}`,
      others: t("socialInteractions.others"),
      typeLabel: (type: Hive.AccountInteractionType) =>
        t(`socialInteractions.type.${type}`),
    }),
    [accountName, t]
  );

  const sankey = useMemo(
    () => buildSankey(groups, labels, activeTypes, isRtl),
    [groups, labels, activeTypes, isRtl]
  );
  const truncated = useMemo(
    () => truncatedTypes(groups, requestedFrom),
    [groups, requestedFrom]
  );
  const emptyTruncated = useMemo(
    () => groups.filter((g) => g.emptyTruncated),
    [groups]
  );

  // Headline stats over the active types.
  const stats = useMemo(() => {
    const active = groups.filter((g) => g.hasData && activeTypes.has(g.type));
    const total = active.reduce((s, g) => s + g.total, 0);
    const partnerTotals = new Map<string, number>();
    let namedTotal = 0;
    active.forEach((g) =>
      g.partners.forEach((p) => {
        partnerTotals.set(
          p.account,
          (partnerTotals.get(p.account) ?? 0) + p.count
        );
        namedTotal += p.count;
      })
    );
    let topPartner: { account: string; count: number } | null = null;
    partnerTotals.forEach((count, account) => {
      if (!topPartner || count > topPartner.count)
        topPartner = { account, count };
    });
    const dominant = active.reduce<(typeof active)[number] | null>(
      (best, g) => (!best || g.total > best.total ? g : best),
      null
    );
    return {
      uniquePartners: partnerTotals.size,
      topPartner: topPartner as { account: string; count: number } | null,
      dominantType: dominant ? dominant.type : null,
      concentration: total > 0 ? namedTotal / total : 0,
    };
  }, [groups, activeTypes]);

  const toggleType = (type: Hive.AccountInteractionType) =>
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const exportDatasets = useMemo(() => {
    if (!interactions || !interactions.length) return [];
    // Export follows the legend filter so the CSV matches the chart.
    const rows = interactions
      .filter(
        (r) =>
          r.interaction_count > 0 &&
          r.partner !== accountName &&
          activeTypes.has(r.interaction_type)
      )
      .map((r) => ({
        [t("socialInteractions.expType")]: t(
          `socialInteractions.type.${r.interaction_type}`
        ),
        [t("socialInteractions.expPartner")]:
          r.partner ?? t("socialInteractions.others"),
        [t("socialInteractions.expCount")]: r.interaction_count,
        [t("socialInteractions.expAccounts")]: r.partner
          ? 1
          : r.partners_merged,
        [t("socialInteractions.expCoveredFrom")]: r.covered_from,
      }));
    return [
      {
        name: t("socialInteractions.exportName"),
        filename: `${spacesToUnderscores(
          t("analyticsDashboard.socialInteractionsReportTitle")
        )}_${accountName}_${range.from ?? "all"}_${range.to ?? "now"}`,
        rows,
      },
    ];
  }, [interactions, accountName, range.from, range.to, activeTypes, t]);
  useRegisterReportExport(widgetId, exportDatasets);

  // Bold the You + type columns. Keyed on role, not depth — RTL swaps depths.
  // The label spread must be merged: the You node carries a position in RTL.
  const seriesNodes = useMemo(
    () =>
      sankey.nodes.map((n) =>
        n.role === "partner"
          ? n
          : { ...n, label: { ...n.label, fontWeight: "bold" } }
      ),
    [sankey.nodes]
  );

  // Per-partner detail: total + each type's count.
  const partnerInfo = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        rows: { type: Hive.AccountInteractionType; count: number }[];
      }
    >();
    groups.forEach((g) => {
      if (!g.hasData || !activeTypes.has(g.type)) return;
      g.partners.forEach((p) => {
        const entry = map.get(p.account) ?? { total: 0, rows: [] };
        entry.total += p.count;
        entry.rows.push({ type: g.type, count: p.count });
        map.set(p.account, entry);
      });
    });
    map.forEach((v) => v.rows.sort((a, b) => b.count - a.count));
    return map;
  }, [groups, activeTypes]);

  const activeTotal = useMemo(
    () =>
      groups
        .filter((g) => g.hasData && activeTypes.has(g.type))
        .reduce((s, g) => s + g.total, 0),
    [groups, activeTypes]
  );

  // Others band: per-type count + merged-account total (partners_merged).
  const othersInfo = useMemo(() => {
    const rows = groups
      .filter((g) => g.hasData && activeTypes.has(g.type) && g.othersCount > 0)
      .map((g) => ({
        type: g.type,
        count: g.othersCount,
        accounts: g.othersAccounts,
      }))
      .sort((a, b) => b.count - a.count);
    return { rows, total: rows.reduce((s, r) => s + r.count, 0) };
  }, [groups, activeTypes]);

  // Plain-language read: dominant type, top partner, multi-type ties.
  const insight = useMemo(() => {
    if (activeTotal <= 0 || !stats.dominantType || !stats.topPartner) {
      return null;
    }
    const dom = groups.find((g) => g.type === stats.dominantType);
    let ties = 0;
    partnerInfo.forEach((v) => {
      if (v.rows.length >= 2) ties++;
    });
    return {
      type: t(`socialInteractions.type.${stats.dominantType}`),
      domPct: dom ? Math.round((dom.total / activeTotal) * 100) : 0,
      partner: stats.topPartner.account,
      share: Math.round((stats.topPartner.count / activeTotal) * 100),
      ties,
    };
  }, [groups, activeTotal, stats, partnerInfo, t]);

  // Table model: type columns, sortable partner rows.
  const tableColumns = useMemo(
    () =>
      groups
        .filter((g) => g.hasData && activeTypes.has(g.type))
        .map((g) => g.type),
    [groups, activeTypes]
  );
  // Fall back to Total when the sorted type is filtered out.
  const activeSort = useMemo(
    () =>
      sort.key !== "total" && !tableColumns.includes(sort.key)
        ? { key: "total" as const, dir: sort.dir }
        : sort,
    [sort, tableColumns]
  );
  const tableRows = useMemo(() => {
    const rows = Array.from(partnerInfo.entries()).map(([account, v]) => {
      const perType: Partial<Record<Hive.AccountInteractionType, number>> = {};
      v.rows.forEach((r) => {
        perType[r.type] = r.count;
      });
      return { account, perType, total: v.total, multi: v.rows.length >= 2 };
    });
    const dir = activeSort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const av =
        activeSort.key === "total" ? a.total : (a.perType[activeSort.key] ?? 0);
      const bv =
        activeSort.key === "total" ? b.total : (b.perType[activeSort.key] ?? 0);
      return (av - bv) * dir;
    });
    return rows;
  }, [partnerInfo, activeSort]);
  const othersByType = useMemo(() => {
    const m: Partial<Record<Hive.AccountInteractionType, number>> = {};
    othersInfo.rows.forEach((r) => {
      m[r.type] = r.count;
    });
    return m;
  }, [othersInfo]);
  const toggleSort = (key: "total" | Hive.AccountInteractionType) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" }
    );
  const sortArrow = (key: "total" | Hive.AccountInteractionType) =>
    activeSort.key === key ? (activeSort.dir === "desc" ? " ▼" : " ▲") : "";
  const ariaSort = (key: "total" | Hive.AccountInteractionType) =>
    activeSort.key === key
      ? activeSort.dir === "desc"
        ? ("descending" as const)
        : ("ascending" as const)
      : ("none" as const);

  const textColor = isDark ? "#e5e7eb" : "#1f2937";
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor },
        formatter: (params: any) => {
          const int = t("socialInteractions.interactions");
          if (params.dataType === "node") {
            const name: string = params.name || "";
            if (name.startsWith("@")) {
              const account = name.slice(1);
              const info = partnerInfo.get(account);
              if (info) {
                const pct =
                  activeTotal > 0
                    ? Math.round((info.total / activeTotal) * 100)
                    : 0;
                const breakdown = info.rows
                  .map(
                    (r) =>
                      `${esc(labels.typeLabel(r.type))} <b>${r.count.toLocaleString()}</b>`
                  )
                  .join(" · ");
                return avatarCard(
                  account,
                  `<div style="font-size:11px;opacity:.85">${info.total.toLocaleString()} ${int} · ${pct}% ${t("socialInteractions.ofTotal")}</div>` +
                    `<div style="font-size:11px;margin-top:2px">${breakdown}</div>`
                );
              }
              // The account's own (You) node.
              return avatarCard(
                account,
                `<div style="font-size:11px;opacity:.85">${activeTotal.toLocaleString()} ${int} · ${stats.uniquePartners.toLocaleString()} ${t("socialInteractions.partners")}</div>`
              );
            }
            if (name === labels.others) {
              const breakdown = othersInfo.rows
                .map(
                  (r) =>
                    `${esc(labels.typeLabel(r.type))} <b>${r.count.toLocaleString()}</b> <span style="opacity:.55">${r.accounts.toLocaleString()} ${t("socialInteractions.accounts")}</span>`
                )
                .join(" · ");
              return `<div style="max-width:260px"><div style="font-weight:600">${esc(labels.others)}</div><div style="font-size:11px;opacity:.85">${othersInfo.total.toLocaleString()} ${int}</div><div style="font-size:11px;margin-top:2px">${breakdown}</div></div>`;
            }
            return `<b>${esc(name)}</b>`;
          }

          // Read the ribbon from its own metadata rather than source/target —
          // RTL reverses those, but the meaning of the edge doesn't change.
          const link = params.data;
          const count = Number(params.value).toLocaleString();
          const typeName = esc(labels.typeLabel(link.interactionType));
          if (link.isOthers) {
            return `${typeName} → ${esc(labels.others)}<br/>${count} ${int} · ${Number(
              link.othersAccounts
            ).toLocaleString()} ${t("socialInteractions.accounts")}`;
          }
          if (link.partner) {
            return avatarCard(
              link.partner,
              `<div style="font-size:11px;opacity:.85">${typeName} · <b>${count}</b> ${int}</div>`
            );
          }
          return `${esc(labels.you)} → ${typeName}<br/>${count} ${int}`;
        },
      },
      animationDuration: 800,
      animationEasing: "cubicOut",
      series: [
        {
          type: "sankey",
          data: seriesNodes,
          links: sankey.links,
          draggable: false,
          nodeAlign: "justify",
          nodeGap: 18,
          nodeWidth: 14,
          emphasis: { focus: "adjacency" },
          left: 8,
          right: 12,
          top: 12,
          bottom: 12,
          label: { color: textColor, fontSize: 12 },
          lineStyle: { color: "gradient", opacity: 0.5, curveness: 0.5 },
          itemStyle: { borderWidth: 0 },
        },
      ],
    }),
    [
      seriesNodes,
      sankey.links,
      textColor,
      isDark,
      t,
      partnerInfo,
      activeTotal,
      othersInfo,
      labels,
      stats.uniquePartners,
    ]
  );

  // Open the account page on node click. Guard dataType: an edge is named
  // "<src> > <tgt>", which also starts with "@".
  const onEvents = useMemo(
    () => ({
      click: (params: any) => {
        if (params?.dataType !== "node") return;
        const name: string =
          typeof params?.name === "string" ? params.name : "";
        if (name.startsWith("@")) router.push(`/${name}`);
      },
    }),
    [router]
  );

  // ECharts only auto-resizes on window resize; observe the viewport and resize
  // the instance when the widget resizes.
  const chartRef = useRef<ReactECharts>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () =>
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // Floor the height so a busy partner column doesn't overlap; the chart fills
  // taller widgets, otherwise it scrolls.
  const contentMinHeight = useMemo(() => {
    const partnerNodes = sankey.nodes.filter(
      (n) => n.role === "partner"
    ).length;
    const typeNodes = sankey.nodes.filter((n) => n.role === "type").length;
    return Math.min(1500, Math.max(360, partnerNodes * 30, typeNodes * 84));
  }, [sankey]);
  const chartHeight = fillHeight
    ? Math.max(viewport.h, contentMinHeight)
    : contentMinHeight;
  useEffect(() => {
    chartRef.current?.getEchartsInstance()?.resize();
  }, [chartHeight, viewport.w, view]);

  const noData = !isInteractionsLoading && totalInteractions === 0;
  const allFilteredOut =
    !noData && !isInteractionsLoading && sankey.links.length === 0;
  const showChrome =
    !isInteractionsLoading && !isInteractionsError && totalInteractions > 0;

  return (
    <div className={fillHeight ? "h-full flex flex-col" : "space-y-3"}>
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <ReportSearchRanges
          defaultRangeKey="30"
          presets={[
            { days: 0, key: "today" },
            { days: 30, key: "30" },
            { days: 90, key: "90" },
            { days: 365, key: "365" },
          ]}
          showAll
          onApply={(from, to) =>
            setRange({ from: toDayStr(from), to: toDayStr(to) })
          }
        />
        <SegmentedToggle<"flow" | "table">
          value={view}
          onChange={setView}
          ariaLabel={t("socialInteractions.viewLabel")}
          size="md"
          options={[
            { value: "flow", label: t("socialInteractions.viewFlow") },
            { value: "table", label: t("socialInteractions.viewTable") },
          ]}
        />
      </div>

      <div className="shrink-0 mt-2 flex items-center justify-between gap-2">
        <SegmentedToggle<TopNKey>
          value={String(topN) as TopNKey}
          onChange={(v) => setTopN(Number(v))}
          ariaLabel={t("socialInteractions.topNLabel")}
          size="md"
          options={[
            { value: "5", label: "5" },
            { value: "10", label: "10" },
            { value: "15", label: "15" },
          ]}
        />
        {activeTotal > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
              {activeTotal.toLocaleString()}
            </span>{" "}
            {t("socialInteractions.interactions")}
          </span>
        )}
      </div>

      {showChrome && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 mt-3">
          <Kpi
            label={t("socialInteractions.kpiUniquePartners")}
            value={stats.uniquePartners.toLocaleString()}
          />
          <Kpi
            label={t("socialInteractions.kpiTopPartner")}
            value={stats.topPartner ? `@${stats.topPartner.account}` : "—"}
            sub={
              stats.topPartner
                ? stats.topPartner.count.toLocaleString()
                : undefined
            }
          />
          <Kpi
            label={t("socialInteractions.kpiDominantType")}
            value={
              stats.dominantType
                ? t(`socialInteractions.type.${stats.dominantType}`)
                : "—"
            }
          />
          <Kpi
            label={t("socialInteractions.kpiConcentration", { n: topN })}
            value={`${Math.round(stats.concentration * 100)}%`}
          />
        </div>
      )}

      {showChrome && insight && (
        <div className="shrink-0 mt-3 flex items-start gap-1.5 rounded-md bg-indigo-50/60 dark:bg-indigo-500/10 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
          <span>
            {t("socialInteractions.insightMostly", {
              type: insight.type,
              pct: insight.domPct,
            })}
            {" · "}
            {t("socialInteractions.insightTopPartner", {
              partner: insight.partner,
              share: insight.share,
            })}
            {insight.ties > 0 && (
              <>
                {" · "}
                {t("socialInteractions.insightTies", { count: insight.ties })}
              </>
            )}
          </span>
        </div>
      )}

      {showChrome && (
        <div className="flex flex-wrap gap-1.5 shrink-0 mt-3">
          {INTERACTION_TYPES.map((type) => {
            const group = groups.find((g) => g.type === type)!;
            const color = INTERACTION_TYPE_COLORS[type];
            const disabled = !group.hasData;
            const on = activeTypes.has(type) && !disabled;
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() => !disabled && toggleType(type)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                  disabled
                    ? "cursor-not-allowed border-gray-200 dark:border-gray-700 opacity-40"
                    : on
                      ? "border-transparent text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                )}
                style={on ? { backgroundColor: color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color, opacity: on ? 1 : 0.6 }}
                />
                {t(`socialInteractions.type.${type}`)}
                <span className="tabular-nums opacity-80">
                  {group.total.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={viewportRef}
        className={cn(
          "mt-3",
          fillHeight ? "flex-1 min-h-0 overflow-y-auto pr-0.5" : ""
        )}
      >
        {isInteractionsLoading ? (
          <div className="flex items-center justify-center h-full min-h-[220px]">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isInteractionsError ? (
          <p className="text-red-500 text-sm py-8 text-center">
            {t("common.errorLoadingData")}
          </p>
        ) : noData ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[220px] text-center text-gray-500">
            <Waypoints className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("socialInteractions.emptyState")}</p>
          </div>
        ) : allFilteredOut ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[220px] text-center text-gray-500">
            <Waypoints className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("socialInteractions.selectTypeHint")}</p>
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th
                    scope="col"
                    className="text-start font-medium py-1.5 pe-2"
                  >
                    {t("socialInteractions.colPartner")}
                  </th>
                  {tableColumns.map((ty) => (
                    <th
                      key={ty}
                      scope="col"
                      aria-sort={ariaSort(ty)}
                      className="font-medium py-1.5 px-2 whitespace-nowrap select-none"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(ty)}
                        className="inline-flex items-center gap-1 justify-end w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: INTERACTION_TYPE_COLORS[ty],
                          }}
                        />
                        {t(`socialInteractions.type.${ty}`)}
                        {sortArrow(ty)}
                      </button>
                    </th>
                  ))}
                  <th
                    scope="col"
                    aria-sort={ariaSort("total")}
                    className="text-end font-medium py-1.5 ps-2 whitespace-nowrap select-none"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("total")}
                      className="inline-flex items-center justify-end w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                    >
                      {t("socialInteractions.colTotal")}
                      {sortArrow("total")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr
                    key={r.account}
                    onClick={() => router.push(`/@${r.account}`)}
                    className="border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  >
                    <td className="py-1.5 pe-2">
                      <span className="inline-flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getHiveAvatarUrl(r.account)}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                        {r.multi && (
                          <span
                            role="img"
                            className="text-indigo-500"
                            aria-label={t("socialInteractions.multiTypeBadge")}
                          >
                            ★
                          </span>
                        )}
                        {/* A real link so the row is reachable by keyboard;
                            the row click stays for mouse convenience. */}
                        <Link
                          href={`/@${r.account}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-link"
                        >
                          @{r.account}
                        </Link>
                      </span>
                    </td>
                    {tableColumns.map((ty) => (
                      <td
                        key={ty}
                        className="text-end tabular-nums py-1.5 px-2 text-gray-600 dark:text-gray-300"
                      >
                        {r.perType[ty] ? r.perType[ty]!.toLocaleString() : "—"}
                      </td>
                    ))}
                    <td className="text-end tabular-nums py-1.5 ps-2 font-semibold">
                      {r.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {othersInfo.total > 0 && (
                  <tr className="italic text-gray-500 dark:text-gray-400">
                    <td className="py-1.5 pe-2">
                      {t("socialInteractions.others")}
                    </td>
                    {tableColumns.map((ty) => (
                      <td
                        key={ty}
                        className="text-end tabular-nums py-1.5 px-2"
                      >
                        {othersByType[ty]
                          ? othersByType[ty]!.toLocaleString()
                          : "—"}
                      </td>
                    ))}
                    <td className="text-end tabular-nums py-1.5 ps-2 font-semibold">
                      {othersInfo.total.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {tableRows.some((r) => r.multi) && (
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                {t("socialInteractions.multiTieNote")}
              </p>
            )}
          </div>
        ) : (
          <ReactECharts
            ref={chartRef}
            option={option}
            onEvents={onEvents}
            style={{ height: `${chartHeight}px`, width: "100%" }}
            notMerge
            lazyUpdate={false}
          />
        )}
      </div>

      {(truncated.length > 0 || emptyTruncated.length > 0) && (
        <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 shrink-0 mt-2">
          {truncated.length > 0 && (
            <>
              {t("socialInteractions.coveredNote")}{" "}
              {truncated
                .map((x) =>
                  t("socialInteractions.coveredSince", {
                    type: t(`socialInteractions.type.${x.type}`),
                    date: moment.utc(x.coveredFrom).format("MMM D, YYYY"),
                  })
                )
                .join(" · ")}
              {emptyTruncated.length > 0 ? " · " : ""}
            </>
          )}
          {emptyTruncated.length > 0 &&
            emptyTruncated
              .map((g) =>
                t("socialInteractions.emptyInWindow", {
                  type: t(`socialInteractions.type.${g.type}`),
                })
              )
              .join(" · ")}
        </p>
      )}
    </div>
  );
};

export default SocialInteractionsReport;
