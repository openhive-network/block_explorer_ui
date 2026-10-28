import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkEngagement = (
  fromBlock?: Date | number | undefined,
  toBlock?: Date | number | undefined,
  granularity?: "day" | "week" | "month",
  enabled = true
) => {
  const {
    data: networkEngagement,
    isPending: isNetworkEngagementLoading,
    isError: isNetworkEngagementError,
  }: UseQueryResult<Hive.NetworkEngagementResponse[] | undefined> = useQuery({
    queryKey: ["networkEngagement", fromBlock, toBlock, granularity],
    queryFn: () =>
      fetchingService.getNetworkEngagement(fromBlock, toBlock, granularity),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return {
    networkEngagement,
    isNetworkEngagementLoading,
    isNetworkEngagementError,
  };
};

export default useNetworkEngagement;
