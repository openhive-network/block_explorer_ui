import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdByName } from "@/utils/OperationTypes";
import { config } from "@/Config";

const PRODUCER_MISSED_OP = "producer_missed_operation";

// Stable identity: the result feeds a memo dependency list.
const NO_MISSES: string[] = [];

// The round start is walked back over produced blocks by useWitnessesSchedule,
// never derived as head minus a slot index: a missed slot produces no block, so
// the arithmetic window would reach into the previous round and attribute its
// misses to this one.
//
// Scans the whole round rather than up to the head, so the range is fixed for
// the round and the key describes the query. The API clamps to the head, and
// the interval keeps picking up slots as they are missed.
const useMissedProducers = (
  roundStartBlock: number | null,
  roundLength: number
) => {
  const { operationsTypes } = useOperationsTypes();
  const opTypeId = opTypeIdByName(operationsTypes, PRODUCER_MISSED_OP);

  const enabled =
    roundStartBlock !== null &&
    roundStartBlock > 0 &&
    opTypeId !== undefined &&
    roundLength > 0;
  const roundEndBlock = roundStartBlock ? roundStartBlock + roundLength - 1 : 0;

  const { data, isLoading } = useQuery({
    queryKey: ["missed_producers", roundStartBlock, roundEndBlock, opTypeId],
    queryFn: () =>
      fetchingService.getMissedProducers(
        roundStartBlock!,
        roundEndBlock,
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
