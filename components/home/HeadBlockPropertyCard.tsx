import { Fragment } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { convertUTCDateToLocalDate } from "@/utils/TimeUtils";
import { cn } from "@/lib/utils";
import useDynamicGlobal from "@/hooks/homePage/useDynamicGlobal";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import {
  fundAndSupplyParameters,
  hiveParameters,
  blockchainDates,
} from "./headBlockParameters";

const cardNameMap = new Map([
  ["feedPrice", "Feed price"],
  ["blockchainTime", "Blockchain time"],
  ["rewardFund", "Rewards fund"],
  ["currentSupply", "Current Supply"],
  ["virtualSupply", "Virtual Supply"],
  ["initHbdSupply", "Init hbd supply"],
  ["currentHbdSupply", "Current hbd supply"],
  ["pendingRewardedVestingHive", "Pending rewarded vesting hive"],
  ["totalVestingFundHive", "Total vesting fund hive"],
  ["hbdInterestRate", "Hbd interest rate"],
  ["hbdPrintRate", "Hbd print rate"],
  ["lastIrreversibleBlockNumber", "Last irreversible block num"],
  ["availableAccountSubsidies", "Available account subsidies"],
  ["hbdStopPercent", "Hbd stop percent"],
  ["hbdStartPercent", "Hbd start percent"],
  ["nextMaintenanceTime", "Next maintenance time"],
  ["lastBudgetTime", "Last budget time"],
  ["nextDailyMaintenanceTime", "Next daily maintenance time"],
  ["contentRewardPercent", "Content reward percent"],
  ["vestingRewardPercent", "Vesting reward percent"],
  ["downvotePoolPercent", "Downvote pool percent"],
  ["currentRemoveThreshold", "Current remove threshold"],
  ["earlyVotingSeconds", "Early voting seconds"],
  ["midVotingSeconds", "Mid voting seconds"],
  [
    "maxConvecutiveRecurrentTransferFailures",
    "Max consecutive recurrent transfer failures",
  ],
  ["maxRecurrentTransferEndDate", "Max recurrent transfer end date"],
  ["minRecurrentTransfersRecurrence", "Min recurrent transfers recurrence"],
  ["maxOpenRecurrentTransfers", "Max open recurrent transfers"],
]);

interface HeadBlockPropertyCardProps {
  parameters:
    | typeof fundAndSupplyParameters
    | typeof hiveParameters
    | typeof blockchainDates;
  header: string;
  isParamsHidden: boolean;
  handleHideParams: () => void;
}

const buildTableBody = (
  parameters: string[],
  header: string,
  dynamicGlobalData: any
) => {
  return parameters.map((param: string, index: number) => (
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
        <TableCell>
          {header === "Blockchain Dates"
            ? convertUTCDateToLocalDate(
                dynamicGlobalData?.headBlockDetails[param]
              )
            : dynamicGlobalData?.headBlockDetails[param]}
        </TableCell>
      </TableRow>
    </Fragment>
  ));
};

const HeadBlockPropertyCard: React.FC<HeadBlockPropertyCardProps> = ({
  parameters,
  header,
  isParamsHidden,
  handleHideParams,
}) => {
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  return (
    <div
      className="bg-explorer-dark-gray py-1 rounded-[6px]"
      data-testid="expandable-list"
    >
      <div
        onClick={handleHideParams}
        className="h-full flex justify-between align-center py-2 hover:bg-slate-600 cursor-pointer px-2"
      >
        <div className="text-lg">{header}</div>
        {isParamsHidden ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div
        hidden={isParamsHidden}
        data-testid="conntent-expandable-list"
      >
        <Table>
          <TableBody>
            {buildTableBody(parameters, header, dynamicGlobalData)}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HeadBlockPropertyCard;
