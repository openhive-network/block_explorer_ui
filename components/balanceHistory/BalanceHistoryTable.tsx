import { useState, useRef, useEffect } from "react";
import Hive from "@/types/Hive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import { getOperationTypeForDisplay } from "@/utils/UI";
import { categorizedOperationTypes } from "@/utils/CategorizedOperationTypes";
import { colorByOperationCategory } from "../OperationTypesDialog";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useRouter } from "next/router";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useOperation from "@/hooks/api/common/useOperation";
import { formatNumber } from "@/lib/utils";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { ChevronDown, ChevronUp } from "lucide-react";
import CopyButton from "../ui/CopyButton";
import DataExport from "../DataExport";

interface BalanceHistoryTableProps {
  operations: Explorer.BalanceHistoryForTable[];
  total_operations: number;
  total_pages: number;
  current_page: number;
  account_name: string;
}

const BalanceHistoryTable: React.FC<BalanceHistoryTableProps> = ({
  operations,
  total_operations,
  total_pages,
  current_page,
  account_name,
}) => {
  const router = useRouter();
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useUserSettingsContext();

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const operationsTypes = useOperationsTypes().operationsTypes || [];

  // Create refs to store row and detail div elements
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());
  const detailRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Track screen size for mobile responsiveness
  const [isMobile, setIsMobile] = useState(false);

  // Set screen size check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const formatRawCoin = (coinValue: number) =>
    router.query.coinType === "VESTS"
      ? formatNumber(coinValue, true, false)
      : formatNumber(coinValue, false, false);

  const getOperationColor = (op_type_id: number) => {
    const operation = operationsTypes.find(
      (op) => op.op_type_id === op_type_id
    );
    if (!operation) return "";
    const category = categorizedOperationTypes.find((cat) =>
      cat.types.includes(operation.operation_name)
    );
    return category ? colorByOperationCategory[category.name] : "";
  };

  const getOperationTypeForDisplayById = (op_type_id: number) =>
    getOperationTypeForDisplay(
      operationsTypes.find((op) => op.op_type_id === op_type_id)
        ?.operation_name || ""
    );

  const updateUrl = (page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: page.toString() },
    });
  };

  const OperationDetails: React.FC<{ operationId: number }> = ({
    operationId,
  }) => {
    const { operationData, operationDataIsFetched, operationDataError } =
      useOperation(operationId.toString());
    const formattedAccountOperations = useOperationsFormatter(operationData);
    if (operationDataIsFetched) {
      if (!operationData || Object.keys(operationData).length === 0) {
        return <p>No records for operation {operationId}</p>;
      }
      if (!rawJsonView && !prettyJsonView) {
        return <div>{getOneLineDescription(formattedAccountOperations)}</div>;
      }

      if (prettyJsonView) {
        return <pre>{JSON.stringify(operationData.op, null, 2)}</pre>;
      } else {
        return <pre>{JSON.stringify(operationData.op)}</pre>;
      }
    }

    if (operationDataError) {
      return <p>Error fetching operation details.</p>;
    }

    return <p>Loading operation details...</p>;
  };

  const getOneLineDescription = (operation: any) => {
    const value = operation.op.value;
    // Check if 'value' is a string or a valid React element
    if (typeof value === "string" || React.isValidElement(value)) {
      // If trxId is present, prepend a div with a link to the transaction page
      if (operation.trx_id) {
        return (
          <>
            {value}
            <div>
              <span>Transaction : </span>
              <Link
                className="text-link"
                href={`/transaction/${operation.trx_id}`}
              >
                {operation.trx_id?.slice(0, 10)}{" "}
              </Link>
              <CopyButton
                text={operation.trx_id || ""}
                tooltipText="Copy transaction ID"
              />
            </div>
          </>
        );
      }
      return value;
    }

    return null;
  };

  const handleRowClick = (operationId: number) => {
    setExpandedRow((prev) => (prev === operationId ? null : operationId));

    // Scroll the corresponding row and details into view with additional margin for visibility
    const rowElement = rowRefs.current.get(operationId);
    const detailElement = detailRefs.current.get(operationId);

    if (rowElement && detailElement) {
      // Ensure smooth scrolling for both row and details
      rowElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const coinName = router.query.coinType
                  ? router.query.coinType
                  : "HIVE";

  const prepareExportData = () => {
    return operations.map((operation) => {
      return {
        "Operation Type": getOperationTypeForDisplayById(operation.opTypeId),
        Date: operation.timestamp
          ? new Date(operation.timestamp).toLocaleString()
          : "",
        Timestamp: operation.timestamp || "",
        "Block Number": operation.blockNumber?.toLocaleString() || "",
        Balance: `${formatRawCoin(operation.prev_balance)} ${coinName}`,
        "Balance Change": `${formatRawCoin(operation.balanceChange)} ${coinName}`,
        "New Balance": `${formatRawCoin(operation.balance)} ${coinName}`,
      };
    });
  };

  return (
    <>
    <div className="sticky z-20 top-[3.2rem] md:top-[4rem]">
        <CustomPagination
          currentPage={current_page ? current_page : 1}
          onPageChange={updateUrl}
          pageSize={config.standardPaginationSize}
          totalCount={total_operations}
          className="text-black dark:text-white"
          isMirrored={false}
        />
      </div>
      {total_operations === 0 ? (
        <div className="flex justify-center w-full">
          No results matching given criteria
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <DataExport
              data={prepareExportData()}
              filename={`${account_name}_balance_history.csv`}
              className="mt-2"
            />
          </div>

          <Table
            className={cn(
              "rounded-[6px] overflow-hidden max-w-full text-xs mt-3"
            )}
          >
            <TableHeader>
              <TableRow>
                <TableHead>Operation Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Block Number</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Balance Change</TableHead>
                <TableHead>New Balance</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((operation, index) => {
                const operationBgColor = getOperationColor(operation.opTypeId);
                const isExpanded = expandedRow === operation.operationId;

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      ref={(el) =>
                        el && rowRefs.current.set(operation.operationId, el)
                      }
                      className={isExpanded ? "bg-rowOdd" : ""}
                    >
                      <TableCell data-testid="operation-type">
                        <div className="flex justify-start rounded">
                          <span
                            className={`rounded w-4 mr-2 ${operationBgColor}`}
                          ></span>
                          <span>
                            {getOperationTypeForDisplayById(operation.opTypeId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      <TableCell
                        data-testid="block-number"
                        className="whitespace-nowrap"
                      >
                        <Link
                          className="text-link"
                          href={`/block/${operation.blockNumber}`}
                        >
                          {operation.blockNumber?.toLocaleString()}
                        </Link>
                        <CopyButton
                          text={operation.blockNumber}
                          tooltipText="Copy block number"
                        />
                      </TableCell>
                      <TableCell data-testid="operation-prev-balance">
                        {formatRawCoin(operation.prev_balance)} {coinName}
                      </TableCell>
                      <TableCell data-testid="operation-balance-change">
                        {formatRawCoin(operation.balanceChange)} {coinName}
                      </TableCell>
                      <TableCell>
                        {formatRawCoin(operation.balance)} {coinName}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleRowClick(operation.operationId)}
                          className="text-link"
                        >
                          {isExpanded ? (
                            <ChevronUp
                              size={20}
                              data-testid="last-updated-icon"
                            />
                          ) : (
                            <ChevronDown
                              size={20}
                              data-testid="last-updated-icon"
                            />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow
                        ref={(el) =>
                          el &&
                          detailRefs.current.set(operation.operationId, el)
                        }
                      >
                        <TableCell colSpan={7} className="p-4">
                          <div className="border rounded-2xl p-4">
                            <h3 className="text-lg font-bold">
                              Operation Details
                            </h3>
                            <OperationDetails
                              operationId={operation.operationId}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}
    </>
  );
};

export default BalanceHistoryTable;
