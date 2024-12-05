import React from "react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import { cn } from "@/lib/utils";

export interface Witness {
  producerRank: number | null;
  producerName: string;
  blockNumber: number;
}

interface WitnessSchedule {
  data: Witness[];
  currentProducer: string | undefined;
  currentBlock: number | undefined;
  nextShuffleBlockNumber: number | string;
  blocksLeftBeforeRefetch: number | string;
}

const TABLE_CELLS = ["Rank", "Witness", "Block"];

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className="text-left text-[1.5rem] "
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (
  data: Witness[],
  currentProducer: string | undefined,
  currentBlock: number | undefined
) => {
  if (!data || !data.length) return;

  return data.map(
    ({ producerRank, producerName, blockNumber }, index: number) => {
      return (
        <React.Fragment key={index}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
          <TableCell>
            <span 
                className="font-mono grid grid-cols-[repeat(auto-fill,_minmax(1ch,_1fr))] justify-items-end ml-2.5">
              {producerRank}
            </span>
          </TableCell>
            <TableCell
              className={cn("text-left", {
                "text-gray-300 dark:text-gray-500":
                  !!blockNumber && producerName !== currentProducer,
                "text-explorer-light-green": producerName === currentProducer,
              })}
            >
              {producerName}
            </TableCell>
            <TableCell
              className={cn({
                "text-gray-300 dark:text-gray-500":
                  blockNumber !== currentBlock,
              })}
            >
              {blockNumber}
            </TableCell>
          </TableRow>
        </React.Fragment>
      );
    }
  );
};

const WitnessSchedule: React.FC<WitnessSchedule> = ({
  data,
  currentProducer,
  currentBlock,
  nextShuffleBlockNumber,
  blocksLeftBeforeRefetch,
}) => {
  return (
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-4">
          <p className="text-center text-3xl my-2">Witness Schedule</p>

          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>
              {buildTableBody(data, currentProducer, currentBlock)}
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
  );
};

export default WitnessSchedule;
