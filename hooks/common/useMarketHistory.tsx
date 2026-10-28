import {
  keepPreviousData,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useMarketHistory = (
  bucketSeconds: number,
  start: string | undefined,
  end: string
) => {
  const {
    data: marketHistory,
    isPending: isMarketHistoryLoading,
    isError: isMarketHistoryError,
  }: UseQueryResult<Hive.MarketHistory> = useQuery({
    queryKey: ["market_history", bucketSeconds, start, end],
    queryFn: () => fetchingService.getMarketHistory(bucketSeconds, start, end),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return {
    marketHistory,
    isMarketHistoryLoading,
    isMarketHistoryError,
  };
};

export default useMarketHistory;
