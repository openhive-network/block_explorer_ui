import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkAuthorRetention = (from?: Date, to?: Date, enabled = true) => {
  const {
    data: authorRetention,
    isLoading: isAuthorRetentionLoading,
    isError: isAuthorRetentionError,
  }: UseQueryResult<
    Hive.NetworkAuthorRetentionResponse[] | undefined
  > = useQuery({
    queryKey: [
      "networkAuthorRetention",
      from?.toISOString(),
      to?.toISOString(),
    ],
    queryFn: () => fetchingService.getNetworkAuthorRetention(from, to),
    enabled,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  return {
    authorRetention,
    isAuthorRetentionLoading,
    isAuthorRetentionError,
  };
};

export default useNetworkAuthorRetention;
