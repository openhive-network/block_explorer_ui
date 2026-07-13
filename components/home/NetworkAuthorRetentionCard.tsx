import React, { useMemo, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import NetworkAuthorRetentionHeatmap, {
  HeatmapViewMode,
  LEGEND_ITEMS,
} from "./NetworkAuthorRetentionHeatmap";
import { useI18n } from "../../i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useNetworkAuthorRetention from "@/hooks/api/homePage/useNetworkAuthorRetention";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CardHeaderWithLink from "../ui/CardHeaderWithLink";
import { computeTrendPct } from "@/utils/chartUtils";

const NetworkAuthorRetentionFullChartDialog = dynamic(
  () => import("./NetworkAuthorRetentionFullChartDialog"),
  { ssr: false }
);

const getRetentionColorClass = (pct: number | null): string => {
  if (pct === null) return "text-gray-400 dark:text-gray-500";
  if (pct >= 30) return "text-emerald-500 dark:text-emerald-400";
  if (pct >= 10) return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
};

interface RetentionKpiProps {
  labelKey: string;
  pct: number | null;
  count: number | null;
  trend: number | null;
  locale: string;
  t: (key: string) => string;
  tooltip: string;
}

const RetentionKpi: React.FC<RetentionKpiProps> = ({
  labelKey,
  pct,
  count,
  trend,
  locale,
  t,
  tooltip,
}) => {
  const colorClass = getRetentionColorClass(pct);
  return (
    <div className="flex-1 min-w-[110px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-start">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text whitespace-pre-line">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="border-b border-dashed border-explorer-dark-gray dark:border-text cursor-help">
                {t(labelKey)}
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[260px] text-[12px] text-left"
              >
                {tooltip}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      </h3>
      <div className="flex items-baseline gap-1.5 mt-1">
        <p className={cn("text-xl font-bold leading-tight", colorClass)}>
          {pct !== null
            ? `${pct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
            : "—"}
        </p>
        {trend !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium leading-none",
              trend >= 0
                ? "text-explorer-light-green"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(trend).toLocaleString(locale, {
              maximumFractionDigits: 1,
            })}
            %
          </span>
        )}
      </div>
      {count !== null && (
        <p className="text-[11px] font-medium tabular-nums text-explorer-dark-gray dark:text-gray-300 leading-tight">
          {count.toLocaleString(locale)}
          <span className="font-normal text-gray-400 dark:text-gray-500">
            {" "}
            {t("networkAuthorRetentionCard.heatmapAuthors")}
          </span>
        </p>
      )}
    </div>
  );
};

const NetworkAuthorRetentionCard: React.FC = () => {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<HeatmapViewMode>("rates");

  // Show a compact 6-cohort window (like the Retention Funnel card). Shifted
  // back so the deepest 180-day window has data for the older rows; the most
  // recent shown cohorts still read "—" until that window elapses.
  const fromDate = useMemo(() => moment().subtract(9, "months").toDate(), []);
  const toDate = useMemo(
    () => moment().subtract(4, "month").endOf("month").toDate(),
    []
  );

  const { authorRetention, isAuthorRetentionLoading, isAuthorRetentionError } =
    useNetworkAuthorRetention(fromDate, toDate);

  const sortedData = useMemo(() => {
    if (!authorRetention) return [];
    return [...authorRetention].sort((a, b) =>
      a.cohort_month < b.cohort_month ? -1 : 1
    );
  }, [authorRetention]);

  // Most recent cohort whose deepest (180-day) window has fully elapsed, so all
  // three windows carry data (cohort month + 6 months < current month).
  const lastCompleteCohort = useMemo(() => {
    const cutoff = moment().subtract(7, "months").format("YYYY-MM");
    return (
      [...sortedData]
        .reverse()
        .find(
          (d) =>
            d.cohort_month <= cutoff &&
            d.pct_30d !== null &&
            d.pct_90d !== null &&
            d.pct_180d !== null
        ) ?? null
    );
  }, [sortedData]);

  const newAuthorsTrend = useMemo(
    () => computeTrendPct(sortedData.map((d) => d.first_post_accounts)),
    [sortedData]
  );

  const trend30d = useMemo(
    () =>
      computeTrendPct(
        sortedData.filter((d) => d.pct_30d !== null).map((d) => d.pct_30d!)
      ),
    [sortedData]
  );
  const trend90d = useMemo(
    () =>
      computeTrendPct(
        sortedData.filter((d) => d.pct_90d !== null).map((d) => d.pct_90d!)
      ),
    [sortedData]
  );
  const trend180d = useMemo(
    () =>
      computeTrendPct(
        sortedData.filter((d) => d.pct_180d !== null).map((d) => d.pct_180d!)
      ),
    [sortedData]
  );

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("networkAuthorRetentionCard.title")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="flex flex-wrap gap-2 p-2">
        {/* KPI — New Authors */}
        <div className="flex-1 min-w-[110px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-start">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("networkAuthorRetentionCard.newAuthors")}
          </h3>
          {isAuthorRetentionLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isAuthorRetentionError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : lastCompleteCohort ? (
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                {lastCompleteCohort.first_post_accounts.toLocaleString(locale)}
              </p>
              {newAuthorsTrend !== null && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] font-medium leading-none border-b border-dashed cursor-help",
                          newAuthorsTrend >= 0
                            ? "text-explorer-light-green border-explorer-light-green"
                            : "text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400"
                        )}
                      >
                        {newAuthorsTrend >= 0 ? (
                          <TrendingUp className="h-2.5 w-2.5" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5" />
                        )}
                        {Math.abs(newAuthorsTrend).toLocaleString(locale, {
                          maximumFractionDigits: 1,
                        })}
                        %
                      </span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent
                        side="top"
                        className="max-w-[260px] text-[12px] text-left"
                      >
                        {t("networkAuthorRetentionCard.tooltipMoM")}
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* KPI — ≤30d, 31–90d, 91–180d re-engagement */}
        {isAuthorRetentionLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[120px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex items-center justify-center"
            >
              <Loader2 className="animate-spin h-4 w-4" />
            </div>
          ))
        ) : isAuthorRetentionError ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[120px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex items-center"
            >
              <p className="text-red-500 text-[11px]">
                {t("common.errorLoadingData")}
              </p>
            </div>
          ))
        ) : (
          <>
            <RetentionKpi
              labelKey="networkAuthorRetentionCard.active30d"
              pct={lastCompleteCohort?.pct_30d ?? null}
              count={lastCompleteCohort?.active_at_30d ?? null}
              trend={trend30d}
              locale={locale}
              t={t}
              tooltip={t("networkAuthorRetentionCard.tooltip30d")}
            />
            <RetentionKpi
              labelKey="networkAuthorRetentionCard.active90d"
              pct={lastCompleteCohort?.pct_90d ?? null}
              count={lastCompleteCohort?.active_at_90d ?? null}
              trend={trend90d}
              locale={locale}
              t={t}
              tooltip={t("networkAuthorRetentionCard.tooltip90d")}
            />
            <RetentionKpi
              labelKey="networkAuthorRetentionCard.active180d"
              pct={lastCompleteCohort?.pct_180d ?? null}
              count={lastCompleteCohort?.active_at_180d ?? null}
              trend={trend180d}
              locale={locale}
              t={t}
              tooltip={t("networkAuthorRetentionCard.tooltip180d")}
            />
          </>
        )}

        {/* Chart panel — forced to its own full-width row below the KPIs */}
        <div className="basis-full bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <div className="flex gap-1">
              {(["rates", "counts"] as HeatmapViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors",
                    viewMode === mode
                      ? "bg-indigo-500 text-white"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {mode === "rates"
                    ? t("networkAuthorRetentionFullChart.viewRates")
                    : t("networkAuthorRetentionFullChart.viewCounts")}
                </button>
              ))}
            </div>
          </div>
          {isAuthorRetentionLoading ? (
            <div className="flex items-center justify-center flex-grow min-h-[100px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <>
              <div className="flex-grow min-h-[100px] overflow-hidden">
                <NetworkAuthorRetentionHeatmap
                  data={sortedData}
                  compact
                  viewMode={viewMode}
                />
              </div>
              {viewMode === "rates" && (
                <div className="flex items-center gap-0.5 mt-1 flex-wrap">
                  {LEGEND_ITEMS.map((item) => (
                    <span
                      key={item.range}
                      className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: isDark ? item.darkBg : item.lightBg,
                        color: isDark ? item.darkText : item.lightText,
                      }}
                    >
                      {item.range}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Data source footnote */}
        {!isAuthorRetentionLoading &&
          !isAuthorRetentionError &&
          lastCompleteCohort && (
            <div className="w-full flex items-end justify-between pb-0.5">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                {t("networkAuthorRetentionCard.dashNote")}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 text-right leading-none">
                {t("networkAuthorRetentionCard.basedOnLatestCohort")} ·{" "}
                {moment(lastCompleteCohort.cohort_month, "YYYY-MM")
                  .locale(locale)
                  .format("MMM YYYY")}
              </span>
            </div>
          )}
      </div>

      <NetworkAuthorRetentionFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkAuthorRetentionCard;
