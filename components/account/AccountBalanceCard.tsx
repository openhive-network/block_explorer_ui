import { Fragment, useState, useEffect } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import VestsTooltip from "../VestsTooltip";
import Explorer from "@/types/Explorer";
import { changeHBDToDollarsDisplay, grabNumericValue } from "@/utils/StringUtils";
import { cn, formatNumber } from "@/lib/utils";

type AccountBalanceCardProps = {
  header: string;
  userDetails: Explorer.FormattedAccountDetails;
};

const cardNameMap = new Map([
  ["hbd_balance", "HBD Liquid"],
  ["hbd_saving_balance", "HBD Savings"],
  ["reward_hbd_balance", "HBD Unclaimed"],
  ["balance", "HIVE Liquid"],
  ["savings_balance", "HIVE Savings"],
  ["reward_hive_balance", "HIVE Unclaimed"],
  ["vesting_shares", "Owned HP"],
  ["reward_vesting_balance", "HP Unclaimed"],
  ["received_vesting_shares", "Received HP"],
  ["delegated_vesting_shares", "Delegated HP"],
  ["vesting_withdraw_rate", "Powering down HP"],
]);

const unclaimedRecourses = new Map([
  ["reward_hbd_balance", "has_hbd_reward"],
  ["reward_hive_balance", "has_hive_reward"],
  ["reward_vesting_balance", "has_vesting_reward"],
]);

/* list of fields to be skipped when calculating account value */
const skipCalculation = 
  ["delegated_vesting_shares",
  "received_vesting_shares"];

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  header,
  userDetails,
}) => {
  const keys = Object.keys(
    userDetails
  ) as (keyof Explorer.AccountDetailsDollars)[];

  const checkForMarkedRender = (param: keyof Explorer.AccountDetailsDollars): boolean => {
    if (!unclaimedRecourses.has(param)) return false;
    const rewardParamName = unclaimedRecourses.get(param) as keyof Explorer.FormattedAccountDetails;
    if (rewardParamName && userDetails[rewardParamName]) return true;
    return false;
  }

  const renderKey = (key: keyof Explorer.FormattedAccountDetails) => {
    if (Object.keys(userDetails.vests).includes(key)) {
      const vestKey = key as keyof Explorer.AccountDetailsVests;
      const vestValue = userDetails.vests[vestKey];

      return (
        <VestsTooltip
          tooltipTrigger={userDetails[key] as string}
          tooltipContent={vestValue}
        />
      );
    }
    return <>{userDetails[key]} </>;
  };

  const [isBalancesHidden, setIsBalancesHidden] = useState(false);

  const [totalBalance, setTotalBalance] = useState(0);


  useEffect(() => {
    const newBalance = keys.reduce((acc, param) => {
      if (cardNameMap.has(param) && !skipCalculation.includes(param)) {
        const value = grabNumericValue(userDetails.dollars[param]);
        if (typeof value === 'number' && !isNaN(value)) {
          return acc + value;
        } else {
          console.error('Value is not a number:', value);
          return acc;
        }
      }
      return acc;
    }, 0);

    setTotalBalance(newBalance);
  }, [keys, userDetails, cardNameMap, grabNumericValue]);



  const renderBalance = (
  ) => {
    return (
      
        <TableRow className="border-b border-gray-700 hover:bg-inherit font-bold">
          <TableCell className="">Account Value</TableCell>
          <TableCell className="text-right" colSpan={2}>{formatNumber(totalBalance, false, true)} $</TableCell>
        </TableRow>
      
    );
  }

  const buildTableBody = (
    parameters: (keyof Explorer.AccountDetailsDollars)[]
  ) => {
    return parameters.map(
      (param: keyof Explorer.AccountDetailsDollars, index: number) => 
        <Fragment key={index}>
          {cardNameMap.has(param) && 
            <TableRow
              className={cn(
                "border-b border-gray-700 hover:bg-inherit dark:hover:bg-inherit", 
                {
                  "bg-explorer-orange": checkForMarkedRender(param),
                }
              )}
            >
              <TableCell>{cardNameMap.get(param)}</TableCell>
              <TableCell className="text-right">
                {renderKey(param as keyof Explorer.FormattedAccountDetails)}
              </TableCell>
              <TableCell className="text-right">
                {changeHBDToDollarsDisplay(userDetails.dollars[param])}
              </TableCell>
            </TableRow>
          }
        </Fragment>
    );
  };

  const handleBalancesVisibility = () => {
    setIsBalancesHidden(!isBalancesHidden);
  };

  return (
    <Card
      data-testid="properties-dropdown"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0">
        <div
          onClick={handleBalancesVisibility}
          className="flex justify-between align-center p-2 hover:bg-rowHover cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
          {isBalancesHidden ? <ArrowDown /> : <ArrowUp />}
        </div>
      </CardHeader>
      <CardContent
        hidden={isBalancesHidden}
        data-testid="card-content"
      >
        <Table>
          <TableBody>{buildTableBody(keys)}{renderBalance()}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountBalanceCard;
