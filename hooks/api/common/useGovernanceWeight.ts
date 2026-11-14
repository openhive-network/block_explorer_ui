import { useQuery } from "@tanstack/react-query";

import useDynamicGlobal, {
  VESTING_RATIO_STALE_MS,
} from "@/hooks/api/homePage/useDynamicGlobal";
import { ACCOUNT_QUERY_OPTIONS } from "@/hooks/api/common/useUnclaimedRewards";
import fetchingService from "@/services/FetchingService";
import { naiAssetToFloat } from "@/utils/Calculations";
import { governanceWeight } from "@/utils/governanceVests";

// The signed-in account's weight in witness and proposal votes, for the user
// menu. It reads the menu's own find_accounts query (see useUnclaimedRewards),
// so it costs no extra request and refreshes with it, and after a vote.
const useGovernanceWeight = (username: string | null) => {
  const {
    data: account,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["unclaimedRewards", username],
    queryFn: () => fetchingService.findAccounts([username as string]),
    select: ({ accounts }) => accounts[0],
    enabled: !!username,
    ...ACCOUNT_QUERY_OPTIONS,
  });
  const { dynamicGlobalData, dynamicGlobalError } = useDynamicGlobal(
    undefined,
    VESTING_RATIO_STALE_MS
  );

  const globals = dynamicGlobalData?.headBlockDetails;
  const shares = naiAssetToFloat(globals?.rawTotalVestingShares);
  const weight =
    account && shares > 0
      ? governanceWeight(
          account,
          naiAssetToFloat(globals?.rawTotalVestingFundHive) / shares
        )
      : null;

  return {
    weight,
    // Hidden when it can't be worked out, rather than a skeleton that never
    // settles. A failed background refresh keeps the last figures.
    isWeightError:
      (isError && !account) ||
      (dynamicGlobalError && !dynamicGlobalData) ||
      (isSuccess && !account),
  };
};

export default useGovernanceWeight;
