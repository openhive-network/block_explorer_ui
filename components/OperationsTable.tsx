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
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import JSONView from "./JSONView";
import { getOperationTypeForDisplay } from "@/utils/UI";
import CopyJSON from "./CopyJSON";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import { colorByOperationCategory } from "./OperationTypesDialog";
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
import { useI18n } from "../i18n/i18n";
import { safelyParseJson } from "@/utils/JsonUtils";
import { useSettings } from "@/contexts/SettingsContext";
import useOperation from "@/hooks/api/common/useOperation";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";

interface OperationsTableProps {
  operationCount?: number;
  operations: Explorer.OperationForTable[];
  unformattedOperations?: Explorer.OperationForTable[];
  markedTrxId?: string;
  markedOpId?: number;
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

const getOneLineDescription = (
  operation: Explorer.OperationForTable,
  t: (key: string) => string
) => {
  const { value } = operation?.operation;
  if (typeof value === "string" || React.isValidElement(value)) return value;
  if (operation.operation.type === "custom_json_operation")
    return value.message;
  if (operation.operation.type === "body_placeholder_operation") {
    const operationId = value?.["org-op-id"];
    const originalType = (value as any)?.["org-operation_type"];

    //If it's a comment, use the dynamic component
    if (originalType === "comment_operation" && operationId) {
      return <LongCommentDescription operationId={String(operationId)} t={t} />;
    }

    return (
      <div className="text-link">
        <Link
          onClick={(e) => e.stopPropagation()}
          href={`/longOperation/${operation.operation.value?.["org-op-id"]}`}
        >
          {t("operationsTable.seeFullOperation")}
        </Link>
      </div>
    );
  }
  return null;
};

const LongCommentDescription = ({
  operationId,
  t,
}: {
  operationId: string;
  t: (key: string) => string;
}) => {
  const { operationData, operationDataIsFetched } = useOperation(operationId);
  const formattedAccountOperations = useOperationsFormatter(operationData);

  if (!operationDataIsFetched) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }
  return formattedAccountOperations.op.value;
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
  markedOpId,
  referrer,
  accountName,
}) => {
  const router = useRouter();
  const { locale: appLocale, t } = useI18n();
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useSettings();

  const [expanded, setExpanded] = useState<number[]>([]);

  //useEffect to scroll to the marked operation row
  useEffect(() => {
    if (markedOpId !== undefined && operations.length > 0) {
      // Use a short timeout to ensure the DOM has finished rendering after the state update
      setTimeout(() => {
        const element = document.querySelector(`[data-op-id="${markedOpId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [markedOpId, operations]);

  const handleRowClick = (operation: Explorer.OperationForTable) => {
    if (!operation.blockNumber) return;

    const { blockNumber, trxId, operationId } = operation;

    const params = new URLSearchParams();
    if (trxId) {
      params.append("trxId", trxId);
    }
    if (operationId !== undefined && operationId !== null) {
      params.append("opId", String(operationId));
    }

    const queryString = params.toString();
    const url = `/block/${blockNumber}${queryString ? `?${queryString}` : ""}`;

    router.push(url);
  };

  const getUnformattedValue = (operation: Explorer.OperationForTable) => {
    const unformattedOperation = unformattedOperations?.find(
      (op) => op.operationId === operation.operationId
    )?.operation;
    return unformattedOperation ? JSON.stringify(unformattedOperation) : {};
  };

  // Cache last non-empty operation content by operationId
  const lastContentRef = useRef<Record<number, React.ReactNode>>({});

  const renderOperationContent = (
    rawJsonView: boolean,
    prettyJsonView: boolean,
    operation: Explorer.OperationForTable
  ) => {
    let content: React.ReactNode;
    if (!rawJsonView && !prettyJsonView) {
      content = <div>{getOneLineDescription(operation, t)}</div>;
    } else {
      const unformattedOperation = unformattedOperations?.find(
        (op) => op.operationId === operation.operationId
      )?.operation;
      if (prettyJsonView) {
        content = <pre>{JSON.stringify(unformattedOperation, null, 2)}</pre>;
      } else {
        content = <pre>{JSON.stringify(unformattedOperation)}</pre>;
      }
    }
    // Only update cache if content is not empty/null/undefined
    const opId = operation.operationId;
    const isValid =
      content &&
      !(
        typeof content === 'string' &&
        (content as string).trim &&
        (content as string).trim() === ''
      );
    if (opId !== undefined && isValid) {
      lastContentRef.current[opId] = content;
    }
    // Return cached content if current is empty
    if (opId !== undefined && !isValid && lastContentRef.current[opId]) {
      return lastContentRef.current[opId];
    }
    return content;
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
          contentString = extractTextFromReactElement(content,t);
        } else {
          contentString = String(content);
        }
      }
      // Replace multiple spaces with single space
      contentString = contentString.replace(/\s+/g, " ");

      return {
        [t("operationsTable.block")]:
          operation.blockNumber?.toLocaleString() || "",
        [t("operationsTable.transaction")]: operation.trxId?.slice(0, 10) || "",
        [t("operationsTable.date")]: formatAndDelocalizeTime(
          operation.timestamp
        ),
        [t("operationsTable.operation")]: getOperationTypeForDisplay(
          operation.operation?.type
        ),
        [t("operationsTable.content")]: contentString,
      };
    });

    return preparedData;
  };

  return (
    <>
      <div
        className={cn("table-toolbar", {
          "justify-between": !!operationCount,
        })}
      >
        <DataCountMessage
          count={operationCount || 0}
          dataType="common.operations"
        />
        <DataExport
          data={prepareExportData()}
          filename={`${accountName ? `${accountName}_` : ""}${
            referrer ? referrer : ""
          }`}
        />
      </div>
      <div className="flex w-full overflow-auto rounded">
        <div className="text-text w-[100%] bg-theme">
          <Table enableMobileScrollArrows enableCompactToggle>
            <TableHeader>
              <TableRow rowVariant="header">
                <TableHead stickyLeft></TableHead>
                <TableHead stickyLeft={50}>
                  {t("operationsTable.block")}
                </TableHead>
                <TableHead>{t("operationsTable.transaction")}</TableHead>
                <TableHead>{t("operationsTable.date")}</TableHead>
                <TableHead>{t("common.operations")}</TableHead>
                <TableHead>{t("operationsTable.content")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation, index, allOperations) => {
                const op = operation.operation;
                const isPlaceholder = op?.type === "body_placeholder_operation";
                const originalType = (op.value as any)?.["org-operation_type"];
                
                // If it's a placeholder for a comment, treat it as a comment for UI/Color purposes
                const effectiveType = (isPlaceholder && originalType === "comment_operation")
                  ? "comment_operation"
                  : op?.type;

                const nextTransactionId: string | undefined =
                  allOperations[index + 1]?.trxId;
                    const operationBgColor = getOperationColor(effectiveType);
                const operationPerspective =
                  operation.operation?.value?.perspective;

                const isMarkedTransaction =
                  operation.trxId === markedTrxId && !!markedTrxId;
                const isFirstInGroup =
                  isMarkedTransaction &&
                  allOperations[index - 1]?.trxId !== operation.trxId;
                const isLastInGroup =
                  isMarkedTransaction &&
                  allOperations[index + 1]?.trxId !== operation.trxId;
                const isMiddleOfGroup =
                  isMarkedTransaction && !isFirstInGroup && !isLastInGroup;

                const isMarkedOperation = operation.operationId === markedOpId;

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      id={operation.trxId}
                      data-op-id={operation.operationId}
                      data-testid="detailed-operation-card"
                      key={index}
                      onClick={() => handleRowClick(operation)}
                      className={cn("cursor-pointer hover:bg-rowHover", {
                        "border-b-0":
                          nextTransactionId === operation.trxId &&
                          !!operation.trxId,
                        "bg-operationPerspectiveIncoming":
                          operationPerspective === "incoming",
                        "border-l-8 border-l-sky-400 dark:border-l-sky-500":
                          isMarkedTransaction,
                        "bg-rowHover": isMarkedOperation,
                        " border-l-8 border-l-sky-400 dark:border-l-sky-500":
                          isMarkedOperation,
                      })}
                    >
                      <TableCell stickyLeft>
                        <div onClick={(e) => e.stopPropagation()}>
                          <CopyJSON value={getUnformattedValue(operation)} />
                        </div>
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap"
                        stickyLeft={50}
                        data-testid="block-number-operation-table"
                      >
                        <Link
                          onClick={(e) => e.stopPropagation()}
                          className="text-link"
                          href={`/block/${operation.blockNumber}${
                            operation.trxId ? `?trxId=${operation.trxId}` : ""
                          }`}
                        >
                          {operation.blockNumber?.toLocaleString()}
                        </Link>
                        <CopyButton
                          text={operation.blockNumber}
                          tooltipText={t("common.copyBlockNumber")}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell
                        className="whitespace-nowrap"
                        data-testid="transaction-number"
                      >
                        <Link
                          onClick={(e) => e.stopPropagation()}
                          className="text-link"
                          href={`/tx/${operation.trxId}`}
                        >
                          {operation.trxId?.slice(0, 10)}
                        </Link>
                        {operation.trxId && (
                          <CopyButton
                            text={operation.trxId || ""}
                            tooltipText={t("common.copyTransactionId")}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </TableCell>
                      <TableCell className="w-1/5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <TimeAgo
                                  locale={appLocale}
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
                            {(() => {
                              const op = operation.operation;
                              let displayType = op?.type;

                              if (op?.type === "body_placeholder_operation") {
                                // check if the original type is specifically "comment_operation"
                                const originalType = (op.value as any)?.[
                                  "org-operation_type"
                                ];
                                if (originalType === "comment_operation") {
                                  displayType = "comment_operation";
                                }
                                // If it's something else  it stays as 'body_placeholder_operation'
                              }
                              return getOperationTypeForDisplay(displayType);
                            })()}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((prevExpanded) => [
                                  ...prevExpanded.filter(
                                    (id) => id !== operation.operationId,
                                  ),
                                ]);
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((prevExpanded) => [
                                  ...prevExpanded,
                                  operation.operationId || 0,
                                ]);
                              }}
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
                            className={cn("py-2 break-all", {
                              "bg-rowHover": isMarkedOperation,
                              "border-l-8 border-l-sky-400 dark:border-l-sky-500":
                                isMarkedOperation,
                            })}
                          >
                            <JSONView
                              json={safelyParseJson(
                                getOperationValues(operation.operation).json ||
                                  "",
                                t
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
