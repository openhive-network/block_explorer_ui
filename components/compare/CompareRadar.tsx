import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ECharts } from "echarts";
import { Radar as RadarIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { CompareSection } from "@/utils/compare/types";
import { sectionStrength } from "@/utils/compare/scoring";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const A_COLOR = "#ef4444"; // @a red
const B_COLOR = "#3b82f6"; // @b blue

interface CompareRadarProps {
  a: string;
  b: string;
  sections: CompareSection[];
  t: (k: string) => string;
}

// A "strengths fingerprint": each account's share of goodness per section (0–100),
// two overlaid polygons — the whole matchup in one glance.
const CompareRadar: React.FC<CompareRadarProps> = ({ a, b, sections, t }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const aName = `@${a}`;
  const bName = `@${b}`;

  const option = useMemo(() => {
    const indicator = sections.map((s) => ({ name: t(s.titleKey), max: 100 }));
    const aData = sections.map((s) => Math.round(sectionStrength(s).a * 100));
    const bData = sections.map((s) => Math.round(sectionStrength(s).b * 100));
    return {
      tooltip: {
        confine: true,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        borderColor: gridColor,
        textStyle: { color: textColor, fontSize: 11 },
      },
      legend: {
        bottom: 0,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: textColor, fontSize: 12, fontWeight: "bold" },
        data: [aName, bName],
      },
      radar: {
        indicator,
        radius: "62%",
        center: ["50%", "48%"],
        axisName: { color: textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: gridColor } },
        axisLine: { lineStyle: { color: gridColor } },
        splitArea: {
          areaStyle: {
            color: isDark
              ? ["rgba(148,163,184,0.04)", "rgba(148,163,184,0.08)"]
              : ["rgba(148,163,184,0.03)", "rgba(148,163,184,0.07)"],
          },
        },
      },
      series: [
        {
          type: "radar",
          symbolSize: 5,
          data: [
            {
              value: aData,
              name: aName,
              itemStyle: { color: A_COLOR },
              lineStyle: { color: A_COLOR, width: 2 },
              areaStyle: { color: "rgba(239,68,68,0.15)" },
            },
            {
              value: bData,
              name: bName,
              itemStyle: { color: B_COLOR },
              lineStyle: { color: B_COLOR, width: 2 },
              areaStyle: { color: "rgba(59,130,246,0.15)" },
            },
          ],
        },
      ],
    };
  }, [sections, t, isDark, textColor, gridColor, aName, bName]);

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-theme p-4 shadow-sm dark:border-slate-700">
      <div className="mb-1 flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
        <RadarIcon className="h-4 w-4 text-indigo-500" />
        {t("compare.radar.title")}
      </div>
      <p className="mb-2 text-[11px] text-slate-400 dark:text-slate-500">
        {t("compare.radar.subtitle")}
      </p>
      {/* Decorative: the same numbers live in the section Score pills and each
          row's screen-reader text, so hide the canvas from assistive tech. */}
      <div aria-hidden className="h-[300px] w-full">
        <ReactECharts
          option={option}
          onChartReady={(inst: ECharts) => inst.resize()}
          style={{ height: "100%", width: "100%" }}
          notMerge
        />
      </div>

      {/* Jump straight to any category's rows. */}
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {t("compare.radar.jumpTo")}
        </span>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() =>
              document
                .getElementById(`compare-${s.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {t(s.titleKey)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompareRadar;
