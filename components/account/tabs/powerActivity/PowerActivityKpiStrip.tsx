import React from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
  VestingTotals,
  formatCompact,
} from "@/components/home/hpMomentumUtils";

interface PowerActivityKpiStripProps {
  totals: VestingTotals;
  unit: VestingDisplayUnit;
}

const PowerActivityKpiStrip: React.FC<PowerActivityKpiStripProps> = ({
  totals,
  unit,
}) => {
  const { t, locale } = useI18n();
  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  const netSign: 1 | -1 | 0 = totals.net > 0 ? 1 : totals.net < 0 ? -1 : 0;
  const TrendIcon = netSign > 0 ? ArrowUp : netSign < 0 ? ArrowDown : Minus;
  const trendColor =
    netSign > 0
      ? VESTING_COLORS.up
      : netSign < 0
        ? VESTING_COLORS.downFill
        : "#6b7280";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      <KpiTile
        label={t("hpMomentumChart.netFlow")}
        valueClassName={cn(
          netSign > 0 && "text-emerald-600 dark:text-emerald-400",
          netSign < 0 && "text-rose-600 dark:text-rose-400",
          netSign === 0 && "text-gray-600 dark:text-gray-300"
        )}
        value={
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <TrendIcon size={14} color={trendColor} />
            <span
              title={`${netSign >= 0 ? "+" : ""}${totals.net.toLocaleString()} ${unitLabel}`}
            >
              {netSign >= 0 ? "+" : ""}
              {formatCompact(totals.net, locale)} {unitLabel}
            </span>
          </span>
        }
      />
      <KpiTile
        label={t("accountHpActivityCard.poweredUp")}
        icon={<TrendingUp size={14} color={VESTING_COLORS.up} />}
        valueClassName="text-emerald-600 dark:text-emerald-400"
        value={
          <span title={`+${totals.up.toLocaleString()} ${unitLabel}`}>
            +{formatCompact(totals.up, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.upCount.toLocaleString()} ${t("hpMomentumCard.ops")}`}
      />
      <KpiTile
        label={t("accountHpActivityCard.scheduledDown")}
        icon={<Clock size={14} color={VESTING_COLORS.downInit} />}
        valueClassName="text-amber-600 dark:text-amber-400"
        value={
          <span title={`${totals.downInit.toLocaleString()} ${unitLabel}`}>
            {formatCompact(totals.downInit, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.downInitCount.toLocaleString()} ${t("hpMomentumCard.ops")}`}
      />
      <KpiTile
        label={t("accountHpActivityCard.poweredDown")}
        icon={<TrendingDown size={14} color={VESTING_COLORS.downFill} />}
        valueClassName="text-rose-600 dark:text-rose-400"
        value={
          <span title={`-${totals.downFill.toLocaleString()} ${unitLabel}`}>
            -{formatCompact(totals.downFill, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.downFillCount.toLocaleString()} ${t("hpMomentumCard.ops")}`}
      />
    </div>
  );
};

const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}> = ({ label, value, sub, icon, valueClassName }) => (
  <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1 uppercase tracking-wide">
      {icon}
      <span>{label}</span>
    </div>
    <div
      className={cn(
        "text-sm font-semibold leading-tight whitespace-nowrap",
        valueClassName
      )}
    >
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default PowerActivityKpiStrip;
