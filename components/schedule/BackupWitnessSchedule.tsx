import React from "react";

import {
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableHeader,
  TableBody,
} from "../ui/table";

const TABLE_CELLS = ["Rank", "Witness", "Timestamp", "Order"];

export interface BackupWitness {
  owner: string;
  timestamp: string;
  rank: number | null;
}

interface BackupWitnessScheduleProps {
  data: BackupWitness[];
}

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

const buildTableBody = (data: BackupWitness[]) => {
  if (!data || !data.length) return;

  return data.map(({ rank, owner, timestamp }: any, index: number) => {
    return (
      <React.Fragment key={index}>
        <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
          <TableCell className="text-left text-text">
            <span className="font-mono grid grid-cols-[repeat(auto-fill,_minmax(1ch,_1fr))] justify-items-end ml-2.5">
              {rank}
            </span>
          </TableCell>
          <TableCell className="text-left text-text">{owner}</TableCell>
          <TableCell className="text-left" >{timestamp}</TableCell>
          <TableCell>{`[${index + 1}]`}</TableCell>
        </TableRow>
      </React.Fragment>
    );
  });
};

const BackupWitnessSchedule: React.FC<BackupWitnessScheduleProps> = ({
  data,
}) => {
  return (
    <>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-4">
          <p className="text-center text-3xl my-2">Backup Witness Schedule</p>
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>{buildTableBody(data)}</TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default BackupWitnessSchedule;
