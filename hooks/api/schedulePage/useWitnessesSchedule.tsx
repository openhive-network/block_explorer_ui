import { useEffect, useMemo, useState } from "react";
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
  const [latestBlockByWitness, setLatestBlockByWitness] = useState(
    () => new Map<string, number>()
  );

  useEffect(() => {
    setLatestBlockByWitness((knownBlocks) => {
      const blocksByWitness = new Map(knownBlocks);
      let changed = false;

      const remember = (witness: string, block: number) => {
        const knownBlock = blocksByWitness.get(witness);

        if (knownBlock === undefined || block > knownBlock) {
          blocksByWitness.set(witness, block);
          changed = true;
        }
      };

      (lastBlocksData || []).forEach(({ witness, block_num }) =>
        remember(witness, block_num)
      );

      if (producerAccount && blockNumber !== undefined) {
        remember(producerAccount, blockNumber);
      }

      return changed ? blocksByWitness : knownBlocks;
    });
  }, [lastBlocksData, producerAccount, blockNumber]);

  // Head minus index only holds if every earlier slot produced, so the round is
  // walked back over the blocks that were actually produced instead.
  const earliestBlockInRound = useMemo(() => {
    if (
      !shuffledWitnesses?.length ||
      blockNumber === undefined ||
      currentProducerIndex < 0
    )
      return null;

    const witnessByBlock = new Map<number, string>(
      (lastBlocksData || []).map(
        ({ block_num, witness }): [number, string] => [block_num, witness]
      )
    );

    // A round has one slot per witness, so it can span no more blocks than that.
    const oldestPossibleBlock = blockNumber - shuffledWitnesses.length + 1;
    let roundStart = blockNumber;
    let previousIndex = currentProducerIndex;

    for (let block = blockNumber - 1; block >= oldestPossibleBlock; block--) {
      const witness = witnessByBlock.get(block);

      // A block the list has not caught up with yet says nothing either way.
      if (witness === undefined) continue;

      const index = shuffledWitnesses.indexOf(witness);

      // Slots only move forward within a round, so anything else is the one
      // before it: a witness dropped from the schedule, or a repeated position.
      if (index < 0 || index >= previousIndex) break;

      previousIndex = index;
      roundStart = block;

      if (index === 0) break;
    }

    return roundStart;
  }, [shuffledWitnesses, lastBlocksData, blockNumber, currentProducerIndex]);

  const scheduledWitnessesData = useMemo<WitnessScheduleTableData[]>(() => {
    if (!shuffledWitnesses?.length) return [];

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
    earliestBlockInRound,
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
