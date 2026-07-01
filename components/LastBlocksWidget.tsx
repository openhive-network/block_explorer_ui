import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import ReactECharts from "echarts-for-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MoveRight, MoveLeft } from "lucide-react";

import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { cn } from "@/lib/utils";
import useLastBlocks from "@/hooks/api/homePage/useLastBlocks";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { useI18n } from "../i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { useSettings } from "@/contexts/SettingsContext";
import useMediaQuery from "@/hooks/common/useMediaQuery";

interface LastBlocksWidgetProps {
  headBlock?: number;
  className?: string;
}

type ChartBlockData = {
  name: string;
  witness: string;
  comment: number;
  vote: number;
  custom: number;
  transfer: number;
  other: number;
  virtual: number;
};

type AvatarPosition = { x: number; y: number; witness: string } | null;

const AVATAR_SIZE = 24;
const AVATAR_R = AVATAR_SIZE / 2;
const ANIMATION_MS = 500;
const EASING = `cubic-bezier(0.215, 0.61, 0.355, 1)`;

const OP_COLORS: Record<string, string> = {
  other: "#3a86ff",
  virtual: "#b010bf",
  comment: "#ffbe0b",
  custom: "#80003e",
  vote: "#fb5607",
  transfer: "#8338ec",
};

// Rendered bottom-to-top in the stacked bar; changing this order shifts which colour sits on top.
const OP_SERIES_ORDER = [
  "other",
  "virtual",
  "comment",
  "custom",
  "vote",
  "transfer",
] as const;

const getOpsCount = (
  lastBlocks: Hive.LastBlocksTypeResponse[]
): ChartBlockData[] => {
  const opsCount: ChartBlockData[] = lastBlocks.map((block) => ({
    name: block.block_num.toString(),
    witness: block.witness,
    virtual: 0,
    other: 0,
    comment: 0,
    custom: 0,
    vote: 0,
    transfer: 0,
  }));

  lastBlocks.forEach((block, index) => {
    let other = 0;
    let virtual = 0;
    block.operations?.forEach((op) => {
      const typeId = op.op_type_id;
      // Hive protocol op_type_ids: 0=vote, 1=comment, 2=transfer, 18=custom_json, ≥50=virtual ops
      if (typeId === 0) opsCount[index].vote = op.op_count;
      else if (typeId === 1) opsCount[index].comment = op.op_count;
      else if (typeId === 2) opsCount[index].transfer = op.op_count;
      else if (typeId === 18) opsCount[index].custom = op.op_count;
      else if (typeId >= 50) virtual += op.op_count;
      else other += op.op_count;
    });
    opsCount[index].other = other;
    opsCount[index].virtual = virtual;
  });
  return opsCount;
};

const LastBlocksWidget: React.FC<LastBlocksWidgetProps> = ({
  headBlock,
  className = "",
}) => {
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const { theme } = useTheme();
  const {
    settings: { liveData },
  } = useSettings();
  const router = useRouter();
  const chartRef = useRef<ReactECharts>(null);

  const SeeMoreIcon = isRTL ? MoveLeft : MoveRight;

  const lastBlocks = useLastBlocks(headBlock);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  // API returns newest-first; reverse so x-axis reads oldest→newest left-to-right.
  // JSON.stringify dep prevents re-computation when the query returns a new array reference
  // with identical content (React Query does this on background refetch).
  const data = useMemo(
    () => getOpsCount(lastBlocks.lastBlocksData || []).reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(lastBlocks.lastBlocksData)]
  );

  const [legendSelected, setLegendSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(OP_SERIES_ORDER.map((k) => [k, true]))
  );

  const blockTotals = useMemo(
    () =>
      data.map((d) =>
        OP_SERIES_ORDER.reduce(
          (s, k) => s + ((d[k as keyof ChartBlockData] as number) || 0),
          0
        )
      ),
    [data]
  );

  const avgOps = useMemo(
    () =>
      blockTotals.length
        ? Math.round(
            blockTotals.reduce((a, b) => a + b, 0) / blockTotals.length
          )
        : 0,
    [blockTotals]
  );

  // Only badge the peak when it actually stands out above average; suppress otherwise.
  const peakIdx = useMemo(() => {
    if (!blockTotals.length) return -1;
    const max = Math.max(...blockTotals);
    if (max <= avgOps) return -1;
    return blockTotals.indexOf(max);
  }, [blockTotals, avgOps]);

  const [avatarPositions, setAvatarPositions] = useState<AvatarPosition[]>([]);
  const [yTicks, setYTicks] = useState<{ label: string; y: number }[]>([]);
  const [avgLineY, setAvgLineY] = useState<number | null>(null);
  const [barGlowBox, setBarGlowBox] = useState<{
    x: number;
    top: number;
    height: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const prevRightmostRef = useRef<string | null>(null);
  const slotWidthRef = useRef(0);

  // Mirror latest values into refs so the stable `recomputeOverlays` callback can read
  // them without being re-created on every data/legend/avg change.
  const dataRef = useRef(data);
  dataRef.current = data;
  const legendSelectedRef = useRef(legendSelected);
  legendSelectedRef.current = legendSelected;
  const avgOpsRef = useRef(avgOps);
  avgOpsRef.current = avgOps;

  useEffect(() => {
    if (avgOps <= 0) {
      setAvgLineY(null);
      return;
    }
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;
    const px = chart.convertToPixel("grid", [0, avgOps]);
    if (Array.isArray(px)) setAvgLineY((px as number[])[1]);
  }, [avgOps, data]);

  // Recomputes all DOM overlay positions from ECharts pixel coordinates.
  // Called on the `finished` event (fires after every draw, including resize),
  // so overlays stay aligned when the container changes size.
  // Uses refs for data/legendSelected/avgOps to stay stable ([] deps).
  const recomputeOverlays = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    // avg line — convertToPixel can throw before the grid is registered on the
    // first finished event; guard each section independently so one failure
    // doesn't prevent the others from running.
    try {
      const avg = avgOpsRef.current;
      if (avg > 0) {
        const px = chart.convertToPixel("grid", [0, avg]);
        if (Array.isArray(px)) setAvgLineY((px as number[])[1]);
      } else {
        setAvgLineY(null);
      }
    } catch {}

    // y-axis tick positions (private ECharts API, stable across 5.x)
    try {
      const axisModel = (chart as any).getModel().getComponent("yAxis", 0);
      const ticks: { value: number }[] = axisModel.axis.scale.getTicks();
      const result = ticks
        .filter((t) => t.value > 0)
        .map((t) => {
          const px = chart.convertToPixel("grid", [0, t.value]) as [
            number,
            number,
          ];
          return { label: String(t.value), y: px[1] };
        });
      setYTicks((prev) => {
        if (
          prev.length === result.length &&
          prev.every(
            (p, i) => p.label === result[i].label && p.y === result[i].y
          )
        )
          return prev;
        return result;
      });
    } catch {}

    // avatar positions + glow box
    try {
      const d = dataRef.current;
      const ls = legendSelectedRef.current;
      if (!d.length) return;
      const visibleTotals = d.map((block) =>
        OP_SERIES_ORDER.reduce(
          (sum, k) =>
            ls[k] ? sum + (block[k as keyof ChartBlockData] as number) : sum,
          0
        )
      );
      const positions: AvatarPosition[] = d.map((block, i) => {
        const pixel = chart.convertToPixel("grid", [i, visibleTotals[i]]);
        if (!Array.isArray(pixel)) return null;
        const [px, py] = pixel as [number, number];
        return { x: px, y: py, witness: block.witness };
      });
      setAvatarPositions(positions);

      const li = d.length - 1;
      const topPx = chart.convertToPixel("grid", [li, visibleTotals[li]]);
      const botPx = chart.convertToPixel("grid", [li, 0]);
      const p0 = chart.convertToPixel("grid", [0, 0]);
      const p1 = d.length > 1 ? chart.convertToPixel("grid", [1, 0]) : null;
      if (
        Array.isArray(topPx) &&
        Array.isArray(botPx) &&
        Array.isArray(p0) &&
        Array.isArray(p1)
      ) {
        const catW = Math.abs((p1 as number[])[0] - (p0 as number[])[0]);
        setBarGlowBox({
          x: (topPx as number[])[0],
          top: (topPx as number[])[1],
          height: (botPx as number[])[1] - (topPx as number[])[1],
          width: catW * 0.65,
        });
        slotWidthRef.current = catW;
      }
    } catch {}
  }, []);

  useEffect(() => {
    recomputeOverlays();
  }, [data, legendSelected, recomputeOverlays]);

  // Slide new block in from the right (or left in RTL) when live mode is on
  useEffect(() => {
    const newRightmost = data.length > 0 ? data[data.length - 1].name : null;
    const prev = prevRightmostRef.current;
    prevRightmostRef.current = newRightmost;

    if (
      !liveData ||
      prev === null ||
      newRightmost === null ||
      newRightmost === prev ||
      !containerRef.current ||
      slotWidthRef.current === 0
    )
      return;

    const el = containerRef.current;

    if (prefersReducedMotion) return;

    const offset = isRTL ? -slotWidthRef.current : slotWidthRef.current;

    // Snap the container to the offset position synchronously, then start the
    // CSS transition back to 0. Reading offsetWidth forces a reflow so the browser
    // registers the instant shift before the transition begins; without it the
    // two style mutations collapse and no animation plays.
    el.style.transition = "none";
    el.style.transform = `translateX(${offset}px)`;
    void el.offsetWidth;
    el.style.transition = `transform ${ANIMATION_MS}ms ${EASING}`;
    el.style.transform = "translateX(0px)";

    const tid = setTimeout(() => {
      el.style.transition = "";
      el.style.transform = "";
    }, ANIMATION_MS + 50);
    return () => clearTimeout(tid);
  }, [data, liveData, isRTL, prefersReducedMotion]);

  const option = useMemo(() => {
    const isDark = theme === "dark";
    const labelColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tooltipBg = isDark ? "#1e2533" : "#ffffff";
    const tooltipBorder = isDark ? "#2d3748" : "#e5e7eb";
    const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

    const latestIdx = liveData ? data.length - 1 : -1;

    const witnessMap = new Map<string, string>(
      data.map((d) => [d.name, d.witness])
    );

    return {
      animation: true,
      // In live mode the CSS translateX slide handles the transition; ECharts bar
      // height animation would fight it and cause avatars/glow to lag behind the bars.
      animationDurationUpdate: liveData ? 0 : ANIMATION_MS,
      animationEasingUpdate: "cubicOut" as const,
      grid: {
        left: isRTL ? 20 : 48,
        right: isRTL ? 48 : 20,
        top: 48,
        bottom: 28,
        containLabel: false,
      },
      // Legend is hidden visually; the component must still be declared so that
      // dispatchAction({ type: "legendToggleSelect" }) can toggle series visibility.
      legend: {
        show: false,
        data: OP_SERIES_ORDER.map((key) => ({ name: key })),
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { opacity: 0.06 } },
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: tooltipText, fontSize: 13 },
        formatter: (params: any[]) => {
          if (!params?.length) return "";
          const blockNum = params[0].axisValue as string;
          // witness is interpolated into raw HTML below; safe because Hive consensus
          // enforces account names to [a-z0-9.-] — no HTML-special characters possible.
          const witness = witnessMap.get(blockNum) ?? "";
          const total = params.reduce(
            (s: number, p: any) => s + (p.value || 0),
            0
          );
          const rows = params
            .filter((p: any) => (p.value || 0) > 0)
            .reverse()
            .map(
              (p: any) =>
                `<div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                  <span style="flex-shrink:0;width:9px;height:9px;border-radius:50%;background:${p.color}"></span>
                  <span style="opacity:.7">${p.seriesName}:</span>
                  <b>${p.value}</b>
                </div>`
            )
            .join("");
          return `
            <div style="min-width:170px">
              <div style="font-weight:700;font-size:14px;margin-bottom:8px">${t("common.block")} ${Number(blockNum).toLocaleString(locale)}</div>
              <div style="display:flex;align-items:center;gap:9px;margin-bottom:8px">
                <img src="${getHiveAvatarUrl(witness)}" width="30" height="30"
                  style="border-radius:50%;object-fit:cover;flex-shrink:0"/>
                <span style="font-weight:600;font-size:13px">${witness}</span>
              </div>
              <div style="font-size:12px;opacity:.55;margin-bottom:6px">
                ${t("common.operations")}: <b style="opacity:1">${total}</b>
              </div>
              <div style="border-top:1px solid ${tooltipBorder};padding-top:6px">
                ${rows}
              </div>
            </div>`;
        },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.name),
        inverse: isRTL,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: labelColor,
          fontSize: 11,
          interval: (index: number) => {
            const lastIdx = data.length - 1;
            if (index === lastIdx) return true;
            if (lastIdx % 3 !== 0 && index === lastIdx - 1) return false;
            return index % 3 === 0;
          },
          hideOverlap: true,
          formatter: (value: string) => Number(value).toLocaleString(locale),
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: {
          lineStyle: { color: gridColor, type: "dashed" as const },
        },
        position: isRTL ? "right" : "left",
      },
      series: OP_SERIES_ORDER.map((key, idx) => ({
        name: key,
        type: "bar",
        stack: "ops",
        data: data.map((d, di) => {
          const value = d[key as keyof ChartBlockData] as number;
          // Round only the topmost visible segment of each stacked bar. ECharts applies
          // borderRadius per segment, so we detect the segment that has no filled
          // segment above it in the render order to avoid mid-bar rounded corners.
          const hasSeriesAbove = OP_SERIES_ORDER.slice(idx + 1).some(
            (k) => (d[k as keyof ChartBlockData] as number) > 0
          );
          const isEffectiveTop = value > 0 && !hasSeriesAbove;
          const isLatest = di === latestIdx;
          return {
            value,
            itemStyle: {
              borderRadius: isEffectiveTop ? [6, 6, 0, 0] : 0,
              opacity: isLatest ? 1 : 0.88,
            },
          };
        }),
        itemStyle: { color: OP_COLORS[key] },
        emphasis: {
          focus: "series",
          itemStyle: {
            opacity: 1,
            shadowBlur: 8,
            shadowColor: OP_COLORS[key] + "99",
          },
        },
        barWidth: "65%",
        cursor: "pointer",
      })),
    };
  }, [data, theme, isRTL, locale, liveData, t]);

  const onEvents = useMemo(
    () => ({
      click: (params: any) => {
        if (params.componentType === "series") {
          router.push(`/block/${params.name}`);
        }
      },
      finished: recomputeOverlays,
    }),
    [router, recomputeOverlays]
  );

  const handleLegendToggle = useCallback((key: string) => {
    const chart = chartRef.current?.getEchartsInstance();
    if (chart) chart.dispatchAction({ type: "legendToggleSelect", name: key });
    setLegendSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isDark = theme === "dark";
  const ringColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.18)";
  const yAxisLabelColor = isDark
    ? "rgba(255,255,255,0.45)"
    : "rgba(0,0,0,0.45)";

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes lastblock-pulse {
            0%, 100% { box-shadow: 0 0 0 2px #3b82f6, 0 0 6px 3px rgba(59,130,246,0.55); }
            50%       { box-shadow: 0 0 0 4px #3b82f6, 0 0 14px 7px rgba(59,130,246,0.8); }
          }
          .last-block-avatar { animation: lastblock-pulse 1.6s ease-in-out infinite; }
          @keyframes lastblock-bar-ring {
            0%, 100% { border-color: rgba(59,130,246,0.65); box-shadow: 0 0 6px 2px rgba(59,130,246,0.45); }
            50%       { border-color: #60a5fa; box-shadow: 0 0 14px 5px rgba(59,130,246,0.8); }
          }
          .last-block-bar-ring { animation: lastblock-bar-ring 1.6s ease-in-out infinite; }
        }
      `}</style>
      <Card
        className={cn("w-full h-[480px] pb-2 mb-2 overflow-hidden", className)}
        data-testid="last-block-widget"
      >
        <CardHeader>
          <CardTitle>{t("lastBlocksWidget.lastBlocks")}</CardTitle>
          <Link
            href="/blocks"
            className="text-sm flex items-center space-x-1 w-full text-center justify-center"
            data-testid="see-witnesses-link"
          >
            <span>{t("common.seeMore")}</span>
            <SeeMoreIcon width={18} />
          </Link>
        </CardHeader>
        <div className="relative" style={{ height: "calc(100% - 72px)" }}>
          {avgLineY !== null && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: isRTL ? 20 : 48,
                  right: isRTL ? 48 : 20,
                  top: avgLineY,
                  height: 0,
                  borderTop: `1.5px dashed ${yAxisLabelColor}`,
                  opacity: 0.5,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
              <span
                style={{
                  position: "absolute",
                  ...(isRTL ? { left: 52 } : { right: 24 }),
                  top: avgLineY - 14,
                  fontSize: 10,
                  color: yAxisLabelColor,
                  opacity: 0.75,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                {t("lastBlocksWidget.avg")} {avgOps}
              </span>
            </>
          )}
          {yTicks.map((tick) => (
            <span
              key={tick.label}
              style={{
                position: "absolute",
                ...(isRTL
                  ? { right: 0, width: 44, textAlign: "left" as const }
                  : { left: 0, width: 44, textAlign: "right" as const }),
                top: tick.y - 7,
                fontSize: 11,
                lineHeight: 1,
                color: yAxisLabelColor,
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 2,
              }}
            >
              {tick.label}
            </span>
          ))}
          <div
            ref={containerRef}
            className="relative"
            style={{ height: "calc(100% - 40px)" }}
          >
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ height: "100%", width: "100%" }}
              notMerge={false}
              lazyUpdate={false}
              onEvents={onEvents}
            />
            {liveData && barGlowBox && (
              <div
                className="last-block-bar-ring"
                style={{
                  position: "absolute",
                  // convertToPixel returns the category centre; subtract half bar-width to get the left edge.
                  left: barGlowBox.x - barGlowBox.width / 2,
                  top: barGlowBox.top,
                  width: barGlowBox.width,
                  height: barGlowBox.height,
                  border: "2px solid rgba(59,130,246,0.65)",
                  borderRadius: "6px 6px 0 0",
                  pointerEvents: "none",
                  transition: "none",
                }}
              />
            )}
            {!isMobile &&
              peakIdx >= 0 &&
              avatarPositions[peakIdx] &&
              (() => {
                const pos = avatarPositions[peakIdx]!;
                return (
                  <div
                    style={{
                      position: "absolute",
                      left: pos.x,
                      transform: "translateX(-50%)",
                      top: pos.y - AVATAR_SIZE - 6 - 22,
                      zIndex: 10,
                      background: "rgba(245,158,11,0.9)",
                      color: "#fff",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 10,
                      fontWeight: 600,
                      lineHeight: 1.4,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      transition: liveData
                        ? "none"
                        : `left ${ANIMATION_MS}ms ${EASING}, top ${ANIMATION_MS}ms ${EASING}`,
                    }}
                  >
                    ▲ {blockTotals[peakIdx]}
                  </div>
                );
              })()}
            {!isMobile &&
              avatarPositions.map((pos, i) => {
                if (!pos) return null;
                const isLatest = liveData && i === data.length - 1;
                return (
                  <img
                    key={data[i]?.name ?? i}
                    src={getHiveAvatarUrl(pos.witness)}
                    alt={pos.witness}
                    width={AVATAR_SIZE}
                    height={AVATAR_SIZE}
                    className={isLatest ? "last-block-avatar" : undefined}
                    style={{
                      position: "absolute",
                      left: pos.x - AVATAR_R,
                      top: pos.y - AVATAR_SIZE - 6,
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: isLatest
                        ? "2px solid #3b82f6"
                        : `1.5px solid ${ringColor}`,
                      pointerEvents: "none",
                      transition: liveData
                        ? "none"
                        : `left ${ANIMATION_MS}ms ${EASING}, top ${ANIMATION_MS}ms ${EASING}`,
                    }}
                  />
                );
              })}
          </div>
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {OP_SERIES_ORDER.map((key) => (
              <button
                key={key}
                onClick={() => handleLegendToggle(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: legendSelected[key] ? 1 : 0.35,
                  padding: 0,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: OP_COLORS[key],
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: yAxisLabelColor }}>
                  {key}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
};

export default LastBlocksWidget;
