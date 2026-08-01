import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";
import { Loader2, LayoutGrid, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import ReportSearchRanges from "./ReportSearchRanges";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useAccountCommunityActivity from "@/hooks/api/accountPage/useAccountCommunityActivity";
import {
  POST_COLOR,
  COMMENT_COLOR,
  groupCommunityActivity,
  rollupCommunities,
  communityStats,
  buildTreemap,
} from "@/utils/communityActivity";
import { BaseReportProps } from "./reportRegistry";
import { useRegisterReportExport } from "./reportExports";

type TopNKey = "5" | "10" | "15";

const TOP_N: Record<TopNKey, number> = { "5": 5, "10": 10, "15": 15 };

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
const esc = (v: unknown) => String(v).replace(/[&<>"']/g, (c) => ESCAPES[c]);

// Tile text: name, the count as the loud line, and the mix on tiles with room.
const TILE_RICH: Record<string, any> = {
  n: { fontSize: 11, fontWeight: 600, color: "#ffffff", lineHeight: 16 },
  v: { fontSize: 15, fontWeight: 700, color: "#ffffff", lineHeight: 19 },
  m: { fontSize: 10, color: "rgba(255,255,255,0.72)", lineHeight: 14 },
};

// A community's avatar rides in front of its name as a rich-text tile; the whole
// rich map is repeated per node because only the avatar URL differs.
const tileRichWithAvatar = (url: string, isRTL: boolean) => ({
  ...TILE_RICH,
  n: {
    ...TILE_RICH.n,
    verticalAlign: "middle",
    padding: isRTL ? [0, 4, 0, 0] : [0, 0, 0, 4],
  },
  av: {
    width: 14,
    height: 14,
    borderRadius: 3,
    verticalAlign: "middle",
    backgroundColor: { image: url },
  },
});

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
        <span className="ms-1 text-xs font-normal text-gray-500 dark:text-gray-400 tabular-nums">
          {sub}
        </span>
      )}
    </div>
  </div>
);

const CommunityActivityReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({ accountName, widgetId, fillHeight = true }) => {
  const { t, dir, locale } = useI18n();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";
  const isRTL = dir === "rtl";

  const [range, setRange] = useState<{ from?: string; to?: string }>(() => ({
    from: moment.utc().subtract(30, "days").format("YYYY-MM-DD"),
    to: moment.utc().format("YYYY-MM-DD"),
  }));
  const [topN, setTopN] = useState<TopNKey>("10");
  const [view, setView] = useState<"treemap" | "table">("treemap");
  const [sort, setSort] = useState<{
    key: "posts" | "comments" | "total";
    dir: "asc" | "desc";
  }>({ key: "total", dir: "desc" });

  const fromDate = range.from;
  const toDate = range.to;

  const {
    communityActivity,
    isCommunityActivityLoading,
    isCommunityActivityError,
  } = useAccountCommunityActivity(accountName, fromDate, toDate);

  const noCommunityLabel = t("communityActivity.noCommunity");
  const items = useMemo(
    () => groupCommunityActivity(communityActivity, noCommunityLabel),
    [communityActivity, noCommunityLabel]
  );
  const stats = useMemo(() => communityStats(items), [items]);

  const rolled = useMemo(
    () =>
      rollupCommunities(items, TOP_N[topN], (n) =>
        t("communityActivity.otherCommunities", { count: n })
      ),
    [items, topN, t]
  );
  const treemapNodes = useMemo(() => buildTreemap(rolled), [rolled]);

  // Table always lists every community (the full "see more" for the Other box).
  const tableRows = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => (a[sort.key] - b[sort.key]) * dir);
  }, [items, sort]);
  const toggleSort = (key: "posts" | "comments" | "total") =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" }
    );
  const sortArrow = (key: "posts" | "comments" | "total") =>
    sort.key === key ? (sort.dir === "desc" ? " ▼" : " ▲") : "";
  const ariaSort = (key: "posts" | "comments" | "total") =>
    sort.key === key
      ? sort.dir === "desc"
        ? ("descending" as const)
        : ("ascending" as const)
      : ("none" as const);

  const insight = useMemo(() => {
    if (stats.totalContent <= 0 || !stats.top) return null;
    const share = Math.round((stats.top.total / stats.totalContent) * 100);
    const postPct = Math.round((stats.totalPosts / stats.totalContent) * 100);
    const mix =
      postPct >= 60
        ? t("communityActivity.insightCreator", { pct: postPct })
        : postPct <= 40
          ? t("communityActivity.insightConversationalist", {
              pct: 100 - postPct,
            })
          : t("communityActivity.insightBalanced");
    return {
      top: t("communityActivity.insightTop", {
        community: stats.top.title,
        pct: share,
      }),
      mix,
    };
  }, [stats, t]);

  const exportDatasets = useMemo(() => {
    if (!items.length) return [];
    const rows = items.map((c) => ({
      [t("communityActivity.colCommunity")]: c.title,
      [t("communityActivity.colPosts")]: c.posts,
      [t("communityActivity.colComments")]: c.comments,
      [t("communityActivity.colTotal")]: c.total,
    }));
    return [
      {
        name: t("communityActivity.exportName"),
        filename: `${spacesToUnderscores(
          t("analyticsDashboard.communityActivityReportTitle")
        )}_${accountName}_${fromDate ?? "all"}_${toDate ?? "now"}`,
        rows,
      },
    ];
  }, [items, accountName, fromDate, toDate, t]);
  useRegisterReportExport(widgetId, exportDatasets);

  const textColor = isDark ? "#e5e7eb" : "#1f2937";
  const surface = isDark ? "#0f172a" : "#ffffff";
  // The vivid chart hues fall under 4.5:1 as text, so the table reads them off a
  // darkened (light theme) or lightened (dark theme) tier of the same hue.
  const postText = isDark ? "#818cf8" : "#4f46e5";
  const commentText = isDark ? "#2dd4bf" : "#0f766e";

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
  // Fill the box exactly: a floor taller than the container would overflow it and
  // raise scrollbars on a chart that has nothing to scroll to.
  const chartHeight = fillHeight ? Math.max(viewport.h, 220) : 340;

  // A rect's area is exactly its share of the canvas, so tile size is known before
  // layout: use it to pick how much each tile says, or whether it says anything.
  const chartData = useMemo(() => {
    const canvas =
      Math.max(viewport.w || 320, 240) * Math.max(chartHeight - 4, 1);
    const sum = treemapNodes.reduce((s, n) => s + n.value, 0) || 1;
    return treemapNodes.map((n) => {
      const area = (n.value / sum) * canvas;
      const avatar =
        n.kind === "community" && n.community
          ? getHiveAvatarUrl(n.community)
          : null;
      return {
        ...n,
        avatar,
        detail: area >= 7000,
        mix: t("communityActivity.mixLine", {
          posts: n.posts.toLocaleString(locale),
          comments: n.comments.toLocaleString(locale),
        }),
        ...(area < 2200
          ? { label: { show: false } }
          : avatar
            ? { label: { rich: tileRichWithAvatar(avatar, isRTL) } }
            : {}),
      };
    });
  }, [treemapNodes, viewport.w, chartHeight, isRTL, locale, t]);

  const option = useMemo(() => {
    const unitTotal = t("communityActivity.total");
    return {
      tooltip: {
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: isDark ? "#374151" : "#e5e7eb",
        textStyle: { color: textColor, fontSize: 12 },
        // The tooltip DOM defaults to nowrap, so long member lists escape the box.
        extraCssText: "max-width:280px;white-space:normal;",
        formatter: (p: any) => {
          const d = p?.data || {};
          if (!d.kind) return ""; // the chart's invisible root node
          const box = `max-width:260px;white-space:normal;overflow-wrap:anywhere;direction:${
            isRTL ? "rtl" : "ltr"
          };text-align:${isRTL ? "right" : "left"}`;
          const total = Number(d.value || 0).toLocaleString(locale);
          const pct = Math.max(0, Math.min(100, Number(d.postPct) || 0));
          // Same two hues the table uses for its Posts / Comments columns.
          const bar = `<div style="display:flex;height:4px;width:100%;margin-top:5px;border-radius:2px;overflow:hidden"><span style="width:${pct}%;background:${POST_COLOR}"></span><span style="flex:1;background:${COMMENT_COLOR}"></span></div>`;
          const line = `<div style="font-size:11px;opacity:.85">${total} ${esc(
            unitTotal
          )} · ${esc(d.mix)}</div>`;
          // Named community: avatar + title.
          if (d.kind === "community" && d.community) {
            return `<div style="${box}"><div style="display:flex;align-items:center;gap:8px"><img src="${esc(
              getHiveAvatarUrl(d.community)
            )}" alt="" style="width:26px;height:26px;border-radius:6px;object-fit:cover;flex:0 0 auto" /><div><div style="font-weight:600">${esc(
              d.name
            )}</div>${line}</div></div>${bar}</div>`;
          }
          // Other bucket: list the communities inside + a hint.
          if (d.kind === "other" && Array.isArray(d.members)) {
            const top = d.members
              .slice(0, 6)
              .map(
                (m: any) =>
                  `${esc(m.title)} <b>${Number(m.total).toLocaleString(locale)}</b>`
              )
              .join(" · ");
            const more =
              d.members.length > 6
                ? " · " +
                  t("communityActivity.othersMore", {
                    count: d.members.length - 6,
                  })
                : "";
            return `<div style="${box}"><div style="font-weight:600">${esc(
              d.name
            )}</div>${line}${bar}<div style="font-size:11px;margin-top:5px">${esc(
              t("communityActivity.othersIncludes")
            )}: ${top}${more}</div><div style="font-size:11px;margin-top:2px;opacity:.7">${esc(
              t("communityActivity.othersHint")
            )}</div></div>`;
          }
          return `<div style="${box}"><div style="font-weight:600">${esc(
            d.name
          )}</div>${line}${bar}</div>`;
        },
      },
      series: [
        {
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          animationDuration: 450,
          animationEasing: "cubicOut",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          label: {
            show: true,
            position: "inside",
            color: "#ffffff",
            overflow: "truncate",
            textBorderColor: "rgba(0,0,0,0.35)",
            textBorderWidth: 2,
            lineHeight: 15,
            formatter: (p: any) => {
              const d = p.data || {};
              if (!d.kind) return ""; // the chart's invisible root node
              const value = Number(d.value || 0).toLocaleString(locale);
              const head = d.avatar ? `{av|}{n|${p.name}}` : `{n|${p.name}}`;
              return d.detail
                ? `${head}\n{v|${value}}\n{m|${d.mix}}`
                : `${head}\n{v|${value}}`;
            },
            rich: TILE_RICH,
          },
          itemStyle: {
            borderColor: surface,
            borderWidth: 0,
            gapWidth: 3,
            borderRadius: 6,
          },
          emphasis: {
            itemStyle: { borderColor: surface, borderWidth: 2 },
          },
          data: chartData,
        },
      ],
    };
  }, [chartData, textColor, surface, isDark, isRTL, locale, t]);

  const onEvents = useMemo(
    () => ({
      click: (params: any) => {
        const d = params?.data || {};
        if (d.kind === "other") {
          setView("table");
          return;
        }
        if (
          typeof d.community === "string" &&
          d.community.startsWith("hive-")
        ) {
          router.push(`/@${d.community}`);
        }
      },
    }),
    [router]
  );

  useEffect(() => {
    chartRef.current?.getEchartsInstance()?.resize();
  }, [chartHeight, viewport.w, view]);

  const noData = !isCommunityActivityLoading && stats.totalContent === 0;
  const showChrome =
    !isCommunityActivityLoading &&
    !isCommunityActivityError &&
    stats.totalContent > 0;
  const rolledCount = rolled.filter((c) => c.kind === "other").length
    ? items.filter((c) => c.kind === "community").length
    : 0;

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
        <SegmentedToggle<"treemap" | "table">
          value={view}
          onChange={setView}
          ariaLabel={t("communityActivity.viewLabel")}
          size="md"
          options={[
            { value: "treemap", label: t("communityActivity.viewTreemap") },
            { value: "table", label: t("communityActivity.viewTable") },
          ]}
        />
      </div>

      {/* Top-N only shapes the treemap; the table always lists every community. */}
      {view === "treemap" && (
        <div className="shrink-0 mt-2">
          <SegmentedToggle<TopNKey>
            value={topN}
            onChange={setTopN}
            ariaLabel={t("communityActivity.topLabel")}
            size="md"
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "15", label: "15" },
            ]}
          />
        </div>
      )}

      {showChrome && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 mt-2">
          <Kpi
            label={t("communityActivity.kpiTotalContent")}
            value={stats.totalContent.toLocaleString(locale)}
          />
          <Kpi
            label={t("communityActivity.kpiCommunities")}
            value={stats.communityCount.toLocaleString(locale)}
          />
          <Kpi
            label={t("communityActivity.kpiTopCommunity")}
            value={stats.top ? stats.top.title : "—"}
            sub={stats.top ? stats.top.total.toLocaleString(locale) : undefined}
          />
          <Kpi
            label={t("communityActivity.kpiSplit")}
            value={`${stats.totalPosts.toLocaleString(locale)} / ${stats.totalComments.toLocaleString(locale)}`}
          />
        </div>
      )}

      {showChrome && insight && (
        <div className="shrink-0 mt-2 flex items-start gap-1.5 rounded-md bg-indigo-50/60 dark:bg-indigo-500/10 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-300">
          <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
          <span>
            {insight.top} · {insight.mix}
          </span>
        </div>
      )}

      <div
        ref={viewportRef}
        className={cn(
          "mt-2",
          fillHeight && "flex-1 min-h-0",
          // Only the table scrolls; the treemap is sized to fit its box.
          fillHeight &&
            (view === "table"
              ? "overflow-y-auto overflow-x-hidden"
              : "overflow-hidden")
        )}
      >
        {isCommunityActivityLoading ? (
          <div className="flex items-center justify-center h-full min-h-[220px]">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isCommunityActivityError ? (
          <p className="text-red-500 text-sm py-8 text-center">
            {t("common.errorLoadingData")}
          </p>
        ) : noData ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full min-h-[220px] text-center text-gray-500">
            <LayoutGrid className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("communityActivity.emptyState")}</p>
          </div>
        ) : view === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th
                    scope="col"
                    className="text-start font-medium py-1.5 pe-2 sticky start-0 z-10 bg-theme border-e border-gray-200 dark:border-gray-700"
                  >
                    {t("communityActivity.colCommunity")}
                  </th>
                  {(["posts", "comments", "total"] as const).map((k) => (
                    <th
                      key={k}
                      scope="col"
                      aria-sort={ariaSort(k)}
                      className="font-medium py-1.5 px-2 whitespace-nowrap select-none"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(k)}
                        className="inline-flex items-center justify-end w-full gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                      >
                        {t(
                          `communityActivity.col${k[0].toUpperCase()}${k.slice(1)}`
                        )}
                        {sortArrow(k)}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((c) => {
                  const clickable = c.kind === "community" && !!c.community;
                  return (
                    <tr
                      key={c.community ?? c.title}
                      onClick={
                        clickable
                          ? () => router.push(`/@${c.community}`)
                          : undefined
                      }
                      className={cn(
                        "border-b border-gray-100 dark:border-gray-800",
                        clickable &&
                          "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      )}
                    >
                      <td className="py-1.5 pe-2 sticky start-0 z-10 bg-theme border-e border-gray-200 dark:border-gray-700">
                        <span className="inline-flex items-center gap-1.5">
                          {clickable ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getHiveAvatarUrl(c.community as string)}
                                alt=""
                                className="h-5 w-5 rounded object-cover shrink-0"
                              />
                              <Link
                                href={`/@${c.community}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-link whitespace-nowrap"
                              >
                                {c.title}
                              </Link>
                            </>
                          ) : (
                            <span className="whitespace-nowrap text-gray-500 dark:text-gray-400 italic">
                              {c.title}
                            </span>
                          )}
                        </span>
                      </td>
                      <td
                        className="text-end tabular-nums py-1.5 px-2"
                        style={{ color: postText }}
                      >
                        {c.posts ? c.posts.toLocaleString(locale) : "—"}
                      </td>
                      <td
                        className="text-end tabular-nums py-1.5 px-2"
                        style={{ color: commentText }}
                      >
                        {c.comments ? c.comments.toLocaleString(locale) : "—"}
                      </td>
                      <td className="text-end tabular-nums py-1.5 px-2 font-semibold">
                        {c.total.toLocaleString(locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-semibold">
                  <td className="py-1.5 pe-2 sticky start-0 z-10 bg-theme border-e border-gray-200 dark:border-gray-700">
                    {t("communityActivity.colTotal")}
                  </td>
                  <td
                    className="text-end tabular-nums py-1.5 px-2"
                    style={{ color: postText }}
                  >
                    {stats.totalPosts.toLocaleString(locale)}
                  </td>
                  <td
                    className="text-end tabular-nums py-1.5 px-2"
                    style={{ color: commentText }}
                  >
                    {stats.totalComments.toLocaleString(locale)}
                  </td>
                  <td className="text-end tabular-nums py-1.5 px-2">
                    {stats.totalContent.toLocaleString(locale)}
                  </td>
                </tr>
              </tfoot>
            </table>
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

      {showChrome && view === "treemap" && (
        <div className="shrink-0 mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {rolledCount > 0 && (
            <p>
              {t("communityActivity.rollupNote", {
                shown: Math.min(TOP_N[topN], rolledCount),
                total: rolledCount,
              })}
            </p>
          )}
          <span className="ms-auto flex items-center gap-3">
            {[
              { color: POST_COLOR, label: t("communityActivity.posts") },
              { color: COMMENT_COLOR, label: t("communityActivity.comments") },
            ].map((k) => (
              <span key={k.label} className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: k.color }}
                  aria-hidden="true"
                />
                {k.label}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
};

export default CommunityActivityReport;
