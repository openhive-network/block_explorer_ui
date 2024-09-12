import { ReactNode, Fragment } from "react";

import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { VEST_HP_KEYS_MAP } from "@/hooks/common/useConvertedAccountDetails";
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
  ["vesting_balance", "Owned HP"],
  ["reward_vesting_hive", "HP Unclaimed"],
  ["received_vesting_shares", "Received HP"],
  ["delegated_vesting_shares", "Delegated HP"],
  ["vesting_withdraw_rate", "Powering down HP"],
]);



const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  header,
  userDetails,
}) => {

  const keys = Object.keys(userDetails) as (keyof Explorer.AccountDetailsDollars)[];

  const renderKey = (key: keyof Explorer.FormattedAccountDetails) => {
    if (Object.keys(VEST_HP_KEYS_MAP).includes(key)) {
      return <VestsTooltip tooltipTrigger={userDetails[key] as string} tooltipContent={userDetails[VEST_HP_KEYS_MAP[key] as keyof Explorer.FormattedAccountDetails] as string } />
    }
    return <>{userDetails[key]}</>;
  };

  const buildTableBody = (
    parameters: (keyof Explorer.AccountDetailsDollars)[],
  ) => {
    return parameters.map((param: keyof Explorer.AccountDetailsDollars, index: number) => {
      if (cardNameMap.has(param)) {
        return (
          <Fragment key={index}>
            <TableRow className="border-b border-gray-700 hover:bg-inherit">
              <TableCell>{cardNameMap.get(param)}</TableCell>
              <TableCell className="text-right">{renderKey(param as keyof Explorer.FormattedAccountDetails)}</TableCell>
              <TableCell className="text-right">{changeHBDToDollarsDisplay(userDetails.dollars[param])}</TableCell>
            </TableRow>
          </Fragment>
        );
      }
    });
  };


  return (
    <Card
      data-testid="properties-dropdown"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0">
        <div className="flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4">
          <div className="text-lg">{header}</div>
        </div>
      </CardHeader>
      <CardContent data-testid="card-content">
        <Table>
          <TableBody>{buildTableBody(keys)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountBalanceCard;
