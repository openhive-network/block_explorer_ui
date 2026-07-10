import React, { useMemo } from "react";
import { TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import { computeTrendPct } from "@/utils/chartUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CLAIM_ACCOUNT_OP,
  RcGranularity,
  currentRcPeriodStart,
  formatRc,
  formatOpLabel,
} from "./networkRcUtils";

interface NetworkRcUtilizationKpiStripProps {
  data: Hive.NetworkRcUtilizationResponse[];
  granularity: RcGranularity;
}

const NetworkRcUtilizationKpiStrip: React.FC<
  NetworkRcUtilizationKpiStripProps
> = ({ data, granularity }) => {
  const { t, locale } = useI18n();

  const kpis = useMemo(() => {
    if (!data.length) return null;
    const start = currentRcPeriodStart(granularity);
    const completed = data.filter((d) => d.period < start);
    const base = completed.length ? completed : data;
    const n = base.length;

    const totalRc = base.reduce((s, d) => s + d.rc_total, 0);
    const avgRc = totalRc / n;

    const opTotals = new Map<string, number>();
    let byLabelTotal = 0;
    base.forEach((d) =>
      Object.entries(d.by_label ?? {}).forEach(([op, v]) => {
        opTotals.set(op, (opTotals.get(op) ?? 0) + v);
        byLabelTotal += v;
      })
    );
    const claimsTotal = opTotals.get(CLAIM_ACCOUNT_OP) ?? 0;
    // Organic uses the by_label sum (same basis as the treemap) so the KPI and
    // the RC-by-operation breakdown reconcile.
    const organicTotal = byLabelTotal - claimsTotal;
    const [topOp, topOpValue] = [...opTotals.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0] ?? ["", 0];
    const topOpShare = byLabelTotal > 0 ? (topOpValue / byLabelTotal) * 100 : 0;
    const peak = base.reduce((max, d) => (d.rc_total > max.rc_total ? d : max));
    const trendPct = computeTrendPct(base.map((d) => d.rc_total));
    return { totalRc, avgRc, organicTotal, topOp, topOpShare, peak, trendPct };
  }, [data, granularity]);

  if (!kpis) return null;
  const { totalRc, avgRc, organicTotal, topOp, topOpShare, peak, trendPct } =
    kpis;

  const trendSign: 1 | -1 | 0 =
    trendPct === null ? 0 : trendPct > 0 ? 1 : trendPct < 0 ? -1 : 0;
  const TrendIcon =
    trendSign > 0 ? TrendingUp : trendSign < 0 ? TrendingDown : Minus;
  const trendColor =
    trendSign > 0
      ? "text-explorer-light-green"
      : trendSign < 0
        ? "text-rose-600 dark:text-rose-400"
        : "text-gray-500";

  const peakDateFmt = granularity === "month" ? "MMM YYYY" : "MMM D, YYYY";

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.totalRc")}
          value={formatRc(totalRc, locale)}
        />
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.avgPerPeriod", {
            period: t(`common.${granularity}`),
          })}
          value={formatRc(avgRc, locale)}
        />
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.topConsumer")}
          value={topOp ? formatOpLabel(topOp) : "—"}
          sub={
            topOp
              ? `${topOpShare.toLocaleString(locale, {
                  maximumFractionDigits: 1,
                })}% ${t("networkRcUtilizationKpiStrip.ofTotal")}`
              : undefined
          }
        />
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.organicRc")}
          infoText={t("networkRcUtilizationKpiStrip.organicRcInfo")}
          value={formatRc(organicTotal, locale)}
          sub={t("networkRcUtilizationKpiStrip.exclClaims")}
        />
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.peakPeriod")}
          value={moment(peak.period).format(peakDateFmt)}
          sub={formatRc(peak.rc_total, locale)}
        />
        <KpiTile
          label={t("networkRcUtilizationKpiStrip.trend")}
          value={
            <span className={cn("inline-flex items-center gap-1", trendColor)}>
              <TrendIcon size={13} />
              {trendPct !== null
                ? `${trendPct >= 0 ? "+" : ""}${trendPct.toLocaleString(
                    locale,
                    {
                      maximumFractionDigits: 1,
                    }
                  )}%`
                : "—"}
            </span>
          }
          sub={t("networkRcUtilizationKpiStrip.vsPeriodStart")}
        />
      </div>
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  infoText?: string;
}> = ({ label, value, sub, infoText }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 uppercase tracking-wide leading-none flex items-center gap-1">
      <span>{label}</span>
      {infoText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-400 hover:text-gray-500 cursor-help flex-shrink-0">
                <Info size={10} />
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[240px] text-[11px] text-center normal-case"
              >
                {infoText}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="text-sm font-semibold leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default NetworkRcUtilizationKpiStrip;
