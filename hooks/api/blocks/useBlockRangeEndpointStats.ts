import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import useOperationBuckets from "@/hooks/common/useOperationBuckets";
import {
  aggregateEndpointStats,
  rangeEndpointBounds,
  type EndpointRangeStats,
} from "@/utils/blockRangeStats";

// Summed from the day-bucketed statistics endpoints, so only queried once the
// filter is wide enough for a day bucket to mean anything — see isWideRange.
const useBlockRangeEndpointStats = (paramsState: any, enabled: boolean) => {
  const { isVirtualOpType } = useOperationBuckets();

  const { fromBlock, toBlock } = rangeEndpointBounds(paramsState ?? {});

  const { data, isFetching, error } = useQuery({
    queryKey: ["blocks_range_endpoint_stats", fromBlock, toBlock],
    // Without a from-block the endpoints answer for the whole chain.
    enabled: enabled && fromBlock !== undefined,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const [transactions, operations] = await Promise.all([
        fetchingService.getTransactionStatistics(
          "daily",
          "asc",
          fromBlock,
          toBlock
        ),
        fetchingService.getOperationTypeStatistics(
          "daily",
          "asc",
          fromBlock,
          toBlock
        ),
      ]);
      return { transactions, operations };
    },
  });

  const endpointStats: EndpointRangeStats | undefined = data
    ? aggregateEndpointStats(
        data.transactions,
        data.operations,
        isVirtualOpType
      )
    : undefined;

  return {
    endpointStats,
    isEndpointStatsLoading: enabled && isFetching,
    // Any failure, unsupported endpoint included, falls back to the page scope.
    isEndpointStatsUnavailable: !!error,
  };
};

export default useBlockRangeEndpointStats;
