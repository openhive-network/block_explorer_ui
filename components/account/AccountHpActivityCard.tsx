import React, { useMemo, useState } from "react";
import moment from "moment";
import { ArrowDown, ArrowUp, Loader2, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import useAccountVestingStats from "@/hooks/api/accountPage/useAccountVestingStats";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { grabNumericValue } from "@/utils/StringUtils";
import { useI18n } from "../../i18n/i18n";

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
  const { t } = useI18n();
  const [isHidden, setIsHidden] = useState(!isInitiallyOpen);

  const { hiveChain } = useHiveChainContext();
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);

  const fromDate = useMemo(
    () => moment().subtract(90, "days").toDate(),
    []
  );

  const {
    accountVestingStats,
    isAccountVestingStatsLoading,
    isAccountVestingStatsError,
  } = useAccountVestingStats(userDetails.name, fromDate);

  const vestsToHpNumber = useMemo(() => {
    if (!hiveChain || !dynamicGlobalData) return null;
    const { rawTotalVestingFundHive, rawTotalVestingShares } =
      dynamicGlobalData.headBlockDetails;
    return (vests: Hive.Supply | null | undefined): number => {
      if (!vests || !vests.amount || vests.amount === "0") return 0;
      const hpAsset = hiveChain.vestsToHp(
        vests,
        rawTotalVestingFundHive,
        rawTotalVestingShares
      );
      return grabNumericValue(hiveChain.formatter.format(hpAsset));
    };
  }, [hiveChain, dynamicGlobalData]);

  const totals = useMemo(() => {
    if (!accountVestingStats || !vestsToHpNumber) {
      return { up: 0, down: 0, net: 0 };
    }
    const up = vestsToHpNumber(accountVestingStats.power_up_vests);
    const down = vestsToHpNumber(accountVestingStats.power_down_fill_vests);
    return { up, down, net: up - down };
  }, [accountVestingStats, vestsToHpNumber]);

  const isLoading = isAccountVestingStatsLoading || !vestsToHpNumber;
  const hasData = !!accountVestingStats && !!vestsToHpNumber;

  return (
    <Card
      data-testid="hp-activity-card"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0 mb-0">
        <div
          onClick={() => setIsHidden(!isHidden)}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          <span>{isHidden ? <ArrowDown /> : <ArrowUp />}</span>
        </div>
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
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t("accountHpActivityCard.last90Days")}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <TrendingUp size={16} className="text-emerald-500" />
                {t("accountHpActivityCard.poweredUp")}
              </span>
              <span className="font-semibold text-emerald-500">
                +
                {totals.up.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                HP
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <TrendingDown size={16} className="text-rose-500" />
                {t("accountHpActivityCard.poweredDown")}
              </span>
              <span className="font-semibold text-rose-500">
                -
                {totals.down.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                HP
              </span>
            </div>
            <div className="flex items-center justify-between text-sm border-t pt-2 dark:border-gray-700">
              <span className="text-slate-600 dark:text-slate-300">
                {t("accountHpActivityCard.netFlow")}
              </span>
              <span
                className={`font-semibold ${
                  totals.net >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {totals.net >= 0 ? "+" : ""}
                {totals.net.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                HP
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountHpActivityCard;
