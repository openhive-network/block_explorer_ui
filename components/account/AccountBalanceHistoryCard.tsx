import React, { useState, useMemo, MouseEvent } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import BalanceHistoryChart from "../balanceHistory/BalanceHistoryChart";
import moment from "moment";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import NoResult from "../NoResult";
import { Button } from "../ui/button";
import useAggregatedBalanceHistory from "@/hooks/api/balanceHistory/useAggregatedHistory";
import { Operation } from "@/pages/balanceHistory/[accountName]";

// Define the type for balance operation data
type AccountBalanceHistoryCardProps = {
  header: string;
  userDetails: Explorer.FormattedAccountDetails;
};

const prepareData = (operations: Operation[]) => {
  if (!operations || operations.length === 0) return [];

  const aggregatedData = new Map<
    string,
    {
      balance: number;
      balance_change: number;
      savings_balance: number | undefined;
      savings_balance_change: number | undefined;
    }
  >();

  operations.forEach((operation: any) => {
    let balance_change =
      operation.balance.balance - operation.prev_balance.balance;
    let balance = parseInt(operation.balance.balance, 10);
    let savings_balance = operation.balance.savings_balance
      ? parseInt(operation.balance.savings_balance, 10)
      : undefined;
    let savings_balance_change =
      operation.balance.savings_balance -
      operation.prev_balance.savings_balance;
    aggregatedData.set(operation.date, {
      balance,
      balance_change,
      savings_balance,
      savings_balance_change,
    });
  });

  const preparedData = Array.from(aggregatedData.entries()).map(
    ([date, data]) => ({
      timestamp: date,
      balance: data.balance,
      balance_change: data.balance_change,
      savings_balance: data.savings_balance,
      savings_balance_change: data.savings_balance_change,
    })
  );

  return preparedData;
};

const AccountBalanceHistoryCard: React.FC<AccountBalanceHistoryCardProps> = ({
  header,
  userDetails,
}) => {
  const [isBalancesHidden, setIsBalancesHidden] = useState(false);
  const [coinType, setCoinType] = useState("HIVE");
  const defaultFromDate = useMemo(
    () => moment().subtract(1, "month").toDate(),
    []
  );
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);

  const {
    aggregatedAccountBalanceHistory: hiveBalanceHistory,
    isAggregatedAccountBalanceHistoryLoading: hiveBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryError: hiveBalanceHistoryError,
  } = useAggregatedBalanceHistory(
    accountNameFromRoute,
    "HIVE",
    "daily",
    "asc",
    defaultFromDate
  );

  const {
    aggregatedAccountBalanceHistory: vestsBalanceHistory,
    isAggregatedAccountBalanceHistoryLoading: vestsBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryError: vestsBalanceHistoryError,
  } = useAggregatedBalanceHistory(
    accountNameFromRoute,
    "VESTS",
    "daily",
    "asc",
    defaultFromDate
  );

  const {
    aggregatedAccountBalanceHistory: hbdBalanceHistory,
    isAggregatedAccountBalanceHistoryLoading: hbdBalanceHistoryLoading,
    isAggregatedAccountBalanceHistoryError: hbdBalanceHistoryError,
  } = useAggregatedBalanceHistory(
    accountNameFromRoute,
    "HBD",
    "daily",
    "asc",
    defaultFromDate
  );

  const handleBalancesVisibility = () => {
    setIsBalancesHidden(!isBalancesHidden);
  };

  const isLoading =
    hiveBalanceHistoryLoading ||
    vestsBalanceHistoryLoading ||
    hbdBalanceHistoryLoading;
  const hasData =
    hiveBalanceHistory || vestsBalanceHistory || hbdBalanceHistory;
  const hasError =
    hiveBalanceHistoryError ||
    vestsBalanceHistoryError ||
    hbdBalanceHistoryError;

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    router.push(`/balanceHistory/@${userDetails.name}`); // Navigate programmatically
  };

  return (
    <Card
      data-testid="properties-dropdown"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0 mb-2">
        <div
          onClick={handleBalancesVisibility}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>

          <span>{isBalancesHidden ? <ArrowDown /> : <ArrowUp />}</span>
        </div>

        <div className="flex justify-end items-end w-full">
          <Button
            onClick={handleButtonClick}
            className="rounded p-2 mr-4"
          >
            Full Chart
          </Button>
        </div>
      </CardHeader>
      <CardContent
        hidden={isBalancesHidden}
        data-testid="balance-history-content"
      >
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        )}
        {!isLoading && hasError && (
          <p className="text-sm text-center">
            Error loading balance information.
          </p>
        )}
        {!isLoading && !hasData && <NoResult />}
        {!isLoading && hasData && (
          <BalanceHistoryChart
            hiveBalanceHistoryData={prepareData(hiveBalanceHistory)}
            vestsBalanceHistoryData={prepareData(vestsBalanceHistory)}
            hbdBalanceHistoryData={prepareData(hbdBalanceHistory)}
            quickView={true}
            className="h-[320px]"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountBalanceHistoryCard;
