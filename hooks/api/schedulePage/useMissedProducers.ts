import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdByName } from "@/utils/OperationTypes";
import { config } from "@/Config";
import { RoundBlockRange } from "@/utils/witnessScheduleRound";

const PRODUCER_MISSED_OP = "producer_missed_operation";

// Stable identity: the result feeds a memo dependency list.
const NO_MISSES: string[] = [];

/**
 * Witnesses the chain recorded as skipping a slot in the round on screen.
 *
 * Keyed on the round's first block, not the head: the head moves every ~3s and
 * would refetch the whole fan-out with it, while the round is the thing the
 * answer belongs to. Freshness within a round comes from the interval instead,
 * which runs unconditionally - the schedule keeps advancing with live data off
 * (see headBlockRefresh), so these labels have to keep up with it.
 */
const useMissedProducers = (
  range: RoundBlockRange | null,
  roundLength: number
) => {
  const { operationsTypes } = useOperationsTypes();
  const opTypeId = opTypeIdByName(operationsTypes, PRODUCER_MISSED_OP);

  const enabled = !!range && opTypeId !== undefined && roundLength > 0;

  const { data, isLoading } = useQuery({
    queryKey: ["missed_producers", range?.fromBlock, opTypeId],
    queryFn: () =>
      fetchingService.getMissedProducers(
        range!.fromBlock,
        range!.toBlock,
        opTypeId!,
        roundLength
      ),
    enabled,
    refetchInterval: config.missedProducersRefreshInterval,
    refetchOnWindowFocus: false,
  });

  return {
    missedProducers: data ?? NO_MISSES,
    isMissedProducersLoading: isLoading,
  };
};

export default useMissedProducers;
