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
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import JSONView from "./JSONView";

interface OperationsTableProps {
  operations: Explorer.OperationForTable[];
  aggregate?: boolean;
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

const getOperationValues = (operation: Hive.Operation) => {
  let valueAsObject = operation.value;
  if (typeof valueAsObject === "string") {
    valueAsObject = { message: valueAsObject };
  }
  return valueAsObject;
};

const OperationsTable: React.FC<OperationsTableProps> = ({
  operations,
  aggregate,
  className,
}) => {
  const [expanded, setExpanded] = useState<number[]>([]);

  return (
    <Table
      className={cn(
        "rounded-[6px] overflow-hidden max-w-[100%] text-xs",
        className
      )}
    >
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead className="pl-2">Block</TableHead>
          <TableHead>Transaction</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead className="w-full">Content</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-w-[100%]">
        {operations.map((operation, index) => (
          <React.Fragment key={index}>
            <TableRow data-testid='detailed-operation-card'
              key={index}
              className={cn({
                "!border-t border-gray-700":
                  !!index || index === operations.length - 1,
              })}
            >
              <TableCell>
                <div
                  className={cn({
                    invisible:
                      operation.operation.type !== "custom_json_operation",
                  })}
                >
                  {expanded.includes(operation.operatiopnId || 0) ? (
                    <Button
                      className="p-0 h-fit"
                      onClick={() =>
                        setExpanded((prevExpanded) => [
                          ...prevExpanded.filter(
                            (id) => id !== operation.operatiopnId
                          ),
                        ])
                      }
                    >
                      <ChevronUp width={20} height={20} className="mt-1" />
                    </Button>
                  ) : (
                    <Button
                      className="p-0 h-fit"
                      onClick={() =>
                        setExpanded((prevExpanded) => [
                          ...prevExpanded,
                          operation.operatiopnId || 0,
                        ])
                      }
                    >
                      <ChevronDown width={20} height={20} className="mt-1" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="pl-2">
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
              <TableCell data-testid="operation-type">
                {operation.operation.type}
              </TableCell>
              <TableCell className="max-w-0 w-full">
                <div className="truncate">
                  {getOneLineDescription(operation)}
                </div>
              </TableCell>
            </TableRow>
            {aggregate &&
              !!operation.trxId &&
              operations
                .filter(
                  (op) => op.trxId === operation.trxId && op !== operation
                )
                .map((op) => (
                  <TableRow key={op.operatiopnId}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>Virtual</TableCell>
                    <TableCell data-testid="operation-type-virtual">
                      {op.operation.type}
                    </TableCell>
                    <TableCell className="max-w-0 w-full">
                      <div className="truncate">
                        {getOneLineDescription(op)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {operation.operation.type === "custom_json_operation" &&
              expanded.includes(operation.operatiopnId || 0) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <JSONView
                      json={JSON.parse(
                        getOperationValues(operation.operation).json || ""
                      )}
                    />
                  </TableCell>
                </TableRow>
              )}
          </ React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default OperationsTable;
