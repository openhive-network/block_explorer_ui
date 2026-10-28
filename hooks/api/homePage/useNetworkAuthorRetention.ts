import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkAuthorRetention = (from?: Date, to?: Date, enabled = true) => {
  const {
    data: authorRetention,
    isPending: isAuthorRetentionLoading,
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
    placeholderData: keepPreviousData,
  });

  return {
    authorRetention,
    isAuthorRetentionLoading,
    isAuthorRetentionError,
  };
};

export default useNetworkAuthorRetention;
