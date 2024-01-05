import useDynamicGlobal from "@/api/homePage/useDynamicGlobal";
import { ArrowDown, ArrowUp } from "lucide-react";
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
  ["pendingRewardedVestingHive", "Total vesting fund hive"],
  ["totalVestingFundHive", "Pending rewarded vesting hive"],
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

const HeadBlockPropertyCard: React.FC<HeadBlockPropertyCardProps> = ({
  parameters,
  header,
  isParamsHidden,
  handleHideParams,
}) => {
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  return (
    <div className="bg-explorer-dark-gray py-1 rounded-[6px]">
      <div
        onClick={handleHideParams}
        className="h-full flex justify-between align-center py-2 hover:bg-slate-600 cursor-pointer px-2"
      >
        <div className="text-lg">{header}</div>
        {isParamsHidden ? <ArrowDown /> : <ArrowUp />}
      </div>
      <div hidden={isParamsHidden}>
        {parameters.map((param: any) => (
          <div
            key={param}
            className="border-b border-solid border-gray-700 flex justify-between px-3 py-1 flex-col"
          >
            <span className="mr-2">{`${cardNameMap.get(param)}: `}</span>
            <span>{dynamicGlobalData?.headBlockDetails[param]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeadBlockPropertyCard;
