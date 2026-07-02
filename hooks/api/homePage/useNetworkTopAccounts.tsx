import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkTopAccounts = (
  metric: Hive.TopAccountsMetric,
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  limitCount = 10,
  enabled = true
) => {
  const {
    data: topAccounts,
    isLoading: isTopAccountsLoading,
    isError: isTopAccountsError,
  }: UseQueryResult<Hive.TopAccountsResponse[] | undefined> = useQuery({
    queryKey: ["network_top_accounts", metric, fromDate, toDate, limitCount],
    queryFn: () =>
      fetchingService.getNetworkTopAccounts(
        metric,
        fromDate,
        toDate,
        limitCount
      ),
    refetchOnWindowFocus: false,
    enabled,
  });

  return { topAccounts, isTopAccountsLoading, isTopAccountsError };
};

export default useNetworkTopAccounts;
