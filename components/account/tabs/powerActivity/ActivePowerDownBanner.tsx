import React, { useMemo } from "react";
import Link from "next/link";
import HiveAvatar from "@/components/ui/HiveAvatar";
import moment from "moment";
import { Clock } from "lucide-react";

import { useI18n } from "@/i18n/i18n";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import useAccountWithdrawRoutes from "@/hooks/api/accountPage/useAccountWithdrawRoutes";
import { grabNumericValue } from "@/utils/StringUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { parseChainDate } from "@/utils/TimeUtils";
import { cn, formatPercent } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Hive from "@/types/Hive";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
  formatVestingAmount,
} from "@/components/home/hpMomentumUtils";

interface ActivePowerDownBannerProps {
  accountName: string;
  unit: VestingDisplayUnit;
}

// Hive's power-down schedule pays out one tranche per week over 13 weeks.
const POWER_DOWN_WEEKS = 13;

const ActivePowerDownBanner: React.FC<ActivePowerDownBannerProps> = ({
  accountName,
  unit,
}) => {
  const { t, locale } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const { accountDetails } = useAccountDetails(accountName, false);
  const { withdrawRoutes } = useAccountWithdrawRoutes(accountName, false);

  // Convert a VESTS quantity (as a plain number in VESTS units) to either
  // VESTS or HP for display. HP path delegates to the shared convertVestsToHP
  // util so the conversion stays consistent with the rest of the app.
  const vestsToDisplay = (vestsAmount: number): number => {
    if (!vestsAmount) return 0;
    if (unit === "vests") return vestsAmount;
    if (!hiveChain || !dynamicGlobalData) return 0;
    const supply: Hive.Supply = {
      amount: String(Math.round(vestsAmount * 1_000_000)),
      precision: 6,
      nai: "@@000000037",
    };
    const formatted = convertVestsToHP(
      hiveChain,
      supply,
      dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
      dynamicGlobalData.headBlockDetails.rawTotalVestingShares
    );
    return formatted ? grabNumericValue(formatted) : 0;
  };

  const stats = useMemo(() => {
    if (!accountDetails) return null;
    const isPoweringDown =
      grabNumericValue(accountDetails.vesting_withdraw_rate) > 0;
    if (!isPoweringDown) return null;

    const toWithdraw = grabNumericValue(accountDetails.to_withdraw) / 1_000_000;
    const withdrawn = grabNumericValue(accountDetails.withdrawn) / 1_000_000;
    if (toWithdraw <= 0) return null;

    // Hive pays a power-down over a fixed 13 weekly tranches, so derive the
    // weekly amount from to_withdraw rather than the rate field.
    const weeklyRateVests = toWithdraw / POWER_DOWN_WEEKS;
    const remainingVests = Math.max(toWithdraw - withdrawn, 0);
    const weeksDone = Math.min(
      Math.round(withdrawn / weeklyRateVests),
      POWER_DOWN_WEEKS
    );
    const weeksRemaining = Math.max(0, POWER_DOWN_WEEKS - weeksDone);
    const nextPayment = parseChainDate(accountDetails.next_vesting_withdrawal);
    const eta = nextPayment
      ? moment(nextPayment).add(Math.max(weeksRemaining - 1, 0), "weeks")
      : moment().add(weeksRemaining, "weeks");

    return {
      weeklyAmount: vestsToDisplay(weeklyRateVests),
      remainingAmount: vestsToDisplay(remainingVests),
      totalAmount: vestsToDisplay(toWithdraw),
      weeksDone,
      weeksTotal: POWER_DOWN_WEEKS,
      etaLabel: eta.locale(locale).format("MMM D, YYYY"),
      paymentDates: Array.from({ length: POWER_DOWN_WEEKS }, (_, week) =>
        nextPayment
          ? moment(nextPayment)
              .add(week - weeksDone, "weeks")
              .locale(locale)
              .format("MMM D, YYYY")
          : null
      ),
      nextPaymentLabel: nextPayment
        ? moment(nextPayment).locale(locale).format("MMM D, YYYY")
        : null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails, unit, hiveChain, dynamicGlobalData, locale]);

  if (!stats) return null;

  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  // Whatever the routes leave over is paid to the account itself as HIVE,
  // merged into a route the account already has to itself as HIVE.
  const routes = (withdrawRoutes ?? []).map((route) => ({
    name: route.to_account,
    percent: route.percent,
    asset: route.auto_vest ? "HP" : "HIVE",
  }));
  const leftover =
    10000 - routes.reduce((sum, route) => sum + route.percent, 0);
  if (routes.length && leftover > 0) {
    const self = routes.find(
      (route) => route.name === accountName && route.asset === "HIVE"
    );
    if (self) self.percent += leftover;
    else routes.push({ name: accountName, percent: leftover, asset: "HIVE" });
  }

  const cells = [
    {
      label: t("powerActivityBanner.perWeek"),
      value: `${formatVestingAmount(stats.weeklyAmount, locale)} ${unitLabel}`,
    },
    {
      label: t("powerActivityBanner.remaining"),
      value: `${formatVestingAmount(stats.remainingAmount, locale)} ${unitLabel}`,
    },
    ...(stats.nextPaymentLabel
      ? [
          {
            label: t("powerActivityBanner.nextPayment"),
            value: stats.nextPaymentLabel,
          },
        ]
      : []),
    { label: t("powerActivityBanner.eta"), value: stats.etaLabel },
  ];

  return (
    <div
      className="rounded-lg border px-3 py-2.5 mb-4 flex flex-col gap-2 bg-amber-50/60 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-900 dark:text-amber-200"
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Clock size={16} color={VESTING_COLORS.downInit} />
          {t("powerActivityBanner.title")}
        </span>
        {routes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-amber-900/60 dark:text-amber-200/60">
              {t("powerActivityBanner.paidTo")}
            </span>
            {routes.map((route) => (
              <Link
                key={`${route.name}-${route.asset}`}
                href={`/@${route.name}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-white/70 py-0.5 ps-0.5 pe-2.5 text-xs hover:bg-white dark:border-amber-500/30 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <HiveAvatar accountName={route.name} size={20} />
                <span className="text-link font-medium">{route.name}</span>
                <span className="font-semibold tabular-nums">
                  {formatPercent(route.percent, locale)}
                </span>
                <span className="rounded bg-amber-500/15 px-1 text-[10px] font-semibold">
                  {route.asset}
                </span>
              </Link>
            ))}
          </div>
        )}
        <span className="ms-auto text-xs font-medium">
          {stats.weeksDone.toLocaleString(locale)} /{" "}
          {stats.weeksTotal.toLocaleString(locale)}{" "}
          {t("powerActivityBanner.weeks")}
        </span>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
        {cells.map((cell) => (
          <div key={cell.label}>
            <dt className="text-[11px] uppercase tracking-wide text-amber-900/60 dark:text-amber-200/60">
              {cell.label}
            </dt>
            <dd className="text-sm font-semibold tabular-nums">{cell.value}</dd>
          </div>
        ))}
      </dl>

      <TooltipProvider>
        <div className="flex w-full gap-0.5">
          {stats.paymentDates.map((date, week) => (
            <Tooltip key={week}>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="flex-1 cursor-default py-0.5">
                  <span
                    className={cn(
                      "block h-1.5 rounded-full",
                      week < stats.weeksDone
                        ? "bg-amber-500"
                        : "bg-amber-200/60 dark:bg-amber-900/40"
                    )}
                  />
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-theme text-text text-xs">
                  {date && `${date} · `}
                  {formatVestingAmount(stats.weeklyAmount, locale)} {unitLabel}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ActivePowerDownBanner;
