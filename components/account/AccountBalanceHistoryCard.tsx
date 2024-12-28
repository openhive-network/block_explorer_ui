import React, { useState, useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Explorer from "@/types/Explorer";
import Link from "next/link";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
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

  // Reverse the vestsBalanceHistory data with useMemo
  const reversedVestsBalanceHistory = useMemo(() => {
    return Array.isArray(vestsBalanceHistory?.operations_result)
      ? [...vestsBalanceHistory.operations_result].reverse()
      : [];
  }, [vestsBalanceHistory?.operations_result]);

  // Reverse the hiveBalanceHistory data with useMemo
  const reversedHiveBalanceHistory = useMemo(() => {
    return Array.isArray(hiveBalanceHistory?.operations_result)
      ? [...hiveBalanceHistory.operations_result].reverse()
      : [];
  }, [hiveBalanceHistory?.operations_result]);

  // Reverse the hbdBalanceHistory data with useMemo
  const reversedHbdBalanceHistory = useMemo(() => {
    return Array.isArray(hbdBalanceHistory?.operations_result)
      ? [...hbdBalanceHistory.operations_result].reverse()
      : [];
  }, [hbdBalanceHistory?.operations_result]);

  return (
    <Card data-testid="properties-dropdown" className="overflow-hidden pb-0">
      <CardHeader className="p-0">
        <div
          onClick={handleBalancesVisibility}
          className="flex justify-between items-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          <div className="flex">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/balanceHistory/@${userDetails.name}`}
                    data-testid="balance-history-link"
                    className="text-link text-sm underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Details</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  align="start"
                  sideOffset={5}
                  alignOffset={10}
                  className="border-0"
                >
                  <div className="bg-theme text-text p-2 text-sm">
                    <p>Click Here for Balance History</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>{isBalancesHidden ? <ArrowDown /> : <ArrowUp />}</span>
          </div>
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
      </CardContent>
    </Card>
  );
};

export default AccountBalanceHistoryCard;
