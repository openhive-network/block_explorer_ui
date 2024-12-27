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
  const defaultFromDate = React.useMemo(
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
    "asc",
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
    "asc",
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
    "asc",
    defaultFromDate
  );

  const staticData = [
    { timestamp: "2023-01-01", balance: 100 },
    { timestamp: "2023-02-01", balance: 110 },
    { timestamp: "2023-03-01", balance: 120 },
  ];


  const handleBalancesVisibility = () => {
    setIsBalancesHidden(!isBalancesHidden);
  };

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
                  side="top"
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
      <CardContent hidden={isBalancesHidden} data-testid="balance-history-content">
        <BalanceHistoryChart
          hiveBalanceHistoryData={hiveBalanceHistory?.operations_result || []}
          vestsBalanceHistoryData={vestsBalanceHistory?.operations_result || []}
          hbdBalanceHistoryData={hbdBalanceHistory?.operations_result || []}
          quickView={true}
 className="h-[340px]"
        />
       
      </CardContent>
    </Card>
  );
};

export default AccountBalanceHistoryCard;
