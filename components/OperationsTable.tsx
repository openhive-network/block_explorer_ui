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
import { getOperationTypeForDisplay } from "@/utils/UI";
import CopyJSON from "./CopyJSON";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import { colorByOperationCategory } from "./OperationTypesDialog";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface OperationsTableProps {
  operations: Explorer.OperationForTable[];
  unformattedOperations?: Explorer.OperationForTable[];
  className?: string;
}

const localColors = colorByOperationCategory;

const getOperationColor = (operationType: string) => {
  const operationTypeCategories: any = categorizedOperationTypes.find(
    (category) => category.types.includes(operationType)
  );

  const color = localColors[operationTypeCategories.name];

  return color;
};

const getOneLineDescription = (operation: Explorer.OperationForTable) => {
  const { value } = operation?.operation;
  if (typeof value === "string" || React.isValidElement(value)) {
    if (operation.operation.type === "hardfork_operation") {
      return (
        <Link
          className="text-explorer-turquoise"
          href={`/longOperation/${operation?.operationId}`}
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
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useUserSettingsContext();

  const [expanded, setExpanded] = useState<number[]>([]);

  const getUnformattedValue = (operation: Explorer.OperationForTable) => {
    const unformattedOperation = unformattedOperations?.find(
      (op) => op.operationId === operation.operationId
    )?.operation;
    return unformattedOperation ? JSON.stringify(unformattedOperation) : {};
  };

  const renderOperationContent = (
    rawJsonView: boolean,
    prettyJsonView: boolean,
    operation: Explorer.OperationForTable
  ) => {
    if (!rawJsonView && !prettyJsonView) {
      return <div>{getOneLineDescription(operation)}</div>;
    }
    const unformattedOperation = unformattedOperations?.find(
      (op) => op.operationId === operation.operationId
    )?.operation;

    if (prettyJsonView) {
      return <pre>{JSON.stringify(unformattedOperation, null, 2)}</pre>;
    } else {
      return <pre>{JSON.stringify(unformattedOperation)}</pre>;
    }
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
          <TableHead className="sticky left-0 bg-explorer-dark-gray"></TableHead>
          <TableHead className="pl-2 sticky left-12 bg-explorer-dark-gray">
            Block
          </TableHead>
          <TableHead>Transaction</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>Content</TableHead>
          <TableHead></TableHead>
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
                className="border-b border-gray-700"
              >
                <TableCell className="sticky left-0 bg-explorer-dark-gray xl:bg-inherit">
                  <CopyJSON value={getUnformattedValue(operation)} />
                </TableCell>
                <TableCell
                  className="pl-2 sticky left-12 bg-explorer-dark-gray xl:bg-inherit"
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
                <TableCell className="w-1/5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <TimeAgo
                            datetime={
                              new Date(
                                formatAndDelocalizeTime(operation.timestamp)
                              )
                            }
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black dark:bg-explorer-dark-gray dark:text-white">
                        {formatAndDelocalizeTime(operation.timestamp)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell data-testid="operation-type">
                  <div className={`flex justify-stretch p-1 rounded `}>
                    <span
                      className={`rounded w-4 mr-2 ${operationBgColor}`}
                    ></span>
                    <span>
                      {getOperationTypeForDisplay(operation.operation.type)}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className="min-w-[200px] md:max-w-0 w-1/2 py-2"
                  data-testid="operation-content"
                >
                  {renderOperationContent(
                    rawJsonView,
                    prettyJsonView,
                    operation
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className={cn({
                      invisible:
                        operation.operation.type !== "custom_json_operation",
                    })}
                  >
                    {expanded.includes(operation.operationId || 0) ? (
                      <Button
                        className="p-0 h-fit"
                        onClick={() =>
                          setExpanded((prevExpanded) => [
                            ...prevExpanded.filter(
                              (id) => id !== operation.operationId
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
                            operation.operationId || 0,
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
              </TableRow>
              {operation.operation.type === "custom_json_operation" &&
                expanded.includes(operation.operationId || 0) && (
                  <TableRow>
                    <TableCell
                      data-testid="details"
                      colSpan={7}
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
