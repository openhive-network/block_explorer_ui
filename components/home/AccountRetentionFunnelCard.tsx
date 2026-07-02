import React, { useMemo, useState } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import AccountRetentionHeatmap, {
  HeatmapViewMode,
} from "./AccountRetentionHeatmap";
import { useI18n } from "../../i18n/i18n";
import useAccountFunnel from "@/hooks/api/homePage/useAccountFunnel";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AccountRetentionFunnelFullChartDialog = dynamic(
  () => import("./AccountRetentionFunnelFullChartDialog"),
  { ssr: false }
);

const getRetentionColorClass = (pct: number | null): string => {
  if (pct === null) return "text-gray-400 dark:text-gray-500";
  if (pct >= 30) return "text-emerald-500 dark:text-emerald-400";
  if (pct >= 10) return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
};

const getRatioColorClass = (pct: number | null): string => {
  if (pct === null) return "text-gray-400 dark:text-gray-500";
  if (pct >= 80) return "text-emerald-500 dark:text-emerald-400";
  if (pct >= 50) return "text-amber-500 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
};

interface RetentionKpiProps {
  labelKey: string;
  pct: number | null;
  count: number | null;
  trend: number | null;
  locale: string;
  t: (key: string) => string;
  isRatio?: boolean;
  tooltip?: string;
}

const RetentionKpi: React.FC<RetentionKpiProps> = ({
  labelKey,
  pct,
  count,
  trend,
  locale,
  t,
  isRatio = false,
  tooltip,
}) => {
  const displayPct = pct !== null && isRatio ? Math.min(pct, 100) : pct;
  const colorClass = isRatio
    ? getRatioColorClass(displayPct)
    : getRetentionColorClass(pct);
  return (
    <div className="flex-1 min-w-[120px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
        {tooltip ? (
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
        ) : (
          t(labelKey)
        )}
      </h3>
      <div className="flex items-baseline gap-1.5">
        <p className={cn("text-xl font-bold leading-tight", colorClass)}>
          {displayPct !== null
            ? `${displayPct.toLocaleString(locale, { maximumFractionDigits: 1 })}%`
            : "—"}
        </p>
        {trend !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
              trend >= 0
                ? "text-explorer-light-green"
                : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
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
            {t("accountRetentionFunnelCard.heatmapAccounts")}
          </span>
        </p>
      )}
    </div>
  );
};

const AccountRetentionFunnelCard: React.FC = () => {
  const { t, locale } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<HeatmapViewMode>("rates");

  const fromDate = useMemo(() => moment().subtract(6, "months").toDate(), []);
  const toDate = useMemo(
    () => moment().subtract(1, "month").endOf("month").toDate(),
    []
  );

  const { accountFunnel, isAccountFunnelLoading, isAccountFunnelError } =
    useAccountFunnel(fromDate, toDate);

  const sortedData = useMemo(() => {
    if (!accountFunnel) return [];
    return [...accountFunnel].sort((a, b) =>
      a.cohort_month < b.cohort_month ? -1 : 1
    );
  }, [accountFunnel]);

  // Most recent cohort whose 90-day window has fully elapsed (cohort month + 3 months < current month)
  const lastCompleteCohort = useMemo(() => {
    const cutoff = moment().subtract(4, "months").format("YYYY-MM");
    return (
      [...sortedData]
        .reverse()
        .find(
          (d) =>
            d.cohort_month <= cutoff &&
            d.pct_7d !== null &&
            d.pct_30d !== null &&
            d.pct_90d !== null
        ) ?? null
    );
  }, [sortedData]);

  const priorCompleteCohort = useMemo(() => {
    if (!lastCompleteCohort) return null;
    const idx = sortedData.findIndex(
      (d) => d.cohort_month === lastCompleteCohort.cohort_month
    );
    return idx > 0 ? sortedData[idx - 1] : null;
  }, [sortedData, lastCompleteCohort]);

  const momGrowth = useMemo(() => {
    if (!lastCompleteCohort || !priorCompleteCohort) return null;
    const prior = priorCompleteCohort.new_accounts;
    if (prior === 0) return null;
    return ((lastCompleteCohort.new_accounts - prior) / prior) * 100;
  }, [lastCompleteCohort, priorCompleteCohort]);

  const trend7d = useMemo(() => {
    if (
      !lastCompleteCohort ||
      !priorCompleteCohort ||
      priorCompleteCohort.pct_7d === null
    )
      return null;
    return lastCompleteCohort.pct_7d! - priorCompleteCohort.pct_7d;
  }, [lastCompleteCohort, priorCompleteCohort]);

  const trend30d = useMemo(() => {
    if (
      !lastCompleteCohort ||
      !priorCompleteCohort ||
      priorCompleteCohort.pct_30d === null
    )
      return null;
    return lastCompleteCohort.pct_30d! - priorCompleteCohort.pct_30d;
  }, [lastCompleteCohort, priorCompleteCohort]);

  const trend90d = useMemo(() => {
    if (
      !lastCompleteCohort ||
      !priorCompleteCohort ||
      priorCompleteCohort.pct_90d === null
    )
      return null;
    return lastCompleteCohort.pct_90d! - priorCompleteCohort.pct_90d;
  }, [lastCompleteCohort, priorCompleteCohort]);

  const stickinessPct = useMemo(() => {
    if (
      !lastCompleteCohort ||
      !lastCompleteCohort.active_at_7d ||
      lastCompleteCohort.active_at_30d === null
    )
      return null;
    return (
      (lastCompleteCohort.active_at_30d / lastCompleteCohort.active_at_7d) * 100
    );
  }, [lastCompleteCohort]);

  const funnelDepthPct = useMemo(() => {
    if (
      !lastCompleteCohort ||
      !lastCompleteCohort.active_at_7d ||
      lastCompleteCohort.active_at_90d === null
    )
      return null;
    return (
      (lastCompleteCohort.active_at_90d / lastCompleteCohort.active_at_7d) * 100
    );
  }, [lastCompleteCohort]);

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800">
        <span className="block w-[3px] h-3.5 rounded-full bg-indigo-500 flex-shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {t("accountRetentionFunnelCard.title")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 p-2">
        {/* KPI — New Accounts */}
        <div className="flex-1 min-w-[120px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
            {t("accountRetentionFunnelCard.newAccounts")}
          </h3>
          {isAccountFunnelLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mt-1" />
          ) : isAccountFunnelError ? (
            <p className="text-red-500 text-[11px] mt-1">
              {t("common.errorLoadingData")}
            </p>
          ) : lastCompleteCohort ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                  {lastCompleteCohort.new_accounts.toLocaleString(locale)}
                </p>
                {momGrowth !== null && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none border-b border-dashed cursor-help",
                            momGrowth >= 0
                              ? "text-explorer-light-green border-explorer-light-green"
                              : "text-rose-600 dark:text-rose-400 border-rose-600 dark:border-rose-400"
                          )}
                        >
                          {momGrowth >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(momGrowth).toLocaleString(locale, {
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
                          {t("accountRetentionFunnelCard.tooltipMoM")}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {lastCompleteCohort.active_at_7d !== null && (
                <p className="text-[11px] font-medium tabular-nums text-rose-600 dark:text-rose-400 leading-tight">
                  {(
                    lastCompleteCohort.new_accounts -
                    lastCompleteCohort.active_at_7d
                  ).toLocaleString(locale)}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-normal border-b border-dashed border-rose-400 dark:border-rose-500 cursor-help">
                          {" "}
                          {t("accountRetentionFunnelCard.dropOff")}
                        </span>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          side="top"
                          className="max-w-[260px] text-[12px] text-left"
                        >
                          {t("accountRetentionFunnelCard.tooltipDropOff")}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-xs mt-1">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>

        {/* KPI — 7d, 30d, 90d retention + stickiness + funnel depth */}
        {isAccountFunnelLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[120px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex items-center justify-center"
            >
              <Loader2 className="animate-spin h-4 w-4" />
            </div>
          ))
        ) : isAccountFunnelError ? (
          [1, 2, 3, 4, 5].map((i) => (
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
              labelKey="accountRetentionFunnelCard.retention7d"
              pct={lastCompleteCohort?.pct_7d ?? null}
              count={lastCompleteCohort?.active_at_7d ?? null}
              trend={trend7d}
              locale={locale}
              t={t}
            />
            <RetentionKpi
              labelKey="accountRetentionFunnelCard.retention30d"
              pct={lastCompleteCohort?.pct_30d ?? null}
              count={lastCompleteCohort?.active_at_30d ?? null}
              trend={trend30d}
              locale={locale}
              t={t}
            />
            <RetentionKpi
              labelKey="accountRetentionFunnelCard.retention90d"
              pct={lastCompleteCohort?.pct_90d ?? null}
              count={lastCompleteCohort?.active_at_90d ?? null}
              trend={trend90d}
              locale={locale}
              t={t}
            />
            <RetentionKpi
              labelKey="accountRetentionFunnelCard.stickiness"
              pct={stickinessPct}
              count={null}
              trend={null}
              locale={locale}
              t={t}
              isRatio
              tooltip={t("accountRetentionFunnelCard.tooltipStickiness")}
            />
            <RetentionKpi
              labelKey="accountRetentionFunnelCard.funnelDepth"
              pct={funnelDepthPct}
              count={null}
              trend={null}
              locale={locale}
              t={t}
              isRatio
              tooltip={t("accountRetentionFunnelCard.tooltipFunnelDepth")}
            />
          </>
        )}

        {/* Chart panel */}
        <div className="flex-[2] min-w-[220px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
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
                    ? t("accountRetentionFunnelFullChart.viewRates")
                    : t("accountRetentionFunnelFullChart.viewCounts")}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs underline"
            >
              {t("accountRetentionFunnelCard.fullChart")}
            </button>
          </div>
          {isAccountFunnelLoading ? (
            <div className="flex items-center justify-center flex-grow min-h-[100px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : (
            <div className="flex-grow min-h-[100px] overflow-hidden">
              <AccountRetentionHeatmap
                data={sortedData}
                compact
                viewMode={viewMode}
              />
            </div>
          )}
        </div>

        {/* Data source footnote */}
        {!isAccountFunnelLoading &&
          !isAccountFunnelError &&
          lastCompleteCohort && (
            <p className="w-full text-[10px] text-gray-400 dark:text-gray-500 text-right leading-none pb-0.5">
              {t("accountRetentionFunnelCard.basedOnLatestCohort")} ·{" "}
              {moment(lastCompleteCohort.cohort_month, "YYYY-MM").format(
                "MMM YYYY"
              )}
            </p>
          )}
      </div>

      <AccountRetentionFunnelFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AccountRetentionFunnelCard;
