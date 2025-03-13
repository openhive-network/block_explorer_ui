import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Explorer from "@/types/Explorer";
import { convertVestsToHP } from "@/utils/Calculations";
import { config } from "@/Config";
import useVestingDelegations from "../api/common/useVestingDelegations";

const useConvertedVestingShares = (
  direction: "outgoing" | "incoming",
  accountName: string,
  liveDataEnabled: boolean,
  dynamicGlobalData?: Explorer.HeadBlockCardData
) => {
  const { hiveChain } = useHiveChainContext();
  const { incomingDelegations, outgoingDelegations } = useVestingDelegations(
    accountName,
    null,
    config.maxDelegatorsCount,
    liveDataEnabled
  );
  if (!dynamicGlobalData || !hiveChain) return [];

  const {
    headBlockDetails: { rawTotalVestingFundHive, rawTotalVestingShares },
  } = dynamicGlobalData;

  if (direction === "outgoing") {
    const convertedOutgoingDelegations = outgoingDelegations?.map(
      (delegation) => ({
        ...delegation,
        vesting_shares: convertVestsToHP(
          hiveChain,
          delegation.amount,
          rawTotalVestingFundHive,
          rawTotalVestingShares
        ),
      })
    ) as Explorer.VestingDelegation[];
    return convertedOutgoingDelegations;
  }
  if (direction === "incoming") {
    const convertedIncomingDelegations = incomingDelegations?.map(
      (delegation) => ({
        ...delegation,
        vesting_shares: convertVestsToHP(
          hiveChain,
          delegation.amount,
          rawTotalVestingFundHive,
          rawTotalVestingShares
        ),
      })
    ) as Explorer.VestingDelegation[];

    return convertedIncomingDelegations;
  }
};

export default useConvertedVestingShares;
