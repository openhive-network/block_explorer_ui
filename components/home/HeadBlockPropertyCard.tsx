import { ArrowDown, ArrowUp } from "lucide-react";
import { convertUTCDateToLocalDate } from "@/utils/TimeUtils";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import {
fundAndSupplyParameters,
hiveParameters,
blockchainDates,
} from "./headBlockParameters";

import { Loader2 } from "lucide-react";

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
  ["totalVestingShares", "Total vesting shares"],
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
  isLoading: boolean;
}

const buildTableBody = (
  parameters: string[],
  header: string,
  dynamicGlobalData: any
) => {
  return parameters.map((param: string, index: number) => (
    <TableRow key={index} className="border-b border-gray-700 hover:bg-inherit">
      <TableCell>{cardNameMap.get(param)}</TableCell>
      <TableCell>
        {header === "Blockchain Dates"
            ? convertUTCDateToLocalDate(
                dynamicGlobalData?.headBlockDetails[param]
              )
          : dynamicGlobalData?.headBlockDetails[param]}
      </TableCell>
    </TableRow>
  ));
};

const HeadBlockPropertyCard: React.FC<HeadBlockPropertyCardProps> = ({
  parameters,
  header,
  isParamsHidden,
  handleHideParams,
  isLoading,
}) => {
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  return (
    <div className="bg-theme py-1 rounded-[6px] data-box" data-testid="expandable-list" style={{ overflowX: "auto", width: "100%" }}>
      <div onClick={handleHideParams} className="h-full w-full flex items-center justify-between py-1 cursor-pointer px-1">
        <div className="text-lg">{header}</div>
        <div>{isParamsHidden ? <ArrowDown /> : <ArrowUp />}</div>
      </div>

      {isLoading && !isParamsHidden ? (
        <div className="flex justify-center w-full">
          <Loader2 className="animate-spin mt-1 text-white h-8 w-8" />
        </div>
      ) : (
        <div hidden={isParamsHidden} data-testid="content-expandable-list">
          <div style={{ overflowX: "auto" }}>
            <Table className="min-w-full">
              <TableBody>
                {dynamicGlobalData?.headBlockDetails && buildTableBody(parameters, header, dynamicGlobalData)}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadBlockPropertyCard;
