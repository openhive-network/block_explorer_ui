import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useFinancialSummary = (
  account: string,
  from?: string,
  to?: string,
  granularity: "day" | "week" | "month" = "month"
) => {
  return useQuery<Hive.FinancialSummaryRow[]>({
    queryKey: ["financialSummary", account, from, to, granularity],
    queryFn: () =>
      fetchingService.getFinancialSummary(account, from, to, granularity),
    enabled: !!account,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export default useFinancialSummary;
