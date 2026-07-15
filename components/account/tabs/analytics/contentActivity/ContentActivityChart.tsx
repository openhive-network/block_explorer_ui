import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import { formatCompact } from "@/utils/chartUtils";
import {
  FilledRow,
  RewardRow,
  Granularity,
  ActivityView,
  periodFormat,
  periodFormatLong,
} from "./contentActivityUtils";

// Client-only, like the other analytics charts (SSR-safe on the home dashboard).
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export const COLORS = {
  posts: "#6366f1",
  comments: "#14b8a6",
  replies: "#f59e0b",
  votesCast: "#8b5cf6",
  votesReceived: "#ec4899",
  hive: "#e11d48",
  hbd: "#10b981",
  hp: "#6366f1",
};

interface ContentActivityChartProps {
  rows: FilledRow[];
  rewardRows: RewardRow[];
  view: ActivityView;
  granularity: Granularity;
}

const barGradient = (color: string) => ({
  type: "linear",
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color },
    { offset: 1, color: `${color}99` },
  ],
});

const areaGradient = (color: string) => ({
  type: "linear",
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: `${color}55` },
    { offset: 1, color: `${color}05` },
  ],
});

const ContentActivityChart: React.FC<ContentActivityChartProps> = ({
  rows,
  rewardRows,
  view,
  granularity,
}) => {
  const { theme } = useTheme();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const isDark = theme === "dark";

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const axisLine = isDark ? "#374151" : "#e5e7eb";
  const splitLine = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const currentBand = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";

  const fmt = periodFormat(granularity);
  const fmtLong = periodFormatLong(granularity);

  const labels = useMemo(
    () => rows.map((r) => moment(r.period).format(fmt)),
    [rows, fmt]
  );
  const currentLabel = useMemo(() => {
    const idx = rows.findIndex((r) => r.isCurrent);
    return idx >= 0 ? labels[idx] : null;
  }, [rows, labels]);

  const withCurrentFade = (values: number[], base: string) =>
    values.map((value, i) => ({
      value,
      // Per-datum style (overrides the series one): gradient, faded if current.
      itemStyle: rows[i]?.isCurrent
        ? { color: base, opacity: 0.4 }
        : { color: barGradient(base) },
    }));

  const markAreaFor = () =>
    currentLabel
      ? {
          markArea: {
            silent: true,
            itemStyle: { color: currentBand },
            data: [
              [
                { xAxis: currentLabel, name: t("contentActivity.inProgress") },
                { xAxis: currentLabel },
              ],
            ],
          },
        }
      : {};

  const yAxisPosition = isRTL ? "right" : "left";

  const baseYAxis = (gridIndex: number, name: string) => ({
    type: "value" as const,
    gridIndex,
    name,
    nameTextStyle: { color: mutedColor, fontSize: 10, align: yAxisPosition },
    nameGap: 8,
    position: yAxisPosition,
    axisLabel: {
      color: mutedColor,
      fontSize: 10,
      formatter: (v: number) => formatCompact(v, locale),
    },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: splitLine } },
    minInterval: view === "rewards" ? undefined : 1,
  });

  const baseXAxis = (gridIndex: number, showLabel: boolean) => ({
    type: "category" as const,
    gridIndex,
    data: labels,
    inverse: isRTL,
    boundaryGap: true,
    axisLabel: {
      show: showLabel,
      color: mutedColor,
      fontSize: 10,
      hideOverlap: true,
    },
    axisLine: { lineStyle: { color: axisLine } },
    axisTick: { show: false },
  });

  const tooltip = {
    trigger: "axis" as const,
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    borderColor: axisLine,
    textStyle: { color: textColor, fontSize: 11 },
    formatter: (params: any[]) => {
      if (!params?.length) return "";
      const idx = params[0].dataIndex;
      const row = rows[idx];
      if (!row) return "";
      const header = moment(row.period).format(fmtLong);
      const inProgress = row.isCurrent
        ? ` · ${t("contentActivity.inProgress")}`
        : "";
      const lines = params
        .filter((p) => p.seriesType !== "custom")
        .map(
          (p) =>
            `<div style="display:flex;justify-content:space-between;gap:12px">${p.marker}${p.seriesName}<span style="font-weight:600">${Number(
              p.value?.value ?? p.value ?? 0
            ).toLocaleString(locale, {
              maximumFractionDigits: view === "rewards" ? 3 : 0,
            })}</span></div>`
        )
        .join("");
      return `<div style="font-size:11px"><div style="color:${mutedColor};margin-bottom:4px">${header}${inProgress}</div>${lines}</div>`;
    },
  };

  const dataZoom = [
    { type: "inside" as const, xAxisIndex: [0, 1] },
    {
      type: "slider" as const,
      xAxisIndex: [0, 1],
      height: 16,
      bottom: 6,
      borderColor: axisLine,
      fillerColor: isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)",
      handleStyle: { color: COLORS.posts },
      moveHandleStyle: { color: COLORS.posts },
      textStyle: { color: mutedColor, fontSize: 9 },
    },
  ];

  const option = useMemo<any>(() => {
    // Legend is HTML above the chart, so the grid only needs the y-axis name.
    const grid = [
      { left: 46, right: 16, top: 24, height: "34%" },
      { left: 46, right: 16, top: "62%", height: "24%" },
    ];

    if (view === "rewards") {
      return {
        color: [COLORS.hive, COLORS.hbd, COLORS.hp],
        tooltip,
        legend: { show: false },
        axisPointer: { link: [{ xAxisIndex: "all" }] },
        grid,
        xAxis: [baseXAxis(0, false), baseXAxis(1, true)],
        yAxis: [
          baseYAxis(0, t("contentActivity.liquidAxis")),
          baseYAxis(1, t("contentActivity.rewardHp")),
        ],
        dataZoom,
        series: [
          {
            name: t("contentActivity.rewardHive"),
            type: "bar",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: withCurrentFade(
              rewardRows.map((r) => r.hive),
              COLORS.hive
            ),
            itemStyle: {
              color: barGradient(COLORS.hive),
              borderRadius: [3, 3, 0, 0],
            },
            barMaxWidth: 22,
            ...markAreaFor(),
          },
          {
            name: t("contentActivity.rewardHbd"),
            type: "bar",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: withCurrentFade(
              rewardRows.map((r) => r.hbd),
              COLORS.hbd
            ),
            itemStyle: {
              color: barGradient(COLORS.hbd),
              borderRadius: [3, 3, 0, 0],
            },
            barMaxWidth: 22,
          },
          {
            name: t("contentActivity.rewardHp"),
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            showSymbol: false,
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: rewardRows.map((r) => r.hp),
            lineStyle: { color: COLORS.hp, width: 2 },
            itemStyle: { color: COLORS.hp },
            areaStyle: { color: areaGradient(COLORS.hp) },
            ...markAreaFor(),
          },
        ],
      };
    }

    return {
      color: [
        COLORS.posts,
        COLORS.comments,
        COLORS.replies,
        COLORS.votesCast,
        COLORS.votesReceived,
      ],
      tooltip,
      legend: { show: false },
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      grid,
      xAxis: [baseXAxis(0, false), baseXAxis(1, true)],
      yAxis: [
        baseYAxis(0, t("contentActivity.contentAxis")),
        baseYAxis(1, t("contentActivity.votesAxis")),
      ],
      dataZoom,
      series: [
        {
          name: t("contentActivity.posts"),
          type: "bar",
          stack: "content",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: withCurrentFade(
            rows.map((r) => r.posts),
            COLORS.posts
          ),
          itemStyle: { color: barGradient(COLORS.posts) },
          barMaxWidth: 26,
          ...markAreaFor(),
        },
        {
          name: t("contentActivity.comments"),
          type: "bar",
          stack: "content",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: withCurrentFade(
            rows.map((r) => r.comments),
            COLORS.comments
          ),
          itemStyle: {
            color: barGradient(COLORS.comments),
            borderRadius: [3, 3, 0, 0],
          },
          barMaxWidth: 26,
        },
        {
          name: t("contentActivity.repliesReceived"),
          type: "line",
          smooth: true,
          showSymbol: false,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: rows.map((r) => r.replies_received),
          lineStyle: { color: COLORS.replies, width: 2 },
          itemStyle: { color: COLORS.replies },
        },
        {
          name: t("contentActivity.votesCast"),
          type: "line",
          smooth: true,
          showSymbol: false,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: rows.map((r) => r.votes_cast),
          lineStyle: { color: COLORS.votesCast, width: 2 },
          itemStyle: { color: COLORS.votesCast },
          areaStyle: { color: areaGradient(COLORS.votesCast) },
          ...markAreaFor(),
        },
        {
          name: t("contentActivity.votesReceived"),
          type: "line",
          smooth: true,
          showSymbol: false,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: rows.map((r) => r.votes_received),
          lineStyle: { color: COLORS.votesReceived, width: 2 },
          itemStyle: { color: COLORS.votesReceived },
          areaStyle: { color: areaGradient(COLORS.votesReceived) },
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, rewardRows, view, granularity, theme, dir, locale, t]);

  // HTML legend — wraps with flexbox so it never overlaps the plot.
  const legendItems: { label: string; color: string; line: boolean }[] =
    view === "rewards"
      ? [
          {
            label: t("contentActivity.rewardHive"),
            color: COLORS.hive,
            line: false,
          },
          {
            label: t("contentActivity.rewardHbd"),
            color: COLORS.hbd,
            line: false,
          },
          {
            label: t("contentActivity.rewardHp"),
            color: COLORS.hp,
            line: true,
          },
        ]
      : [
          {
            label: t("contentActivity.posts"),
            color: COLORS.posts,
            line: false,
          },
          {
            label: t("contentActivity.comments"),
            color: COLORS.comments,
            line: false,
          },
          {
            label: t("contentActivity.repliesReceived"),
            color: COLORS.replies,
            line: true,
          },
          {
            label: t("contentActivity.votesCast"),
            color: COLORS.votesCast,
            line: true,
          },
          {
            label: t("contentActivity.votesReceived"),
            color: COLORS.votesReceived,
            line: true,
          },
        ];

  return (
    <div className="flex h-full w-full flex-col">
      <div
        dir={dir}
        className="mb-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-2"
      >
        {legendItems.map((it) => (
          <span
            key={it.label}
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px]"
            style={{ color: textColor }}
          >
            <span
              className={
                it.line ? "h-0.5 w-3 rounded-full" : "h-2.5 w-2.5 rounded-[2px]"
              }
              style={{ backgroundColor: it.color }}
            />
            {it.label}
          </span>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        <ReactECharts
          option={option}
          notMerge={true}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>
    </div>
  );
};

export default ContentActivityChart;
