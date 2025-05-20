import React, { Fragment, useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import CopyButton from "../ui/CopyButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/hybrid-tooltip";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { cn, formatNumber } from "@/lib/utils";
import DataExport from "../DataExport";
import { formatHash } from "@/utils/StringUtils";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import { Block, BlockRow } from "@/pages/blocks"; // Import Block
import JumpToPage from "../JumpToPage";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import { convertVestsToHP } from "@/utils/Calculations";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import DataCountMessage from "../DataCountMessage";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import BlockOperationsContent from "./BlockOperationContent";

interface BlocksTableProps {
  rows: BlockRow[]; // Changed to BlockRow, since we added the counts
  paramsState?: any;
  TABLE_CELLS: string[];
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

const BlocksTable: React.FC<BlocksTableProps> = ({
  rows,
  paramsState,
  TABLE_CELLS,
  currentPage,
  totalCount,
  onPageChange,
}) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const expandedRowRef = useRef<HTMLTableRowElement>(null); // Ref to expanded row

  const toggleRow = (blockNum: number) => {
    setExpandedRows((prevExpandedRows) => {
      const newExpandedRows = prevExpandedRows.includes(blockNum)
        ? prevExpandedRows.filter((rowId) => rowId !== blockNum)
        : [...prevExpandedRows, blockNum];

      // After updating the state, scroll into view
      setTimeout(() => {
        if (expandedRowRef.current) {
          expandedRowRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Keep the expanded row near the top/bottom
            inline: "start", // Align to the left
          });
        }
      }, 0); // Execute after the DOM update

      return newExpandedRows;
    });
  };

  const buildTableHeader = () => {
    return (
      <TableRow>
        {TABLE_CELLS.map((cell, index) => (
          <TableHead
            key={index}
            scope="col"
            className={cn(
              "text-left",
              index === 0 ? "sticky left-0 z-10 bg-theme" : ""
            )}
          >
            {cell}
          </TableHead>
        ))}
      </TableRow>
    );
  };

  const buildTableBody = () => {
    if (!rows) return null;

    return rows.map((row) => {
      const blockNum = row.block_num;

      return (
        <Fragment key={row.hash}>
          <TableRowComponent row={row} blockNum={blockNum} paramsState={paramsState} TABLE_CELLS={TABLE_CELLS} expandedRows={expandedRows} expandedRowRef={expandedRowRef} toggleRow={toggleRow}/>
        </Fragment>
      );
    });
  };

  const prepareExportData = () => {
    if (!rows) return [];

    return rows.map((block) => {
      return {
        Block: block.block_num,
        Producer: block.producer_account,
        hash: formatHash(block.hash),
        "prev hash": formatHash(block.prev),
        Timestamp: formatAndDelocalizeTime(block.created_at),
        "Producer reward (VESTS)": formatNumber(
          block.producer_reward,
          true,
          false
        ),
        Transactions: block.trx_count,
        "Operation Count": block.operationCount, // Include the counts
        "Virtual Ops Count": block.virtualOperationCount,
      };
    });
  };

  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
      setTotalVestingFundHive(
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive
      );
    }
  }, [dynamicGlobalData]);

  return (
    <>
      {totalCount > config.standardPaginationSize ? (
        <div className="sticky z-20 top-[3.2rem] md:top-[4rem] mt-6 bg-theme rounded">
          <div className="flex flex-col md:flex-row items-center gap-2 flex-1 justify-between w-full rounded ">
            <CustomPagination
              currentPage={currentPage || 1}
              totalCount={totalCount}
              pageSize={config.standardPaginationSize}
              onPageChange={onPageChange}
              isMirrored={true}
              className="rounded"
            />
            <div className="flex items-center mt-2 w-full md:w-auto justify-center md:justify-end mb-2">
              <JumpToPage
                currentPage={currentPage}
                onPageChange={onPageChange}
                totalCount={totalCount ?? 1}
                pageSize={config.standardPaginationSize}
              />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <div
        className={cn("flex items-center justify-end mt-8", {
          "justify-between": !!totalCount,
        })}
      >
        <DataCountMessage count={totalCount || 0} dataType="blocks" />
        <DataExport
          data={prepareExportData()}
          filename={`blocks.csv`}
          className="mb-2"
        />
      </div>
      <div className="border-2 border-theme rounded bg-theme">
        <Table data-testid="table-body" className=" overflow-auto">
          <TableHeader>{buildTableHeader()}</TableHeader>
          <TableBody>{buildTableBody()}</TableBody>
        </Table>
      </div>
    </>
  );
};

interface TableRowComponentProps {
  row: BlockRow;
  blockNum: number;
  paramsState?: any;
  TABLE_CELLS: string[];
  expandedRows: number[];
  expandedRowRef: React.RefObject<HTMLTableRowElement>;
  toggleRow: (blockNum: number) => void;
}

const TableRowComponent: React.FC<TableRowComponentProps> = ({row, blockNum, paramsState, TABLE_CELLS, expandedRows, expandedRowRef, toggleRow}) => {
  const [isNewRow, setIsNewRow] = useState(row.isNew);
  const [bgColor, setBgColor] = useState("bg-theme"); // Initial background color
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
      setTotalVestingFundHive(
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive
      );
    }
  }, [dynamicGlobalData]);

  useEffect(() => {
    if (row.isNew) {
      setIsNewRow(true); // Make sure we use the state variable
      setBgColor("bg-green-300 dark:bg-green-900"); // Apply new row background

      const timer = setTimeout(() => {
        setIsNewRow(false);
        setBgColor("bg-theme"); // Revert to the base background color
      }, 2200); // 2 seconds

      return () => clearTimeout(timer); // Cleanup on unmount or update
    } else if (isNewRow) { // Handle the transition when row.isNew becomes false
      setIsNewRow(false);
      setBgColor("bg-theme");
    }
  }, [row.isNew]); // Effect runs when row.isNew changes

  const textColorClass = isNewRow ? "text-green-800 dark:text-green-200" : "";
  const shadowClass = isNewRow ? "shadow-inner" : "";

  return (
    <>
      <TableRow
        className={`text-left ${bgColor} hover:bg-rowHover border-b-2 transition-colors duration-300 ease-in-out ${textColorClass} ${shadowClass}`}
      >
        <TableCell className="whitespace-nowrap sticky left-[0px] z-10 bg-inherit p-4">
          <div className="flex items-center space-x-2">
            <Link href={`/block/${row.block_num}`} className="text-link">
              {row.block_num.toLocaleString()}
            </Link>
            <CopyButton
              text={String(row.block_num)}
              tooltipText="Copy block number"
            />
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          <Link className="text-link" href={`@${row.producer_account}`}>
            {row.producer_account}
          </Link>
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          <div className="flex items-center space-x-2">
            <Link href={`/block/${row.block_num}`} className="text-link">
              {formatHash(row.prev)}
            </Link>
            <CopyButton
              text={String(row.prev)}
              tooltipText="Copy prev block hash"
            />
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          <div className="flex items-center space-x-2">
            <Link href={`/block/${row.block_num}`} className="text-link">
              {formatHash(row.hash)}
            </Link>
            <CopyButton
              text={String(row.hash)}
              tooltipText="Copy block hash"
            />
          </div>
        </TableCell>

        <TableCell className="whitespace-nowrap p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <TimeAgo
                    datetime={
                      new Date(formatAndDelocalizeTime(row.created_at))
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-theme text-text p-3">
                {formatAndDelocalizeTime(row.created_at)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          {row.producer_reward !== undefined ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer">
                    {formatNumber(row.producer_reward, true, false)}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-theme text-text">
                  {hiveChain &&
                    totalVestingFundHive &&
                    totalVestingShares &&
                    convertVestsToHP(
                      hiveChain,
                      String(row.producer_reward),
                      totalVestingFundHive,
                      totalVestingShares
                    )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          {row.trx_count}
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          {row.operationCount}
        </TableCell>
        <TableCell className="whitespace-nowrap p-3">
          {row.virtualOperationCount}
        </TableCell>
        <TableCell className="text-right pr-4">
          <Button
            data-testid="expand-details"
            className="p-0 h-fit bg-inherit"
            onClick={() => toggleRow(row.block_num)}
          >
            {expandedRows.includes(row.block_num) ? (
              <ChevronUp width={20} height={20} className="mt-1" />
            ) : (
              <ChevronDown width={20} height={20} className="mt-1" />
            )}
          </Button>
        </TableCell>
      </TableRow>

      {/* Conditional rendering of BlockOperationsContent */}
      {expandedRows.includes(row.block_num) && (
        <TableRow className="hover:bg-transparent" ref={expandedRowRef}> {/* Add the ref here */}
          <TableCell colSpan={TABLE_CELLS.length} className="p-2">
            <BlockOperationsContent
              blockNum={row.block_num}
              paramsState={paramsState}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default BlocksTable;