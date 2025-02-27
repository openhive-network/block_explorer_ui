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
        className="text-left text-sm font-medium uppercase tracking-wider py-1 px-2"
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
        <TableRow className="border-b hover:bg-rowHover transition-colors"> 
          <TableCell className="py-1 px-2 whitespace-nowrap text-sm">
            {rank !== null ? `#${rank}` : "-"}
          </TableCell>
          <TableCell className="py-1 px-2 whitespace-nowrap text-sm">{owner}</TableCell>
          <TableCell className="py-1 px-2 whitespace-nowrap text-xs">{timestamp}</TableCell>
          <TableCell className="py-1 px-2 whitespace-nowrap text-sm">{`[${index + 1}]`}</TableCell>
        </TableRow>
      </React.Fragment>
    );
  });
};

const BackupWitnessSchedule: React.FC<BackupWitnessScheduleProps> = ({
  data,
}) => {
  return (
    <div className="flex w-full overflow-auto">
      <div className="bg-theme rounded-xl shadow-md w-full p-3"> 
        <h2 className="text-xl font-semibold mb-2">Backup Witness Schedule</h2> 
        <div className="overflow-x-auto">
          <Table data-testid="table-body">
            <TableHeader>
              <TableRow>{buildTableHeader()}</TableRow>
            </TableHeader>
            <TableBody>{buildTableBody(data)}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BackupWitnessSchedule;
