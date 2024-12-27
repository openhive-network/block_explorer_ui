import { useState } from "react";
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
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { convertOperationResultsToTableOperations } from "@/lib/utils";
interface BalanceHistoryTableProps {
  operations: Explorer.BalanceHistoryForTable[];
  total_operations: number;
  total_pages: number;
  current_page: number;
}

const BalanceHistoryTable: React.FC<BalanceHistoryTableProps> = ({
  operations,
  total_operations,
  total_pages,
  current_page,
}) => {
  const router = useRouter();
  const {
    settings: { rawJsonView, prettyJsonView },
  } = useUserSettingsContext();

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const operationsTypes = useOperationsTypes().operationsTypes || [];

  const formatRawCoin = (coinValue: number) =>
    router.query.coinType === 'VESTS' ? formatNumber(coinValue, true, false) : formatNumber(coinValue, false, false);

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
            </div>
          </>
        );
      }
      return value;
    }

    return null;
  };

  return (
    <>
      <CustomPagination
        currentPage={current_page ? current_page : 1}
        onPageChange={updateUrl}
        pageSize={config.standardPaginationSize}
        totalCount={total_operations}
        className="text-black dark:text-white"
        isMirrored={false}
      />
      {total_operations === 0 ? (
        <div className="flex justify-center w-full">
          No results matching given criteria
        </div>
      ) : (
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
              const coinName = router.query.coinType
                ? router.query.coinType
                : "HIVE";
              const isExpanded = expandedRow === operation.operationId;

              return (
                <React.Fragment key={index}>
                  <TableRow key={operation.operationId}>
                    <TableCell data-testid="operation-type">
                      <div className="flex justify-stretch p-1 rounded">
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
                                    formatAndDelocalizeTime(operation.timestamp)
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
                    <TableCell data-testid="block-number">
                      <Link
                        className="text-link"
                        href={`/block/${operation.blockNumber}`}
                      >
                        {operation.blockNumber?.toLocaleString()}
                      </Link>
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
                        onClick={() =>
                          setExpandedRow(
                            isExpanded ? null : operation.operationId
                          )
                        }
                        className="text-link"
                      >
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                          size="lg"
                          data-testid="last-updated-icon"
                        />
                      </button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow>
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
      )}
    </>
  );
};

export default BalanceHistoryTable;
