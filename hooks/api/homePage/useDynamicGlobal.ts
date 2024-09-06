import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import fetchingService from "@/services/FetchingService";

const useDynamicGlobal = (headBlockNum?: number) => {
  const { hiveChain } = useHiveChainContext();
  const router = useRouter();

  function getGlobalBlockData() {
    return Promise.all([
      fetchingService.getDynamicGlobalProperties(),
      fetchingService.getCurrentPriceFeed(),
      fetchingService.getRewardFunds(),
    ]);
  }

  const {
    data: dynamicGlobalData,
    isLoading: dynamicGlobalLoading,
    isError: dynamicGlobalError,
  } = useQuery({
    queryKey: [`global`, headBlockNum, router],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) =>
      adjustDynamicGlobalBlockData(
        dynamicGlobalBlockData[0],
        dynamicGlobalBlockData[1],
        dynamicGlobalBlockData[2].funds,
        hiveChain!
      ),
    refetchOnWindowFocus: false,
  });

  return { dynamicGlobalData, dynamicGlobalLoading, dynamicGlobalError };
};

export default useDynamicGlobal;
