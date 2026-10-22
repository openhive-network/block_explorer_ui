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
import Hive from "@/types/Hive";
import KpiTile from "@/components/ui/KpiTile";
import { useI18n } from "@/i18n/i18n";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
  VestingTotals,
  formatVestingAmount,
} from "@/components/home/hpMomentumUtils";

interface PowerActivityKpiStripProps {
  totals: VestingTotals;
  unit: VestingDisplayUnit;
  filter: Hive.VestingHistoryFilter;
  onFilterChange: (filter: Hive.VestingHistoryFilter) => void;
}

const PowerActivityKpiStrip: React.FC<PowerActivityKpiStripProps> = ({
  totals,
  unit,
  filter,
  onFilterChange,
}) => {
  const { t, locale } = useI18n();
  const filterProps = (tileFilter: Hive.VestingHistoryFilter) => ({
    isActive: filter === tileFilter && tileFilter !== "all",
    onClick: () => onFilterChange(filter === tileFilter ? "all" : tileFilter),
  });
  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  const downFillSign = totals.downFill > 0 ? "-" : "";
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
        {...filterProps("all")}
        valueClassName={cn(
          netSign > 0 && "text-emerald-600 dark:text-emerald-400",
          netSign < 0 && "text-rose-600 dark:text-rose-400",
          netSign === 0 && "text-gray-600 dark:text-gray-300"
        )}
        value={
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <TrendIcon size={14} color={trendColor} />
            <span
              title={`${netSign >= 0 ? "+" : ""}${totals.net.toLocaleString(locale)} ${unitLabel}`}
            >
              {netSign >= 0 ? "+" : ""}
              {formatVestingAmount(totals.net, locale)} {unitLabel}
            </span>
          </span>
        }
      />
      <KpiTile
        label={t("accountHpActivityCard.poweredUp")}
        {...filterProps("power_up")}
        icon={<TrendingUp size={14} color={VESTING_COLORS.up} />}
        valueClassName="text-emerald-600 dark:text-emerald-400"
        value={
          <span title={`+${totals.up.toLocaleString(locale)} ${unitLabel}`}>
            +{formatVestingAmount(totals.up, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.upCount.toLocaleString(locale)} ${t("hpMomentumCard.ops")}`}
      />
      <KpiTile
        label={t("accountHpActivityCard.scheduledDown")}
        {...filterProps("power_down_init")}
        icon={<Clock size={14} color={VESTING_COLORS.downInit} />}
        valueClassName="text-amber-600 dark:text-amber-400"
        value={
          <span
            title={`${totals.downInit.toLocaleString(locale)} ${unitLabel}`}
          >
            {formatVestingAmount(totals.downInit, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.downInitCount.toLocaleString(locale)} ${t("hpMomentumCard.ops")}`}
      />
      <KpiTile
        label={t("accountHpActivityCard.poweredDown")}
        {...filterProps("power_down_fill")}
        icon={<TrendingDown size={14} color={VESTING_COLORS.downFill} />}
        valueClassName="text-rose-600 dark:text-rose-400"
        value={
          <span
            title={`${downFillSign}${totals.downFill.toLocaleString(locale)} ${unitLabel}`}
          >
            {downFillSign}
            {formatVestingAmount(totals.downFill, locale)} {unitLabel}
          </span>
        }
        sub={`${totals.downFillCount.toLocaleString(locale)} ${t("hpMomentumCard.ops")}`}
      />
    </div>
  );
};

export default PowerActivityKpiStrip;
