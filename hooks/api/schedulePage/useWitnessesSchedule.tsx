import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useHeadBlock from "../homePage/useHeadBlock";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

interface WitnessScheduleTableData {
  producerRank: number | null;
  producerName: string;
  blockNumber: number;
}
type BlockSchedule = {
  [key: string]: number;
};

const useWitnessesSchedule = (
  witnesses: Hive.Witness[],
  headBlockNumberData: number
) => {
  const {
    data,
    isLoading,
    isError,
    refetch: refetchWitnessSchedule,
  } = useQuery({
    queryKey: ["witness_schedule"],
    queryFn: () => fetchingService.getWitnessSchedule(),
  });

  const { headBlockData } = useHeadBlock(headBlockNumberData);

  const [scheduledWitnessesData, setScheduledWitnessesData] = useState<
    WitnessScheduleTableData[]
  >([]);
  const [blockSchedule, setBlockSchedule] = useState<BlockSchedule>({});

  const shuffledWitnesses = data?.current_shuffled_witnesses;
  const producerAccount = headBlockData?.producer_account;
  const blockNumber = headBlockData?.block_num;
  const nextShuffleBlockNumber = data?.next_shuffle_block_num || 0;
  const blocksLeftBeforeRefetch = nextShuffleBlockNumber - headBlockNumberData;

  useEffect(() => {
    if (!headBlockData || !headBlockNumberData) return;

    setBlockSchedule((prevBlock: any) => {
      if (!prevBlock) return;

      return { ...prevBlock, [`${producerAccount}`]: blockNumber };
    });
  }, [headBlockData, blockNumber, producerAccount, headBlockNumberData]);

  useEffect(() => {
    if (!shuffledWitnesses || !blockNumber || !headBlockData) return;

    const initialUsersArray = shuffledWitnesses.map((userName: string) => {
      const rank =
        witnesses?.find((data: any) => data.witness_name === userName)?.rank ||
        null;

      return {
        producerRank: rank,
        producerName: userName,
        blockNumber: blockSchedule[userName],
      };
    });

    setScheduledWitnessesData(initialUsersArray);
  }, [witnesses, shuffledWitnesses, blockNumber, headBlockData, blockSchedule]);

  return {
    scheduledWitnessesData,
    setBlockSchedule,
    refetchWitnessSchedule,
    nextShuffleBlockNumber,
    blocksLeftBeforeRefetch,
    isLoading,
    isError,
  };
};

export default useWitnessesSchedule;
