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

interface TableData {
  producerRank: number | null;
  producerName: string;
  blockNumber: number;
}

interface WitnessSchedule {
  data: TableData[];
  currentProducer: string | undefined;
  currentBlock: number | undefined;
  nextShuffleBlockNumber: number | string;
  blocksLeftBeforeRefetch: number | string;
}

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
        <React.Fragment key={index}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
            <TableCell className="">{producerRank}</TableCell>
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
    <>
      <div className="flex justify-center items-center w-full h-full overflow-auto">
        <div className="text-white min-w-[50%] bg-theme dark:bg-theme">
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
    </>
  );
};

export default WitnessSchedule;
