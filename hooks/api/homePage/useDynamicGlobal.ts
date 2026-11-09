import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import fetchingService from "@/services/FetchingService";

// For callers that read only the VESTS <-> HP ratio, which moves by about
// 3 ppm an hour: a newly mounted one need not refetch the globals.
export const VESTING_RATIO_STALE_MS = 5 * 60 * 1000;

const useDynamicGlobal = (headBlockNum?: number, staleTime?: number) => {
  const { hiveChain } = useHiveChainContext();

  function getGlobalBlockData() {
    return Promise.all([
      fetchingService.getDynamicGlobalProperties(),
      fetchingService.getCurrentPriceFeed(),
      fetchingService.getRewardFunds(),
    ]);
  }
  const {
    data: dynamicGlobalData,
    isPending: dynamicGlobalLoading,
    isError: dynamicGlobalError,
  } = useQuery({
    queryKey: [`global`, headBlockNum],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) =>
      adjustDynamicGlobalBlockData(
        dynamicGlobalBlockData[0],
        dynamicGlobalBlockData[1],
        dynamicGlobalBlockData[2].funds,
        hiveChain!
      ),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    // Only when given: an explicit undefined would replace the app default.
    ...(staleTime !== undefined ? { staleTime } : {}),
  });

  return { dynamicGlobalData, dynamicGlobalLoading, dynamicGlobalError };
};

export default useDynamicGlobal;
