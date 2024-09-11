import { ReactNode, Fragment } from "react";

import { formatNumber } from "@/lib/utils";
import { convertHiveToUSD } from "@/utils/Calculations";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { VEST_HP_KEYS_MAP } from "@/hooks/common/useConvertedAccountDetails";
import VestsTooltip from "../VestsTooltip";

type AccountBalanceCardProps = {
  header: string;
  userDetails: any;
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

const buildTableBody = (
  parameters: string[],
  render_key: (key: string) => ReactNode,
  convert_usd: (key: string) => ReactNode
) => {
  return parameters.map((param: string, index: number) => {
    if (cardNameMap.has(param)) {
      return (
        <Fragment key={index}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit">
            <TableCell>{cardNameMap.get(param)}</TableCell>
            <TableCell className="text-right">{render_key(param)}</TableCell>
            <TableCell className="text-right">{convert_usd(param)}</TableCell>
          </TableRow>
        </Fragment>
      );
    }
  });
};

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  header,
  userDetails,
}) => {

  const keys = Object.keys(userDetails);

  const render_key = (key: string) => {
    if (Object.keys(VEST_HP_KEYS_MAP).includes(key)) {
      return <VestsTooltip tooltipTrigger={userDetails[key]} tooltipContent={userDetails[VEST_HP_KEYS_MAP[key]]} />
    }
    return userDetails[key];
  };

  const convert_usd = (key: string) => {
    let displVal = "";
    if (key.includes("hbd")) {
      //considering hbd as stable coin = 1$
      displVal = Number(
        userDetails[key].replace(/,/g, "").split(" ")[0]
      ).toFixed(2);
    } else {
      displVal = convertHiveToUSD(
        userDetails[key].replace(/,/g, "").split(" ")[0],
        ""
        ).toFixed(2);
    }
    return "$ " + formatNumber(parseFloat(displVal), false, true);
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
          <TableBody>{buildTableBody(keys, render_key, convert_usd)}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountBalanceCard;
