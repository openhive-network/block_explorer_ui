import { Fragment, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import VestsTooltip from "../VestsTooltip";
import Explorer from "@/types/Explorer";
import { changeHBDToDollarsDisplay } from "@/utils/StringUtils";

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

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  header,
  userDetails,
}) => {
  const keys = Object.keys(
    userDetails
  ) as (keyof Explorer.AccountDetailsDollars)[];

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

  const buildTableBody = (
    parameters: (keyof Explorer.AccountDetailsDollars)[]
  ) => {
    return parameters.map(
      (param: keyof Explorer.AccountDetailsDollars, index: number) => {
        if (cardNameMap.has(param)) {
          return (
            <Fragment key={index}>
              <TableRow className="border-b border-gray-700 hover:bg-inherit">
                <TableCell>{cardNameMap.get(param)}</TableCell>
                <TableCell className="text-right">
                  {renderKey(param as keyof Explorer.FormattedAccountDetails)}
                </TableCell>
                <TableCell className="text-right">
                  {changeHBDToDollarsDisplay(userDetails.dollars[param])}
                </TableCell>
              </TableRow>
            </Fragment>
          );
        }
      }
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
          className="flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
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
          <TableBody>{buildTableBody(keys)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountBalanceCard;
