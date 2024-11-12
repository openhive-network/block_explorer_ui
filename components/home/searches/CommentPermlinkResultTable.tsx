import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableHeader,
  TableBody,
} from "@/components/ui/table";
import Hive from "@/types/Hive";

interface CommentPermlinkResultTableProps {
  data: Hive.Permlink[];
}

const TABLE_CELLS = [
  "Block",
  "Operation Id",
  "Permlink",
  "Timestamp",
  "Trx Id",
];

const buildTableHeader = () => {
  return TABLE_CELLS.map((cell, index) => {
    return (
      <TableHead
        className="text-left text-[1.2rem]"
        key={index}
      >
        {cell}
      </TableHead>
    );
  });
};

const buildTableBody = (data: Hive.Permlink[]) => {
  if (!data || !data.length) return;

  return data.map(
    ({ block, operation_id, permlink, timestamp, trx_id }: any) => {
      return (
        <React.Fragment key={trx_id}>
          <TableRow className="border-b border-gray-700 hover:bg-inherit p-[10px]">
            <TableCell className="text-left text-text">{block}</TableCell>
            <TableCell className="text-left text-text">
              {operation_id}
            </TableCell>
            <TableCell className="text-right">{permlink}</TableCell>
            <TableCell className="text-left text-text">{timestamp}</TableCell>
            <TableCell className="text-left text-text">{trx_id}</TableCell>
          </TableRow>
        </React.Fragment>
      );
    }
  );
};

const CommentPermlinkResultTable = ({
  data,
}: CommentPermlinkResultTableProps) => {
  return (
    <>
      <div className="flex w-full overflow-auto">
        <div className="text-text w-[100%] bg-theme dark:bg-theme p-5">
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

export default CommentPermlinkResultTable;
