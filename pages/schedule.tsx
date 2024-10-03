import { Fragment, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import fetchingService from "@/services/FetchingService";
import { cn } from "@/lib/utils";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import ErrorPage from "./ErrorPage";

interface TableData {
  producerRank: number | null;
  producerName: string;
  blockNumber: number;
}

type BlockSchedule = {
  [key: string]: number;
};

const TABLE_CELLS = ["Witness Rank", "Witness", "Block"];

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className="text-left text-[1.5rem]"
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (
  data: TableData[],
  currentProducer: string | undefined,
  currentBlock: number | undefined
) => {
  if (!data || !data.length) return;

  return data.map(
    ({ producerRank, producerName, blockNumber }, index: number) => {
      return (
        <Fragment key={index}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
            <TableCell className="">{producerRank}</TableCell>
            <TableCell
              className={cn("text-left", {
                "text-gray-700 dark:text-gray-500":
                  !!blockNumber && producerName !== currentProducer,
                "text-explorer-light-green": producerName === currentProducer,
              })}
            >
              {producerName}
            </TableCell>
            <TableCell
              className={cn({
                "text-gray-700 dark:text-gray-500":
                  blockNumber !== currentBlock,
              })}
            >
              {blockNumber}
            </TableCell>
          </TableRow>
        </Fragment>
      );
    }
  );
};

const Schedule = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["witness_schedule"],
    queryFn: () => fetchingService.getWitnessSchedule(),
  });
  const { witnessesData } = useWitnesses(200, "rank", "asc");
  const { headBlockNumberData } = useHeadBlockNumber();
  const { headBlockData } = useHeadBlock(headBlockNumberData);

  const [blockSchedule, setBlockSchedule] = useState<BlockSchedule>({});
  const [scheduledWitnessesData, setScheduledWitnessesData] = useState<
    TableData[]
  >([]);

  const shuffledWitnesses = data?.current_shuffled_witnesses;
  const nextShuffleBlockNumber = data?.next_shuffle_block_num || 0;

  const blockNumber = headBlockData?.block_num;
  const producerAccount = headBlockData?.producer_account;

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
        witnessesData?.witnesses?.find((data) => data.witness_name === userName)
          ?.rank || null;

      return {
        producerRank: rank,
        producerName: userName,
        blockNumber: blockSchedule[userName],
      };
    });

    setScheduledWitnessesData(initialUsersArray);
  }, [
    witnessesData,
    shuffledWitnesses,
    blockNumber,
    headBlockData,
    blockSchedule,
  ]);

  useEffect(() => {
    if (blocksLeftBeforeRefetch <= 0) {
      setBlockSchedule({});
      refetch();
    }
  }, [refetch, blocksLeftBeforeRefetch]);

  if (isError) return <ErrorPage />;

  const isDataLoading =
    isLoading || !nextShuffleBlockNumber || !headBlockNumberData;

  return isDataLoading ? (
    <div className="flex justify-center items-center">
      <Loader2 className="animate-spin mt-1 h-12 w-12 ml-3 ..." />
    </div>
  ) : (
    <>
      <div className="flex justify-center items-center w-full h-full overflow-auto">
        <div className="text-white min-w-[50%] bg-theme dark:bg-theme">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(
                scheduledWitnessesData,
                producerAccount,
                headBlockNumberData
              )}
            </TableBody>
          </Table>
          <div className="text-center my-4">
            <p>
              Next shuffle block number <br /> {nextShuffleBlockNumber}{" "}
              <small>(left {blocksLeftBeforeRefetch})</small>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule;
