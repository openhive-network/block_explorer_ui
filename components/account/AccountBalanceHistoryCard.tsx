import React, { useState, useMemo, useEffect, MouseEvent } from "react";
import { ArrowDown, ArrowUp, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import BalanceHistoryChart from "../balanceHistory/BalanceHistoryChart";
import moment from "moment";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import NoResult from "../NoResult";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { prepareBalanceHistoryData } from "@/utils/BalanceHistoryUtils";

type AccountBalanceHistoryCardProps = {
  header: string;
  userDetails: Explorer.FormattedAccountDetails;
  isInitiallyOpen: boolean;
  accountName?: string;
};

const AccountBalanceHistoryCard: React.FC<AccountBalanceHistoryCardProps> = ({
  header,
  userDetails,
  isInitiallyOpen,
  accountName,
}) => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [isBalancesHidden, setIsBalancesHidden] = useState(!isInitiallyOpen);
  const [coinType, setCoinType] = useState("HIVE");
  const [unit, setUnit] = useState<"vests" | "hp">(
    settings.displayVestHpMode === "hp" ? "hp" : "vests"
  );

  useEffect(() => {
    setUnit(settings.displayVestHpMode === "hp" ? "hp" : "vests");
  }, [settings.displayVestHpMode]);
  const defaultFromDate = useMemo(
    () => moment().subtract(1, "month").toDate(),
    []
  );
  const router = useRouter();
  const accountNameFromRoute =
    accountName ?? (router.query.accountName as string)?.slice(1);

  const {
    aggregatedAccountBalanceHistory,
    isAggregatedAccountBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryError,
  } = useAggregatedBalanceHistory(
    accountNameFromRoute,
    coinType,
    "daily",
    "asc",
    defaultFromDate
  );

  const handleBalancesVisibility = () => {
    setIsBalancesHidden(!isBalancesHidden);
  };

  const isLoading = isAggregatedAccountBalanceHistoryLoading;
  const hasData = aggregatedAccountBalanceHistory;
  const hasError = isAggregatedAccountBalanceHistoryError;

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    router.push(`/balanceHistory/@${userDetails.name}`); // Navigate programmatically
  };

  return (
    <Card data-testid="properties-dropdown" className="overflow-hidden pb-0">
      <CardHeader className="p-0 mb-2">
        <div
          onClick={handleBalancesVisibility}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>

          <span>{isBalancesHidden ? <ArrowDown /> : <ArrowUp />}</span>
        </div>

        <div className="flex justify-end items-end w-full px-4">
          <button
            type="button"
            onClick={handleButtonClick}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-navbar-border",
              "bg-theme text-text px-3 py-1 text-xs font-medium",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            )}
          >
            <Maximize2 size={12} />
            {t("accountBalanceHistoryCard.fullChart")}
          </button>
        </div>
      </CardHeader>
      <CardContent
        hidden={isBalancesHidden}
        data-testid="balance-history-content"
        className="p-0"
      >
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        )}
        {!isLoading && hasError && (
          <p className="text-sm text-center">
            {t("accountBalanceHistoryCard.error")}
          </p>
        )}
        {!isLoading && !hasData && <NoResult />}
        {!isLoading && hasData && (
          <BalanceHistoryChart
            aggregatedAccountBalanceHistory={prepareBalanceHistoryData(
              aggregatedAccountBalanceHistory
            )}
            quickView={true}
            className="h-[430px]"
            selectedCoinType={coinType}
            setSelectedCoinType={setCoinType}
            unit={unit}
            setUnit={setUnit}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountBalanceHistoryCard;
