import { keepPreviousData, useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useFinancialSummary = (
  account: string,
  from?: string,
  to?: string,
  granularity: "day" | "week" | "month" = "month"
) => {
  const query = useQuery<Hive.FinancialSummaryRow[]>({
    queryKey: ["financialSummary", account, from, to, granularity],
    queryFn: () =>
      fetchingService.getFinancialSummary(account, from, to, granularity),
    enabled: !!account,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Data kept from the previous range counts as loading, so a report never
  // shows the old numbers under the newly selected range.
  return { ...query, isLoading: query.isPending || query.isPlaceholderData };
};

export default useFinancialSummary;
