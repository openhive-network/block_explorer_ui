import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";
import { useRouter } from "next/router";

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
