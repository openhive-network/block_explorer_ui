import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";

const useDynamicGlobal = () => {

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
    queryKey: [`global`],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) =>
      adjustDynamicGlobalBlockData(
        dynamicGlobalBlockData[0],
        dynamicGlobalBlockData[1],
        dynamicGlobalBlockData[2]
      ),
    refetchOnWindowFocus: false,
  });

  return { dynamicGlobalData, dynamicGlobalLoading, dynamicGlobalError };
};

export default useDynamicGlobal;
