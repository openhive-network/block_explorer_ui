import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

// The endpoint accepts a block number or a date.
type Bound = Date | number;

const serialiseBound = (bound?: Bound): string | number | undefined => {
  if (bound === undefined) return undefined;
  return typeof bound === "number" ? bound : bound.toISOString().slice(0, 19);
};

interface UseWitnessMissedBlocksOptions {
  fromDate?: Bound;
  toDate?: Bound;
  witness?: string;
  granularity?: "day" | "week" | "month";
  orderBy?: Hive.WitnessMissedBlocksOrder;
  limitCount?: number;
  enabled?: boolean;
}

const useWitnessMissedBlocks = ({
  fromDate,
  toDate,
  witness,
  granularity,
  orderBy = "missed",
  limitCount,
  enabled = true,
}: UseWitnessMissedBlocksOptions) => {
  const {
    data: missedBlocksData,
    isLoading: isMissedBlocksLoading,
    isPreviousData,
    isFetching,
    isError: isMissedBlocksError,
  } = useQuery({
    queryKey: [
      "witness_missed_blocks",
      serialiseBound(fromDate),
      serialiseBound(toDate),
      witness,
      granularity,
      orderBy,
      limitCount,
    ],
    queryFn: () =>
      fetchingService.getWitnessMissedBlocks({
        from_date: serialiseBound(fromDate),
        to_date: serialiseBound(toDate),
        witness,
        // Ignored by the API when granularity is set.
        ...(granularity
          ? { granularity }
          : { order_by: orderBy, limit_count: limitCount }),
      }),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    // to_date is optional; the API defaults it to now.
    enabled: enabled && Boolean(fromDate),
  });

  return {
    missedBlocksData,
    isMissedBlocksLoading,
    isMissedBlocksError,
    // Stays true after a failed refetch, so only count it while one is running.
    isMissedBlocksPreviousData: isPreviousData && isFetching,
  };
};

export default useWitnessMissedBlocks;
