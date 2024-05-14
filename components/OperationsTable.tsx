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
import { isJson } from "@/utils/StringUtils";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import JSONView from "./JSONView";
import { getOperationTypeForDisplay } from "@/utils/UI";
import CopyJSON from "./CopyJSON";
import { categorizedTypes } from "./OperationTypesDialog";

interface OperationsTableProps {
  operations: Explorer.OperationForTable[];
  unformattedOperations?: Explorer.OperationForTable[];
  className?: string;
}

const colorByOperationCategory: any = {
  Posting: "bg-red-500",
  Curation: "bg-red-950",
  Transfer: "bg-orange-500",
  Market: "bg-orange-800",
  Vesting: "bg-amber-500",
  "Account management": "bg-amber-800",
  "Witness management": "bg-yellow-800",
  "Witness voting": "bg-lime-600",
  Proposals: "bg-green-600",
  Custom: "bg-teal-700",
  Other: "bg-sky-800",
};

const getOperationColor = (operationType: string) => {
  const operationTypeCategories: any = categorizedTypes.find((category) =>
    category.types.includes(operationType)
  );

  const color = colorByOperationCategory[operationTypeCategories.name];

  return color;
};

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
  unformattedOperations,
  className,
}) => {
  const [expanded, setExpanded] = useState<number[]>([]);

  const getUnformattedValue = (operation: Explorer.OperationForTable) => {
    const unformattedOperation = unformattedOperations?.find(
      (op) => op.operatiopnId === operation.operatiopnId
    )?.operation;
    return unformattedOperation ? JSON.stringify(unformattedOperation) : {};
  };

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
          <TableHead></TableHead>
          <TableHead className="pl-2">Block</TableHead>
          <TableHead>Transaction</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead className="w-full">Content</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-w-[100%]">
        {operations.map((operation, index) => {
          const operationBgColor = getOperationColor(operation.operation.type);

          return (
            <React.Fragment key={index}>
              <TableRow
                data-testid="detailed-operation-card"
                key={index}
                className={`${operationBgColor} border-b border-gray-700`}
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
                        <ChevronUp
                          width={20}
                          height={20}
                          className="mt-1"
                        />
                      </Button>
                    ) : (
                      <Button
                        data-testid="expand-details"
                        className="p-0 h-fit"
                        onClick={() =>
                          setExpanded((prevExpanded) => [
                            ...prevExpanded,
                            operation.operatiopnId || 0,
                          ])
                        }
                      >
                        <ChevronDown
                          width={20}
                          height={20}
                          className="mt-1"
                        />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <CopyJSON value={getUnformattedValue(operation)} />
                </TableCell>
                <TableCell
                  className="pl-2"
                  data-testid="block-number-operation-table"
                >
                  <Link
                    className="text-explorer-turquoise"
                    href={`/block/${operation.blockNumber}`}
                  >
                    {operation.blockNumber?.toLocaleString()}
                  </Link>
                </TableCell>
                <TableCell data-testid="transaction-number">
                  <Link
                    className="text-explorer-turquoise"
                    href={`/transaction/${operation.trxId}`}
                  >
                    {operation.trxId?.slice(0, 10)}
                  </Link>
                </TableCell>
                <TableCell data-testid="operation-type">
                  {getOperationTypeForDisplay(operation.operation.type)}
                </TableCell>
                <TableCell
                  className="md:max-w-0 w-full"
                  data-testid="operation-content"
                >
                  <div>{getOneLineDescription(operation)}</div>
                </TableCell>
              </TableRow>
              {operation.operation.type === "custom_json_operation" &&
                expanded.includes(operation.operatiopnId || 0) && (
                  <TableRow>
                    <TableCell
                      data-testid="details"
                      colSpan={6}
                      className="py-2"
                    >
                      <JSONView
                        json={JSON.parse(
                          getOperationValues(operation.operation).json || ""
                        )}
                        skipCopy
                      />
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default OperationsTable;
