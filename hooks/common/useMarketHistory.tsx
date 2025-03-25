import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useMarketHistory = (
  bucketSeconds: number,
  start: string,
  end: string
) => {
  const {
    data: marketHistory,
    isLoading: isMarketHistoryLoading,
    isError: isMarketHistoryError,
  }: UseQueryResult<Hive.MarketHistory> = useQuery({
    queryKey: ["account_details", bucketSeconds, start, end],
    queryFn: () => fetchingService.getMarketHistory(bucketSeconds, start, end),
    refetchOnWindowFocus: false,
  });

  return {
    marketHistory,
    isMarketHistoryLoading,
    isMarketHistoryError,
  };
};

export default useMarketHistory;
