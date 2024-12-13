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
import { formatNumber } from "@/lib/utils";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";

interface OperationsTableProps {
  operations: Explorer.BalanceHistoryForTable[];
  total_operations: number;
  total_pages: number;
  current_page: number;
}
const BalanceHistoryTable: React.FC<OperationsTableProps> = ({
  operations,
  total_operations,
  total_pages,
  current_page,
}) => {
  const router = useRouter();
  const operationsTypes = useOperationsTypes().operationsTypes || [];
  
  const formatRawCoin = (coinValue: number) =>
    formatNumber(coinValue, false, false);

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
    

  return (
    <>
      <CustomPagination
        currentPage={current_page? current_page: 1}
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
        <Table className={cn("rounded-[6px] overflow-hidden max-w-[100%] text-xs mt-3")}>
          <TableHeader>
            <TableRow>
              <TableHead>Operation Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Block Number</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Balance Change</TableHead>
              <TableHead>New Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((operation) => {
              const operationBgColor = getOperationColor(operation.opTypeId);
              const coinName = router.query.coinType?router.query.coinType: 'HIVE'; //defaults to HIVE

              return (
                <TableRow key={operation.operationId}>
                  <TableCell data-testid="operation-type">
                    <div className="flex justify-stretch p-1 rounded">
                      <span className={`rounded w-4 mr-2 ${operationBgColor}`}></span>
                      <span>{getOperationTypeForDisplayById(operation.opTypeId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <TimeAgo
                              datetime={new Date(
                                formatAndDelocalizeTime(operation.timestamp)
                              )}
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
                    <Link className="text-link" href={`/block/${operation.blockNumber}`}>
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default BalanceHistoryTable;