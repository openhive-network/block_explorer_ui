import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useHeadBlock from "../homePage/useHeadBlock";
import useLastBlocks from "../homePage/useLastBlocks";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

interface WitnessScheduleTableData {
  producerRank: number | null;
  producerName: string;
  blockNumber: number | null;
}

// A round is at most 21 blocks, with headroom for just after a shuffle.
const LAST_BLOCKS_LOOKBACK = 30;

const useWitnessesSchedule = (
  witnesses: Hive.Witness[],
  headBlockNumberData: number
) => {
  const {
    data,
    isLoading: isWitnessScheduleLoading,
    isError: isWitnessScheduleError,
    refetch: refetchWitnessSchedule,
  } = useQuery({
    queryKey: ["witness_schedule"],
    queryFn: () => fetchingService.getWitnessSchedule(),
    refetchOnWindowFocus: false,
  });

  const { headBlockData } = useHeadBlock(headBlockNumberData);
  const { lastBlocksData } = useLastBlocks(
    headBlockNumberData,
    LAST_BLOCKS_LOOKBACK
  );

  const shuffledWitnesses = data?.current_shuffled_witnesses;
  // Since HF26 the chain builds the next round ahead of time, so this is fact.
  const futureShuffledWitnesses = data?.future_shuffled_witnesses;
  const producerAccount = headBlockData?.producer_account;
  const blockNumber = headBlockData?.block_num;
  const nextShuffleBlockNumber = data?.next_shuffle_block_num || 0;
  const blocksLeftBeforeRefetch = nextShuffleBlockNumber - headBlockNumberData;

  // Slot position, so a head block jumping several blocks cannot skip a witness.
  const currentProducerIndex = useMemo(() => {
    if (!shuffledWitnesses || !producerAccount) return -1;

    return shuffledWitnesses.indexOf(producerAccount);
  }, [shuffledWitnesses, producerAccount]);

  // The block list cannot miss a block but trails the head, so both are merged.
  const seenBlocks = useRef(new Map<string, number>());
  const latestBlockByWitness = useMemo(() => {
    const blocksByWitness = seenBlocks.current;

    const remember = (witness: string, block: number) => {
      const knownBlock = blocksByWitness.get(witness);

      if (knownBlock === undefined || block > knownBlock) {
        blocksByWitness.set(witness, block);
      }
    };

    (lastBlocksData || []).forEach(({ witness, block_num }) =>
      remember(witness, block_num)
    );

    if (producerAccount && blockNumber !== undefined) {
      remember(producerAccount, blockNumber);
    }

    return new Map(blocksByWitness);
  }, [lastBlocksData, producerAccount, blockNumber]);

  const scheduledWitnessesData = useMemo<WitnessScheduleTableData[]>(() => {
    if (!shuffledWitnesses?.length) return [];

    // A missed slot produces no block, so this bounds the round from below.
    const earliestBlockInRound =
      blockNumber !== undefined && currentProducerIndex >= 0
        ? blockNumber - currentProducerIndex
        : null;

    return shuffledWitnesses.map((producerName: string, index: number) => {
      const producerRank =
        witnesses?.find((witness) => witness.witness_name === producerName)
          ?.rank ?? null;

      // The head block is the one its producer just signed.
      if (index === currentProducerIndex) {
        return {
          producerRank,
          producerName,
          blockNumber: blockNumber ?? null,
        };
      }

      const latestBlock = latestBlockByWitness.get(producerName);
      const producedInCurrentRound =
        latestBlock !== undefined &&
        earliestBlockInRound !== null &&
        blockNumber !== undefined &&
        latestBlock >= earliestBlockInRound &&
        latestBlock <= blockNumber;

      return {
        producerRank,
        producerName,
        blockNumber: producedInCurrentRound ? latestBlock! : null,
      };
    });
  }, [
    witnesses,
    shuffledWitnesses,
    blockNumber,
    currentProducerIndex,
    latestBlockByWitness,
  ]);

  return {
    scheduledWitnessesData,
    currentProducerIndex,
    shuffledWitnesses,
    futureShuffledWitnesses,
    refetchWitnessSchedule,
    nextShuffleBlockNumber,
    blocksLeftBeforeRefetch,
    isWitnessScheduleLoading,
    isWitnessScheduleError,
  };
};

export default useWitnessesSchedule;
