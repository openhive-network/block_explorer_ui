import { ReactNode, useState, Fragment } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { cn, formatNumber } from "@/lib/utils";
import { convertVestsToHP, convertHiveToUSD } from "@/utils/Hooks";

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
  ["vesting_withdraw_rate", "Powering down HP"]
]);

const vestsParams = ['received_vesting_shares', 'delegated_vesting_shares', 'vesting_withdraw_rate'];


const buildTableBody = (
  parameters: string[],
  render_key: (key: string) => ReactNode,
  convert_usd: (key:string) => ReactNode
) => {
  /*return cardNameMap.forEach((value, key, map) => {
    //console.log(key);
    //console.log(parameters);
    //if (parameters.includes(key)){
      return (
        <Fragment key={key}>
          <TableRow
            className={cn(
              {
                "border-t border-gray-700": true,
              },
              "hover:bg-inherit"
            )}
          >
            <TableCell>{value}</TableCell>
            <TableCell>
                {render_key(key)}
            </TableCell>
          </TableRow>
        </Fragment>
      )
    //}
  });*/
  return parameters.map((param: string, index: number) => {
    if (cardNameMap.has(param)) {
      return (
        <Fragment key={index}>
          <TableRow
            className={cn(
              {
                "border-t border-gray-700": !!index,
              },
              "hover:bg-inherit"
            )}
          >
            <TableCell>{cardNameMap.get(param)}</TableCell>
            <TableCell>{render_key(param)}</TableCell>
            <TableCell>{convert_usd(param)}</TableCell>
          </TableRow>
        </Fragment>
      )}
  });
};

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  header,
  userDetails,
}) => {

  if (!userDetails) return null;

  const keys = Object.keys(userDetails);

  //console.log(keys);

  const render_key = (key: string) => {
    if (vestsParams.includes(key)){
      return parseFloat(convertVestsToHP(userDetails[key]).toString()).toFixed(3) + " HP";
    }
    return userDetails[key];
  }

  const convert_usd = (key: string) => {
    let displVal = "";
    if (vestsParams.includes(key)){
      displVal = convertHiveToUSD(parseFloat(convertVestsToHP(userDetails[key]).toString())).toFixed(2);
    }else if (key.includes('hbd')){//considering hbd as stable coin = 1$
      displVal = parseFloat(userDetails[key].replace(/,/g, '').split(" ")[0]).toFixed(2);;
    }else{
      displVal = convertHiveToUSD(userDetails[key].replace(/,/g, '').split(" ")[0]).toFixed(2);
    }
    return '$ ' + displVal;
  }

  return (
    <Card
      data-testid="properties-dropdown"
      className="overflow-hidden pb-0"
    >
      <CardHeader className="p-0">
        <div
          className="flex justify-between align-center p-2 hover:bg-slate-600 cursor-pointer px-4"
        >
          <div className="text-lg">{header}</div>
        </div>
      </CardHeader>
      <CardContent
        data-testid="card-content"
      >
        <Table>
          <TableBody>
          {buildTableBody(keys, render_key, convert_usd)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
export default AccountBalanceCard;
