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
    isLoading,
    isPreviousData,
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

  // Data kept from the previous range counts as loading, so a report never
  // shows the old numbers under the newly selected range.
  const isCommunityActivityLoading = isLoading || isPreviousData;

  return {
    communityActivity,
    isCommunityActivityLoading,
    isCommunityActivityError,
  };
};

export default useAccountCommunityActivity;
