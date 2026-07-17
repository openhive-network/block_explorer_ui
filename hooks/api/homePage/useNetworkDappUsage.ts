import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkDappUsage = (
  from?: Date | number,
  to?: Date | number,
  enabled = true
) => {
  const {
    data: dappUsage,
    isLoading: isDappUsageLoading,
    isError: isDappUsageError,
  }: UseQueryResult<Hive.NetworkDappFootprintResponse | undefined> = useQuery({
    queryKey: ["networkDappUsage", from, to],
    queryFn: () => fetchingService.getNetworkDappFootprint(from, to),
    enabled,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { dappUsage, isDappUsageLoading, isDappUsageError };
};

export default useNetworkDappUsage;
