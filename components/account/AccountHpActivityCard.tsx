import React, { MouseEvent, useMemo, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Loader2,
  Maximize2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import useAccountVestingStats from "@/hooks/api/accountPage/useAccountVestingStats";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { useI18n } from "../../i18n/i18n";

import HpMomentumChart from "../home/HpMomentumChart";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
  formatCompact,
  useAggregatedVesting,
  useVestingDisplayUnit,
} from "../home/hpMomentumUtils";

type AccountHpActivityCardProps = {
  header: string;
  userDetails: Explorer.FormattedAccountDetails;
  isInitiallyOpen: boolean;
};

const AccountHpActivityCard: React.FC<AccountHpActivityCardProps> = ({
  header,
  userDetails,
  isInitiallyOpen,
}) => {
  const { t, locale } = useI18n();
  const { settings } = useSettings();
  const router = useRouter();
  const [isHidden, setIsHidden] = useState(!isInitiallyOpen);

  const [unit, setUnit] = useVestingDisplayUnit();

  const fromDate = useMemo(() => moment().subtract(30, "days").toDate(), []);

  const {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  } = useAccountVestingStats(
    userDetails.name,
    "daily",
    fromDate,
    undefined,
    "asc",
    settings.liveData
  );

  const { chartData, totals, isReady } = useAggregatedVesting(
    accountVestingStats,
    unit
  );

  const isLoading = isAccountVestingStatsLoading || !isReady;
  const hasData = chartData.length > 0;
  const unitLabel = unit === "hp" ? "HP" : "VESTS";
  const netIsPositive = totals.net >= 0;

  const unitOptions: { key: VestingDisplayUnit; label: string }[] = [
    { key: "hp", label: "HP" },
    { key: "vests", label: "VESTS" },
  ];

  const handleFullChartClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/@${userDetails.name}?activeTab=power-activity`);
  };

  return (
    <Card data-testid="hp-activity-card" className="overflow-hidden pb-0">
      <CardHeader className="p-0 mb-2">
        <div
          onClick={() => setIsHidden(!isHidden)}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          <span>{isHidden ? <ArrowDown /> : <ArrowUp />}</span>
        </div>

        {!isHidden && (
          <div className="flex justify-end items-end w-full px-4">
            <button
              type="button"
              onClick={handleFullChartClick}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-navbar-border",
                "bg-theme text-text px-3 py-1 text-xs font-medium",
                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              )}
            >
              <Maximize2 size={12} />
              {t("common.fullChart")}
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent
        hidden={isHidden}
        data-testid="hp-activity-content"
        className="p-4 pt-2"
      >
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        )}
        {!isLoading && isAccountVestingStatsError && (
          <p className="text-sm text-center text-red-500">
            {t("common.errorLoadingData")}
          </p>
        )}
        {!isLoading && !isAccountVestingStatsError && hasData && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {t("accountHpActivityCard.last30Days")}
              </p>
              <div
                className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden text-xs"
                role="group"
                aria-label="HP or VESTS"
              >
                {unitOptions.map((opt, idx) => {
                  const isActive = unit === opt.key;
                  const isFirst = idx === 0;
                  const isLast = idx === unitOptions.length - 1;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnit(opt.key);
                      }}
                      aria-pressed={isActive}
                      className={cn(
                        "font-medium transition-colors px-2.5 py-0.5",
                        !isLast && "border-r border-navbar-border",
                        isFirst && "rounded-l-full",
                        isLast && "rounded-r-full",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-[210px] w-full">
              <HpMomentumChart
                data={chartData}
                unit={unit}
                tickCount={4}
                dateFormat="MMM D"
              />
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                {
                  Icon: TrendingUp,
                  color: VESTING_COLORS.up,
                  label: t("accountHpActivityCard.poweredUp"),
                  value: totals.up,
                  count: totals.upCount,
                  sign: "+",
                },
                {
                  Icon: Clock,
                  color: VESTING_COLORS.downInit,
                  label: t("accountHpActivityCard.scheduledDown"),
                  value: totals.downInit,
                  count: totals.downInitCount,
                  sign: "",
                },
                {
                  Icon: TrendingDown,
                  color: VESTING_COLORS.downFill,
                  label: t("accountHpActivityCard.poweredDown"),
                  value: totals.downFill,
                  count: totals.downFillCount,
                  sign: "-",
                },
              ].map(({ Icon, color, label, value, count, sign }) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Icon size={15} color={color} className="shrink-0" />
                    {label}
                  </span>
                  <span className="ml-auto flex items-baseline gap-1.5 whitespace-nowrap">
                    <span
                      className="font-semibold tabular-nums"
                      style={{ color }}
                      title={`${sign}${value.toLocaleString()} ${unitLabel}`}
                    >
                      {sign}
                      {formatCompact(value, locale)} {unitLabel}
                    </span>
                    <span className="text-[11px] text-gray-400 tabular-nums">
                      ({count.toLocaleString()} {t("accountHpActivityCard.ops")}
                      )
                    </span>
                  </span>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-200 pt-2.5 dark:border-gray-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {t("accountHpActivityCard.netFlow", { unit: unitLabel })}
                </span>
                <span
                  className="ml-auto text-sm font-bold tabular-nums whitespace-nowrap"
                  style={{
                    color: netIsPositive
                      ? VESTING_COLORS.up
                      : VESTING_COLORS.downFill,
                  }}
                  title={`${netIsPositive ? "+" : ""}${totals.net.toLocaleString()} ${unitLabel}`}
                >
                  {netIsPositive ? "+" : ""}
                  {formatCompact(totals.net, locale)} {unitLabel}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountHpActivityCard;
