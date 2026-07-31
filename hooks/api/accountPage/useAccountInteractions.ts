import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountInteractions = (
  accountName: string,
  fromDate?: string | Date | number,
  toDate?: string | Date | number,
  topN?: number,
  typeFilter?: Hive.AccountInteractionType,
  enabled = true
) => {
  const {
    data: interactions,
    isLoading: isInteractionsLoading,
    isError: isInteractionsError,
  }: UseQueryResult<Hive.AccountInteractionRow[] | undefined> = useQuery({
    queryKey: [
      "account_interactions",
      accountName,
      fromDate,
      toDate,
      topN,
      typeFilter,
    ],
    queryFn: () =>
      fetchingService.getAccountInteractions(
        accountName,
        fromDate,
        toDate,
        topN,
        typeFilter
      ),
    enabled: enabled && !!accountName,
    keepPreviousData: true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    interactions,
    isInteractionsLoading,
    isInteractionsError,
  };
};

export default useAccountInteractions;
