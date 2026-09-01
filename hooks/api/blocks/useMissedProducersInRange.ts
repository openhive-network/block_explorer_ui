import { useQueries } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import { opTypeIdByName } from "@/utils/OperationTypes";

const PRODUCER_MISSED_OP = "producer_missed_operation";

// One query per gap block. producer_missed_operation is settled history, so
// keying by block number means each is fetched once and reused across pages.
const useMissedProducersInRange = (gapBlocks: number[]) => {
  const { operationsTypes } = useOperationsTypes();
  const opTypeId = opTypeIdByName(operationsTypes, PRODUCER_MISSED_OP);
  const enabled = opTypeId !== undefined;

  const results = useQueries({
    queries: gapBlocks.map((blockNum) => ({
      queryKey: ["missed_producers_block", blockNum, opTypeId],
      queryFn: () =>
        fetchingService.getMissedProducersInBlock(blockNum, opTypeId!),
      enabled,
      // Settled history, so cache a success for good; a failure must retry or
      // the divider names nobody for as long as the page stays open.
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 2,
    })),
  });

  const missedProducersByBlock: Record<number, string[]> = {};
  gapBlocks.forEach((blockNum, index) => {
    const producers = results[index]?.data;
    if (producers?.length) missedProducersByBlock[blockNum] = producers;
  });

  return {
    missedProducersByBlock,
    isMissedProducersLoading: results.some((result) => result.isLoading),
  };
};

export default useMissedProducersInRange;
