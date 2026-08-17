import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountCommunityActivity = (
  accountName: string,
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  enabled = true
) => {
  const {
    data: communityActivity,
    isLoading: isCommunityActivityLoading,
    isError: isCommunityActivityError,
  }: UseQueryResult<Hive.AccountCommunityActivityRow[] | undefined> = useQuery({
    queryKey: ["account_community_activity", accountName, fromDate, toDate],
    queryFn: () =>
      fetchingService.getAccountCommunityActivity(
        accountName,
        fromDate,
        toDate
      ),
    enabled: enabled && !!accountName,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    communityActivity,
    isCommunityActivityLoading,
    isCommunityActivityError,
  };
};

export default useAccountCommunityActivity;
