import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkRcUtilization = (
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  granularity?: "day" | "week" | "month",
  enabled = true
) => {
  const {
    data: networkRcUtilization,
    isLoading: isNetworkRcUtilizationLoading,
    isError: isNetworkRcUtilizationError,
  }: UseQueryResult<Hive.NetworkRcUtilizationResponse[] | undefined> = useQuery(
    {
      queryKey: ["networkRcUtilization", fromDate, toDate, granularity],
      queryFn: () =>
        fetchingService.getNetworkRcUtilization(fromDate, toDate, granularity),
      enabled,
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  return {
    networkRcUtilization,
    isNetworkRcUtilizationLoading,
    isNetworkRcUtilizationError,
  };
};

export default useNetworkRcUtilization;
