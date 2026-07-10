import React, { useMemo, useState } from "react";
import {
  Loader2,
  Cpu,
  Gauge,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import moment from "moment";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useI18n } from "../../i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useNetworkRcUtilization from "@/hooks/api/homePage/useNetworkRcUtilization";
import { cn } from "@/lib/utils";
import { computeTrendPct } from "@/utils/chartUtils";
import {
  CLAIM_ACCOUNT_OP,
  currentRcPeriodStart,
  formatRc,
  formatOpLabel,
  aggregateRcByOp,
} from "./networkRcUtils";
import { getOpHexColor } from "@/utils/operationColors";

const NetworkRcUtilizationFullChartDialog = dynamic(
  () => import("./NetworkRcUtilizationFullChartDialog"),
  { ssr: false }
);

const TrendBadge: React.FC<{ value: number; locale: string }> = ({
  value,
  locale,
}) => {
  const sign = value > 0 ? 1 : value < 0 ? -1 : 0;
  const Icon = sign > 0 ? TrendingUp : sign < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold leading-none",
        sign > 0
          ? "text-explorer-light-green"
          : sign < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-gray-500"
      )}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 2 })}%
    </span>
  );
};

const NetworkRcUtilizationCard = () => {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayKey = useMemo(() => moment.utc().format("YYYY-MM-DD"), []);
  const fromDate = useMemo(
    () => moment.utc(todayKey).subtract(30, "days").toDate(),
    [todayKey]
  );

  const {
    networkRcUtilization,
    isNetworkRcUtilizationLoading,
    isNetworkRcUtilizationError,
  } = useNetworkRcUtilization(fromDate, undefined, "day");

  const chartData = useMemo(() => {
    if (!networkRcUtilization || networkRcUtilization.length === 0) return [];
    return [...networkRcUtilization].sort((a, b) =>
      a.period < b.period ? -1 : 1
    );
  }, [networkRcUtilization]);

  const { stats, breakdown } = useMemo(() => {
    const start = currentRcPeriodStart("day");
    const completed = chartData.filter((d) => d.period < start);
    const base = completed.length ? completed : chartData;
    if (!base.length)
      return {
        stats: { total: null, avg: null, claimsShare: null, trend: null },
        breakdown: { top: [], otherValue: 0, organicTotal: 0 },
      } as const;
    const total = base.reduce((s, d) => s + d.rc_total, 0);
    const claims = base.reduce(
      (s, d) => s + (d.by_label?.[CLAIM_ACCOUNT_OP] ?? 0),
      0
    );
    const { ops, total: organicTotal } = aggregateRcByOp(base, false);
    // Share is against the by_label sum (same basis as the treemap) so the KPI
    // and the RC-by-operation breakdown reconcile.
    const byLabelTotal = organicTotal + claims;
    return {
      stats: {
        total,
        avg: total / base.length,
        claimsShare: byLabelTotal > 0 ? (claims / byLabelTotal) * 100 : 0,
        trend: computeTrendPct(base.map((d) => d.rc_total)),
      },
      breakdown: {
        top: ops.slice(0, 4),
        otherValue: ops.slice(4).reduce((s, o) => s + o.value, 0),
        organicTotal,
      },
    };
  }, [chartData]);

  const kpis: {
    key: string;
    labelKey: string;
    Icon: typeof Cpu;
    value: string | null;
    sub: string | null;
    trend: number | null;
    infoKey?: string;
  }[] = [
    {
      key: "total",
      labelKey: "networkRcUtilizationCard.totalRc",
      Icon: Cpu,
      value: stats.total !== null ? formatRc(stats.total, locale) : null,
      sub: t("networkRcUtilizationCard.last30d"),
      trend: stats.trend,
    },
    {
      key: "avg",
      labelKey: "networkRcUtilizationCard.avgPerDay",
      Icon: Gauge,
      value: stats.avg !== null ? formatRc(stats.avg, locale) : null,
      sub: null,
      trend: null,
    },
    {
      key: "claims",
      labelKey: "networkRcUtilizationCard.accountClaims",
      Icon: UserPlus,
      value:
        stats.claimsShare !== null
          ? `${stats.claimsShare.toLocaleString(locale, {
              maximumFractionDigits: 1,
            })}%`
          : null,
      sub: t("networkRcUtilizationCard.ofTotal"),
      trend: null,
      infoKey: "networkRcUtilizationCard.accountClaimsInfo",
    },
  ];

  const bars = useMemo(
    () => [
      ...breakdown.top.map((o) => ({
        key: o.op,
        label: formatOpLabel(o.op),
        value: o.value,
        color: getOpHexColor(o.op),
      })),
      ...(breakdown.otherValue > 0
        ? [
            {
              key: "__other",
              label: t("networkRcUtilizationCard.other"),
              value: breakdown.otherValue,
              color: getOpHexColor("Other"),
            },
          ]
        : []),
    ],
    // theme dep so the CSS-variable op colors refresh on theme change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [breakdown, t, theme]
  );

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden">
      <CardHeaderWithLink
        title={t("widgets.networkRcUtilizationName")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="p-2 space-y-2">
        <div className="flex flex-wrap gap-2">
          {kpis.map(({ key, labelKey, Icon, value, sub, trend, infoKey }) => (
            <div
              key={key}
              className="flex-1 min-w-[140px] bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col justify-start"
            >
              <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                <span>{t(labelKey)}</span>
                {infoKey && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-gray-400 hover:text-gray-500 cursor-help flex-shrink-0">
                          <Info size={11} />
                        </span>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px] text-[11px] text-center normal-case"
                        >
                          {t(infoKey)}
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h3>
              {isNetworkRcUtilizationLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mt-1" />
              ) : isNetworkRcUtilizationError ? (
                <p className="text-red-500 text-[11px] mt-1">
                  {t("common.errorLoadingData")}
                </p>
              ) : value !== null ? (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-xl font-bold leading-tight text-explorer-dark-gray dark:text-text">
                      {value}
                    </p>
                    {trend !== null && (
                      <TrendBadge value={trend} locale={locale} />
                    )}
                  </div>
                  {sub && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                      <Icon className="h-3 w-3 shrink-0" />
                      {sub}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-xs mt-1">
                  {t("common.noDataAvailable")}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-explorer-extra-light-gray rounded-lg p-2.5 shadow-md flex flex-col">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {t("networkRcUtilizationCard.topConsumers")}
            </h3>
            <span className="text-[9px] uppercase tracking-wide text-gray-400">
              {t("networkRcUtilizationCard.exclClaims")}
            </span>
          </div>
          {isNetworkRcUtilizationLoading ? (
            <div className="flex items-center justify-center h-[150px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : isNetworkRcUtilizationError ? (
            <p className="text-red-500 text-[11px]">
              {t("common.errorLoadingData")}
            </p>
          ) : bars.length ? (
            <div className="space-y-1.5">
              {bars.map((b) => {
                const share =
                  breakdown.organicTotal > 0
                    ? (b.value / breakdown.organicTotal) * 100
                    : 0;
                const width = Math.max(2, share);
                return (
                  <div key={b.key} className="flex items-center gap-2">
                    <span
                      className="w-[34%] shrink-0 truncate text-[11px] text-explorer-dark-gray dark:text-text"
                      title={b.label}
                    >
                      {b.label}
                    </span>
                    <div className="flex h-3 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded"
                        style={{ width: `${width}%`, backgroundColor: b.color }}
                      />
                    </div>
                    <span className="w-[58px] shrink-0 text-right text-[11px] font-semibold tabular-nums text-explorer-dark-gray dark:text-text">
                      {formatRc(b.value, locale)}
                    </span>
                    <span className="w-[38px] shrink-0 text-right text-[10px] tabular-nums text-gray-400">
                      {share.toLocaleString(locale, {
                        maximumFractionDigits: 0,
                      })}
                      %
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-xs">
              {t("common.noDataAvailable")}
            </p>
          )}
          <ul className="mt-2 space-y-0.5 text-[10px] text-gray-400">
            <li className="flex gap-1.5">
              <span className="shrink-0">–</span>
              <span>{t("networkRcUtilizationCard.estimateNote")}</span>
            </li>
            <li className="flex gap-1.5">
              <span className="shrink-0">–</span>
              <span>{t("networkRcUtilizationCard.unitsHint")}</span>
            </li>
          </ul>
        </div>
      </div>

      <NetworkRcUtilizationFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkRcUtilizationCard;
