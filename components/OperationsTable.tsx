import Hive from "@/types/Hive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

interface OperationsTableProps {
  operations: Hive.OperationResponse[];
}

const getOneLineDescription = (operation: Hive.OperationResponse) => {
  const { value } = operation.operation;
  if (typeof value === "string" || React.isValidElement(value)) {
    if (operation.operation.type === "hardfork_operation") {
      return (
        <Link
          className="text-explorer-turquoise"
          href={`/longOperation/${operation.operation_id}`}
        >
          {value}
        </Link>
      );
    } else {
      return value;
    }
  }
  if (operation.operation.type === "custom_json_operation")
    return value.message;
  return null;
};

const OperationsTable: React.FC<OperationsTableProps> = ({ operations }) => {
  return (
    <Table className="rounded-[6px] overflow-hidden max-w-[100%] text-xs">
      <TableHeader>
        <TableRow>
          <TableHead>Block</TableHead>
          <TableHead>Transaction</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead className="w-full"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-w-[100%]">
        {operations.map((operation, index) => (
          <TableRow
            key={operation.operation_id}
            className={cn({
              "border-t border-gray-700": !!index,
            })}
          >
            <TableCell>
              <Link
                className="text-explorer-turquoise"
                href={`/block/${operation.block_num}`}
              >
                {operation.block_num.toLocaleString()}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                className="text-explorer-turquoise"
                href={`/transaction/${operation.trx_id}`}
              >
                {operation.trx_id?.slice(0, 10)}
              </Link>
            </TableCell>
            <TableCell>{operation.operation.type}</TableCell>
            <TableCell className="max-w-0 w-full">
              <div className="truncate">{getOneLineDescription(operation)}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OperationsTable;
