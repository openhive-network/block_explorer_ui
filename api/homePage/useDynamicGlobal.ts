import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";

const useDynamicGlobal = (headBlockNum?: number) => {

  const {hiveChain} = useHiveChainContext();

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
  });

  return { dynamicGlobalData, dynamicGlobalLoading, dynamicGlobalError };
};

export default useDynamicGlobal;
