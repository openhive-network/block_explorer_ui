import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdByName } from "@/utils/OperationTypes";
import { config } from "@/Config";
import { RoundBlockRange } from "@/utils/witnessScheduleRound";

const PRODUCER_MISSED_OP = "producer_missed_operation";

// Stable identity: the result feeds a memo dependency list.
const NO_MISSES: string[] = [];

// Scans the whole round rather than up to the head, so the range is fixed for
// the round and the key describes the query. The API clamps to the head, and
// the interval keeps picking up slots as they are missed.
const useMissedProducers = (
  range: RoundBlockRange | null,
  roundLength: number
) => {
  const { operationsTypes } = useOperationsTypes();
  const opTypeId = opTypeIdByName(operationsTypes, PRODUCER_MISSED_OP);

  const enabled = !!range && opTypeId !== undefined && roundLength > 0;
  const roundEndBlock = range ? range.fromBlock + roundLength - 1 : 0;

  const { data, isLoading } = useQuery({
    queryKey: ["missed_producers", range?.fromBlock, roundEndBlock, opTypeId],
    queryFn: () =>
      fetchingService.getMissedProducers(
        range!.fromBlock,
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
