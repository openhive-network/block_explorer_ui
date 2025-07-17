import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountFollowers = (
  accountName: string,
  options?: { enabled?: boolean }
) => {
  const { enabled = true } = options || {};

  const {
    data: accountFollowers,
    isLoading: isAccountFollowersLoading,
    isError: isAccountFollowersError,
  }: UseQueryResult<Hive.AccountFollower[]> = useQuery({
    queryKey: ["account_followers", accountName],
    queryFn: () => fetchingService.getAccountFollowers(accountName),
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  return {
    accountFollowers,
    isAccountFollowersLoading,
    isAccountFollowersError,
  };
};

export default useAccountFollowers;