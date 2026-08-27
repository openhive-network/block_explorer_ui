import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdByName } from "@/utils/OperationTypes";
import { config } from "@/Config";
import { RoundBlockRange } from "@/utils/witnessScheduleRound";

const PRODUCER_MISSED_OP = "producer_missed_operation";

// Stable identity: the result feeds a memo dependency list.
const NO_MISSES: string[] = [];

// Keyed on the round, not the head block, which would refetch the fan-out every
// few seconds. The interval is unconditional because the schedule keeps
// advancing with live data off - see headBlockRefresh.
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
