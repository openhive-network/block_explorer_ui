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
import Explorer from "@/types/Explorer";

interface OperationsTableProps {
  operations: Explorer.OperationForTable[];
  className?: string;
}

const getOneLineDescription = (operation: Explorer.OperationForTable) => {
  const { value } = operation?.operation;
  if (typeof value === "string" || React.isValidElement(value)) {
    if (operation.operation.type === "hardfork_operation") {
      return (
        <Link
          className="text-explorer-turquoise"
          href={`/longOperation/${operation?.operatiopnId}`}
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

const OperationsTable: React.FC<OperationsTableProps> = ({ operations, className }) => {
  return (
    <Table className={cn("rounded-[6px] overflow-hidden max-w-[100%] text-xs", className)}>
      <TableHeader>
        <TableRow>
          <TableHead>Block</TableHead>
          <TableHead>Transaction</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead className="w-full">Content</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-w-[100%]">
        {operations.map((operation, index) => (
          <TableRow data-testid="detailed-operation-card"
            key={index}
            className={cn({
              "border-t border-gray-700": !!index,
            })}
          >
            <TableCell>
              <Link
                className="text-explorer-turquoise"
                href={`/block/${operation.blockNumber}`}
              >
                {operation.blockNumber?.toLocaleString()}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                className="text-explorer-turquoise"
                href={`/transaction/${operation.trxId}`}
              >
                {operation.trxId?.slice(0, 10)}
              </Link>
            </TableCell>
            <TableCell data-testid="operation-type">{operation.operation.type}</TableCell>
            <TableCell data-testid="content" className="max-w-0 w-full">
              <div className="truncate">{getOneLineDescription(operation)}</div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OperationsTable;
