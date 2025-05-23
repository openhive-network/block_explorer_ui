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
import { useUserSettingsContext } from "../contexts/UserSettingsContext";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/hybrid-tooltip";
import { useRouter } from "next/router";
import CopyButton from "./ui/CopyButton";
import DataExport from "./DataExport"; // Import DataExport
import { extractTextFromReactElement } from "@/utils/StringUtils";
import DataCountMessage from "./DataCountMessage";

interface OperationsTableProps {
  operationCount?: number;
  operations: Explorer.OperationForTable[];
  unformattedOperations?: Explorer.OperationForTable[];
  markedTrxId?: string;
  className?: string;
  referrer?: string;
  accountName?: string;
}
interface ExportableOperation {
  Block: string;
  Transaction: string;
  Time: string;
  Operation: string;
  Content: string;
}

const localColors = colorByOperationCategory;

export const getOperationColor = (operationType: string) => {
  const operationTypeCategories: any = categorizedOperationTypes.find(
    (category) => category.types.includes(operationType)
  );

  const color = localColors[operationTypeCategories?.name];

  return color;
};

const getOneLineDescription = (operation: Explorer.OperationForTable) => {
  const { value } = operation?.operation;
  if (typeof value === "string" || React.isValidElement(value)) return value;
  if (operation.operation.type === "custom_json_operation")
    return value.message;
  if (operation.operation.type === "body_placeholder_operation") {
    return (
      <div className="text-link">
        <Link
          href={`/longOperation/${operation.operation.value?.["org-op-id"]}`}
        >
          See full operation
        </Link>
      </div>
    );
  }
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
  operationCount,
  operations,
  unformattedOperations,
  markedTrxId,
  className,
  referrer,
  accountName,
}) => {
  const router = useRouter();
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

  const prepareExportData = () => {
    const preparedData = operations.map((operation) => {
      let contentString: string = ""; // Initialize contentString

      const unformattedOperation = unformattedOperations?.find(
        (op) => op.operationId === operation.operationId
      )?.operation;

      if (rawJsonView || prettyJsonView) {
        // JSON view is enabled, use JSON data
        let jsonString = JSON.stringify(
          unformattedOperation,
          null,
          prettyJsonView ? 2 : undefined
        );
        contentString = jsonString; //Set content string to the Json String
      } else {
        // Visualized data view
        const content = renderOperationContent(
          rawJsonView,
          prettyJsonView,
          operation
        );

        if (typeof content === "string") {
          contentString = content;
        } else if (
          React.isValidElement(content) &&
          typeof content.type === "string" &&
          content.type === "div"
        ) {
          // Use the recursive function to extract text content
          contentString = extractTextFromReactElement(content);
        } else {
          contentString = String(content);
        }
      }
      // Replace multiple spaces with single space
      contentString = contentString.replace(/\s+/g, " ");

      return {
        Block: operation.blockNumber?.toLocaleString() || "",
        Transaction: operation.trxId?.slice(0, 10) || "",
        Time: formatAndDelocalizeTime(operation.timestamp),
        Operation: getOperationTypeForDisplay(operation.operation?.type),
        Content: contentString,
      };
    });

    return preparedData;
  };

  return (
    <>
      <div
        className={cn("flex items-center justify-end", {
          "justify-between": !!operationCount,
        })}
      >
        <DataCountMessage
          count={operationCount || 0}
          dataType="operations"
        />
        <DataExport
          data={prepareExportData()}
          filename={`${accountName ? `${accountName}_` : ""}${
            referrer ? referrer : ""
          }`}
          className="mb-2"
        />
      </div>
      <div className="flex w-full overflow-auto rounded">
        <div className="text-text w-[100%] bg-theme">
          <Table>
            <TableHeader>
              <TableRow rowVariant="header">
                <TableHead stickyLeft></TableHead>
                <TableHead stickyLeft={50}>Block</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Content</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation, index, allOperations) => {
                const nextTransactionId: string | undefined =
                  allOperations[index + 1]?.trxId;
                const operationBgColor = getOperationColor(
                  operation.operation?.type
                );
                const operationPerspective =
                  operation.operation?.value?.perspective;

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      id={operation.trxId}
                      data-testid="detailed-operation-card"
                      key={index}
                      className={cn({
                        "border-b-0":
                          nextTransactionId === operation.trxId &&
                          !!operation.trxId,
                        "bg-operationPerspectiveIncoming":
                          operationPerspective === "incoming",
                      })}
                    >
                      <TableCell stickyLeft>
                        <CopyJSON value={getUnformattedValue(operation)} />
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap"
                        stickyLeft={50}
                        data-testid="block-number-operation-table"
                      >
                        <Link
                          className="text-link"
                          href={`/block/${operation.blockNumber}${
                            operation.trxId ? `?trxId=${operation.trxId}` : ""
                          }`}
                        >
                          {operation.blockNumber?.toLocaleString()}
                        </Link>
                        <CopyButton
                          text={operation.blockNumber}
                          tooltipText="Copy block number"
                        />
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap"
                        data-testid="transaction-number"
                      >
                        <Link
                          className={cn("text-link", {
                            "bg-explorer-light-green py-2 px-1 ":
                              markedTrxId === operation.trxId,
                          })}
                          href={`/transaction/${operation.trxId}`}
                        >
                          {operation.trxId?.slice(0, 10)}
                        </Link>
                        {operation.trxId && (
                          <CopyButton
                            text={operation.trxId || ""}
                            tooltipText="Copy transaction ID"
                          />
                        )}
                      </TableCell>
                      <TableCell className="w-1/5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <TimeAgo
                                  datetime={
                                    new Date(
                                      formatAndDelocalizeTime(
                                        operation.timestamp
                                      )
                                    )
                                  }
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-theme text-text">
                              {formatAndDelocalizeTime(operation.timestamp)}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell data-testid="operation-type">
                        <div className="flex justify-start rounded">
                          <span
                            className={`rounded w-4 mr-2 ${operationBgColor}`}
                          ></span>
                          <span>
                            {getOperationTypeForDisplay(
                              operation.operation?.type
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="min-w-[200px] break-words"
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
                              operation.operation.type !==
                              "custom_json_operation",
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
                              className="p-0 h-fit bg-inherit"
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
                                getOperationValues(operation.operation).json ||
                                  ""
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
        </div>
      </div>
    </>
  );
};

export default OperationsTable;
