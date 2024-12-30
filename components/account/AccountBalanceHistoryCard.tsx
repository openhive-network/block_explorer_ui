import React, { useState, useMemo,MouseEvent } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import Link from "next/link";
import useBalanceHistory from "@/hooks/api/balanceHistory/useBalanceHistory";
import BalanceHistoryChart from "../balanceHistory/BalanceHistoryChart";
import moment from "moment";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

// Define the type for balance operation data
type AccountBalanceHistoryCardProps = {
  header: string;
  userDetails: Explorer.FormattedAccountDetails;
};

const AccountBalanceHistoryCard: React.FC<AccountBalanceHistoryCardProps> = ({
  header,
  userDetails,
}) => {
  const [isBalancesHidden, setIsBalancesHidden] = useState(false);
  const defaultFromDate = useMemo(
    () => moment().subtract(1, "month").toDate(),
    []
  );
  const router = useRouter();
  const accountNameFromRoute = (router.query.accountName as string)?.slice(1);

  const {
    accountBalanceHistory: hiveBalanceHistory,
    isAccountBalanceHistoryLoading: hiveBalanceHistoryLoading,
    isAccountBalanceHistoryError: hiveBalanceHistoryError,
  } = useBalanceHistory(
    accountNameFromRoute,
    "HIVE",
    undefined,
    undefined,
    "desc",
    defaultFromDate
  );

  const {
    accountBalanceHistory: vestsBalanceHistory,
    isAccountBalanceHistoryLoading: vestsBalanceHistoryLoading,
    isAccountBalanceHistoryError: vestsBalanceHistoryError,
  } = useBalanceHistory(
    accountNameFromRoute,
    "VESTS",
    undefined,
    undefined,
    "desc",
    defaultFromDate
  );

  const {
    accountBalanceHistory: hbdBalanceHistory,
    isAccountBalanceHistoryLoading: hbdBalanceHistoryLoading,
    isAccountBalanceHistoryError: hbdBalanceHistoryError,
  } = useBalanceHistory(
    accountNameFromRoute,
    "HBD",
    undefined,
    undefined,
    "desc",
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
    hiveBalanceHistory?.operations_result?.length > 0 ||
    vestsBalanceHistory?.operations_result?.length > 0 ||
    hbdBalanceHistory?.operations_result?.length > 0;
  const hasError =
    hiveBalanceHistoryError ||
    vestsBalanceHistoryError ||
    hbdBalanceHistoryError;

    const prepareData = (
      operations: { timestamp: string; balance: number }[]
    ) => {
      if (!operations || operations.length === 0) return []
      
      const dailyData = new Map<string, { balance: number; balance_change: number }>

      operations.forEach((operation: any) => {
        let date;
        if (typeof operation.timestamp === 'string') {
          date = new Date(operation.timestamp);
        } else if (typeof operation.timestamp === 'number') {
          date = new Date(operation.timestamp * 1000);
        } else {
          return;
        }
    
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0];
    
          let balance_change = parseInt(operation.balance_change, 10);
          let balance = parseInt(operation.balance, 10);
    
          if (dailyData.has(dateString)) {
            dailyData.get(dateString)!.balance_change += balance_change;
            dailyData.get(dateString)!.balance = balance;
          } else {
            dailyData.set(dateString, { balance, balance_change });
          }
        }
      });
    
      const preparedData = Array.from(dailyData.entries()).map(([date, data]) => ({
        timestamp: date,
        balance: data.balance,
        balance_change: data.balance_change,
      }));
    
      return preparedData;
    };



  // Reverse and prepare data with useMemo
  const reversedHiveBalanceHistory = useMemo(
    () =>
      prepareData(
        Array.isArray(hiveBalanceHistory?.operations_result)
          ? [...hiveBalanceHistory.operations_result].reverse()
          : []
      ),
    [hiveBalanceHistory?.operations_result]
  );

  const reversedVestsBalanceHistory = useMemo(
    () =>
      prepareData(
        Array.isArray(vestsBalanceHistory?.operations_result)
          ? [...vestsBalanceHistory.operations_result].reverse()
          : []
      ),
    [vestsBalanceHistory?.operations_result]
  );

  const reversedHbdBalanceHistory = useMemo(
    () =>
      prepareData(
        Array.isArray(hbdBalanceHistory?.operations_result)
          ? [...hbdBalanceHistory.operations_result].reverse()
          : []
      ),
    [hbdBalanceHistory?.operations_result]
  );


  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevents the event from bubbling up
    router.push(`/balanceHistory/@${userDetails.name}`); // Navigate programmatically
  };

  return (
    <Card data-testid="properties-dropdown" className="overflow-hidden pb-0">
      <CardHeader className="p-0">
        <div
          onClick={handleBalancesVisibility}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
         
         
            <span>{isBalancesHidden ? <ArrowDown /> : <ArrowUp />}</span>
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
        {!isLoading && !hasData && (
          <p className="text-sm text-center">No balance information found.</p>
        )}
        {!isLoading && hasData && (
          <BalanceHistoryChart
            hiveBalanceHistoryData={reversedHiveBalanceHistory}
            vestsBalanceHistoryData={reversedVestsBalanceHistory}
            hbdBalanceHistoryData={reversedHbdBalanceHistory}
            quickView={true}
            className="h-[340px]"
          />
        )}
        <div className="flex">
        <button
            onClick={handleButtonClick}
            className="bg-explorer-orange text-explorer-gray-light dark:explorer-gray-dark rounded p-2 ml-4"
          >
            Full Chart
          </button>
          </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalanceHistoryCard;
