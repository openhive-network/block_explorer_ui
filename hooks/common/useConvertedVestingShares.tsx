import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountDetails from "../api/accountPage/useAccountDetails";
import useDynamicGlobal from "../api/homePage/useDynamicGlobal";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import Explorer from "@/types/Explorer";
import {convertVestsToHP } from "@/utils/Calculations";
import { config } from "@/Config";
import useVestingDelegations from "../api/common/useVestingDelegations";

const useConvertedVestingShares = (accountName: string, liveDataEnabled: boolean, dynamicGlobalData?: Explorer.HeadBlockCardData) => {
  const { hiveChain } = useHiveChainContext();
  const { vestingDelegationsData: delegations } = useVestingDelegations(
    accountName,
    null,
    config.maxDelegatorsCount,
    liveDataEnabled
  );
  if (!dynamicGlobalData || !hiveChain || !delegations) return [];
  const {
    headBlockDetails: { rawFeedPrice, rawQuote, rawTotalVestingFundHive, rawTotalVestingShares },
  } = dynamicGlobalData;
  const convertedDelgations = delegations?.map(
    (delegation) => ({...delegation, vesting_shares: convertVestsToHP(hiveChain, delegation.vesting_shares, rawTotalVestingFundHive, rawTotalVestingShares)})
  ) as Explorer.VestingDelegation[];
  return convertedDelgations;
}

export default useConvertedVestingShares;