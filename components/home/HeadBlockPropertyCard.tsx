import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { convertUTCDateToLocalDate } from "@/utils/TimeUtils";
import { Table, TableBody, TableRow, TableCell } from "../ui/table";
import {
  fundAndSupplyParameters,
  hiveParameters,
  blockchainDates,
} from "./headBlockParameters";
import { useI18n } from "../../i18n/i18n";

import { Loader2 } from "lucide-react";

const cardNameMap = new Map([
  ["feedPrice", "headBlockPropertyCard.feedPrice"],
  ["blockchainTime", "headBlockPropertyCard.blockchainTime"],
  ["rewardFund", "headBlockPropertyCard.rewardFund"],
  ["currentSupply", "headBlockPropertyCard.currentSupply"],
  ["virtualSupply", "headBlockPropertyCard.virtualSupply"],
  ["initHbdSupply", "headBlockPropertyCard.initHbdSupply"],
  ["currentHbdSupply", "headBlockPropertyCard.currentHbdSupply"],
  ["pendingRewardedVestingHive", "headBlockPropertyCard.pendingRewardedVestingHive"],
  ["totalVestingFundHive", "headBlockPropertyCard.totalVestingFundHive"],
  ["totalVestingShares", "headBlockPropertyCard.totalVestingShares"],
  ["hbdInterestRate", "headBlockPropertyCard.hbdInterestRate"],
  ["hbdPrintRate", "headBlockPropertyCard.hbdPrintRate"],
  ["lastIrreversibleBlockNumber", "headBlockPropertyCard.lastIrreversibleBlockNumber"],
  ["availableAccountSubsidies", "headBlockPropertyCard.availableAccountSubsidies"],
  ["hbdStopPercent", "headBlockPropertyCard.hbdStopPercent"],
  ["hbdStartPercent", "headBlockPropertyCard.hbdStartPercent"],
  ["nextMaintenanceTime", "headBlockPropertyCard.nextMaintenanceTime"],
  ["lastBudgetTime", "headBlockPropertyCard.lastBudgetTime"],
  ["nextDailyMaintenanceTime", "headBlockPropertyCard.nextDailyMaintenanceTime"],
  ["contentRewardPercent", "headBlockPropertyCard.contentRewardPercent"],
  ["vestingRewardPercent", "headBlockPropertyCard.vestingRewardPercent"],
  ["downvotePoolPercent", "headBlockPropertyCard.downvotePoolPercent"],
  ["currentRemoveThreshold", "headBlockPropertyCard.currentRemoveThreshold"],
  ["earlyVotingSeconds", "headBlockPropertyCard.earlyVotingSeconds"],
  ["midVotingSeconds", "headBlockPropertyCard.midVotingSeconds"],
  [
    "maxConvecutiveRecurrentTransferFailures",
    "headBlockPropertyCard.maxConvecutiveRecurrentTransferFailures",
  ],
  ["maxRecurrentTransferEndDate", "headBlockPropertyCard.maxRecurrentTransferEndDate"],
  ["minRecurrentTransfersRecurrence", "headBlockPropertyCard.minRecurrentTransfersRecurrence"],
  ["maxOpenRecurrentTransfers", "headBlockPropertyCard.maxOpenRecurrentTransfers"],
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
  dynamicGlobalData: any;
}

const buildTableBody = (
  parameters: string[],
  header: string,
  dynamicGlobalData: any,
  t: (key: string) => string
) => {
  return parameters.map((param: string, index: number) => (
    <TableRow
      key={index}
      className="bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
    >
      <TableCell>{t(cardNameMap.get(param) || '')}</TableCell>
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
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  return (
    <div
      className="py-1 rounded-[6px] data-box"
      data-testid="expandable-list"
      style={{ overflowX: "auto", width: "100%" }}
    >
      <div
        onClick={handleHideParams}
        className="h-full w-full flex items-center justify-between py-1 cursor-pointer px-1"
      >
        <div className="text-lg">{header}</div>
        <div>{isParamsHidden ? <ArrowDown /> : <ArrowUp />}</div>
      </div>

      {isLoading && !isParamsHidden ? (
        <div className="flex justify-center w-full">
          <Loader2 className="animate-spin mt-1 text-white h-8 w-8" />
        </div>
      ) : (
        <div
          hidden={isParamsHidden}
          data-testid="content-expandable-list"
        >
          <div style={{ overflowX: "auto" }}>
            <Table className="bg-transparent dark:bg-transparent">
              <TableBody className="bg-transparent dark:bg-transparent">
                {dynamicGlobalData?.headBlockDetails &&
                  buildTableBody(parameters, header, dynamicGlobalData, t)}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadBlockPropertyCard;
