import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkHpDistribution = () => {
  const {
    data: hpDistribution,
    isLoading: isHpDistributionLoading,
    isError: isHpDistributionError,
  }: UseQueryResult<
    Hive.NetworkHpDistributionResponse[] | undefined
  > = useQuery({
    queryKey: ["networkHpDistribution"],
    queryFn: () => fetchingService.getNetworkHpDistribution(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { hpDistribution, isHpDistributionLoading, isHpDistributionError };
};

export default useNetworkHpDistribution;
