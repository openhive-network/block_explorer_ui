import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useTransactionStatistics = (
  granularity: "daily" | "monthly" | "yearly",
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  liveDataEnabled?: boolean
) => {
  const {
    data: transactionStatistics,
    isLoading: isTransactionStatisticsLoading,
    isError: isTransactionStatisticsError,
  }: UseQueryResult<
    Hive.TransactionStatisticsResponse[] | undefined
  > = useQuery({
    queryKey: [
      "get_transaction_statistics",
      granularity,
      direction,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      fetchingService.getTransactionStatistics(
        granularity,
        direction,
        fromDate,
        toDate
      ),
    refetchInterval: liveDataEnabled ? config.mainRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    transactionStatistics,
    isTransactionStatisticsLoading,
    isTransactionStatisticsError,
  };
};

export default useTransactionStatistics;
