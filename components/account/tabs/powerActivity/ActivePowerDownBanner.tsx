import React, { useMemo } from "react";
import moment from "moment";
import { Clock } from "lucide-react";

import { useI18n } from "@/i18n/i18n";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import { grabNumericValue } from "@/utils/StringUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { cn } from "@/lib/utils";
import Hive from "@/types/Hive";
import {
  VESTING_COLORS,
  VestingDisplayUnit,
  formatCompact,
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
  const { t } = useI18n();
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal();
  const { accountDetails } = useAccountDetails(accountName, false);

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
    // All three are raw VESTS integers from the account API; divide by 1e6
    // (VESTS precision) so rate/to_withdraw/withdrawn share the same units.
    const rate =
      grabNumericValue(accountDetails.vesting_withdraw_rate) / 1_000_000;
    const toWithdraw = grabNumericValue(accountDetails.to_withdraw) / 1_000_000;
    const withdrawn = grabNumericValue(accountDetails.withdrawn) / 1_000_000;

    if (!rate || rate <= 0) return null;

    const remainingVests = Math.max(toWithdraw - withdrawn, 0);
    // Hive pays a power-down over a fixed 13 weekly tranches; deriving the
    // total from to_withdraw/rate overshoots to 14 because the on-chain rate
    // is to_withdraw/13 floored, so anchor the total to the protocol constant.
    const weeksDone = Math.min(Math.round(withdrawn / rate), POWER_DOWN_WEEKS);
    const weeksRemaining = Math.max(0, POWER_DOWN_WEEKS - weeksDone);
    const progressPct =
      toWithdraw > 0 ? Math.min(100, (withdrawn / toWithdraw) * 100) : 0;
    const eta = moment().add(weeksRemaining, "weeks");

    return {
      weeklyAmount: vestsToDisplay(rate),
      remainingAmount: vestsToDisplay(remainingVests),
      totalAmount: vestsToDisplay(toWithdraw),
      weeksDone,
      weeksTotal: POWER_DOWN_WEEKS,
      progressPct,
      etaLabel: eta.format("MMM D, YYYY"),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountDetails, unit, hiveChain, dynamicGlobalData]);

  if (!stats) return null;

  const unitLabel = unit === "hp" ? "HP" : "VESTS";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center",
        "bg-amber-50/60 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20"
      )}
      role="status"
    >
      <div className="flex items-center gap-2 shrink-0">
        <Clock size={16} color={VESTING_COLORS.downInit} />
        <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          {t("powerActivityBanner.title")}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-xs text-amber-900/80 dark:text-amber-200/80">
          <span>
            <span className="font-mono font-medium">{stats.weeksDone}</span>
            {" / "}
            <span className="font-mono font-medium">
              {stats.weeksTotal}
            </span>{" "}
            {t("powerActivityBanner.weeks")}
          </span>
          <span>
            <span className="font-mono font-medium">
              {formatCompact(stats.weeklyAmount)} {unitLabel}
            </span>{" "}
            {t("powerActivityBanner.perWeek")}
          </span>
          <span>
            {t("powerActivityBanner.remaining")}{" "}
            <span className="font-mono font-medium">
              {formatCompact(stats.remainingAmount)} {unitLabel}
            </span>
          </span>
          <span>
            {t("powerActivityBanner.eta")}{" "}
            <span className="font-medium">{stats.etaLabel}</span>
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-amber-200/60 dark:bg-amber-900/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500"
            style={{ width: `${stats.progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivePowerDownBanner;
