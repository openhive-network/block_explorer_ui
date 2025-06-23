import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { convertVestsToHP } from "@/utils/Calculations";
import Hive from "@/types/Hive";
import HiveTooltip from "./HiveTooltip";

interface ConvertedHiveTooltipProps {
  tooltipTrigger: string;
  supply: Hive.Supply;
}

const ConvertedHiveTooltip: React.FC<ConvertedHiveTooltipProps> = ({
  tooltipTrigger,
  supply,
}) => {
  const { headBlockNumberData } = useHeadBlockNumber();
  const { dynamicGlobalData } = useDynamicGlobal(headBlockNumberData);
  const { hiveChain } = useHiveChainContext();

  if (!dynamicGlobalData || !tooltipTrigger || !supply || !hiveChain) {
    return "";
  }

  const resultString = convertVestsToHP(
    hiveChain,
    supply,
    dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive,
    dynamicGlobalData.headBlockDetails.rawTotalVestingShares
  );

  return (
    <HiveTooltip
      tooltipTrigger={tooltipTrigger}
      tooltipContent={resultString}
    />
  );
};

export default ConvertedHiveTooltip;
