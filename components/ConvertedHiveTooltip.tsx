import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useDynamicGlobal, {
  VESTING_RATIO_STALE_MS,
} from "@/hooks/api/homePage/useDynamicGlobal";
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
  // Not keyed on the head block: whenever the head block advances (Live Data
  // on, or a witness schedule view mounted) that refetched three RPCs on every
  // block for each page showing a VESTS amount. Only the VESTS -> HP ratio is
  // read here, so rows mounted later do not refetch either.
  const { dynamicGlobalData } = useDynamicGlobal(
    undefined,
    VESTING_RATIO_STALE_MS
  );
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
