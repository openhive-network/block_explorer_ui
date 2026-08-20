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
import { useI18n } from "@/i18n/i18n";

interface BlocksTableProps {
  rows: BlockRow[]; // Changed to BlockRow, since we added the counts
  paramsState?: any; // Or props if there is no url query available
  TABLE_CELLS: string[];
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  isMainPageTable?: boolean;
  allBlocksPageLink?: string;
}

const BlocksTable: React.FC<BlocksTableProps> = ({
  rows,
  paramsState,
  TABLE_CELLS,
  currentPage,
  totalCount,
  onPageChange,
  isMainPageTable = false,
  allBlocksPageLink,
}) => {
  const { t, dir } = useI18n();
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
              index === 0 ? "sticky left-0 z-10 bg-theme" : "",
              dir === "rtl" ? "text-right" : "text-left"
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
          <TableRowComponent
            row={row}
            blockNum={blockNum}
            paramsState={paramsState}
            TABLE_CELLS={TABLE_CELLS}
            expandedRows={expandedRows}
            expandedRowRef={expandedRowRef}
            toggleRow={toggleRow}
            isMainPageTable={isMainPageTable}
          />
        </Fragment>
      );
    });
  };

  const prepareExportData = () => {
    if (!rows) return [];

    return rows.map((block) => {
      return {
        [t("blocksTable.block")]: block.block_num,
        [t("blocksTable.producer")]: block.producer_account,
        [t("blocksTable.hash")]: formatHash(block.hash),
        [t("blocksTable.prevHash")]: formatHash(block.prev),
        [t("blocksTable.timestamp")]: formatAndDelocalizeTime(block.created_at),
        [t("blocksTable.producerRewardVests")]: formatNumber(
          block.producer_reward,
          true,
          false
        ),
        [t("blocksTable.transactions")]: block.trx_count,
        [t("blocksTable.operationCount")]: block.operationCount,
        [t("blocksTable.virtualOpsCount")]: block.virtualOperationCount,
      };
    });
  };

  return (
    <>
      {totalCount > config.standardPaginationSize ? (
        <div className="flex flex-wrap justify-between items-center bg-theme px-1 sticky z-20 top-[3.2rem] md:top-[4rem]">
          {isMainPageTable ? (
            <div className="flex justify-center w-full md:w-auto md:justify-start bg-theme">
              <Link href={allBlocksPageLink ?? "/blocks"} target="_blank">
                <Button
                  data-testid="go-to-result-page"
                  className="w-full md:w-auto"
                >
                  {t("common.goToResultPage")}
                </Button>
              </Link>
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row items-center flex-1 justify-center w-full">
            <CustomPagination
              currentPage={currentPage || 1}
              totalCount={totalCount}
              pageSize={config.standardPaginationSize}
              onPageChange={onPageChange}
              isMirrored={true}
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
      ) : isMainPageTable ? (
        <div className="flex justify-center w-full md:w-auto md:justify-start bg-theme px-2 ">
          <Link href={allBlocksPageLink ?? "/blocks"} target="_blank">
            <Button
              data-testid="go-to-result-page"
              className="w-full md:w-auto"
            >
              {t("common.goToResultPage")}
            </Button>
          </Link>
        </div>
      ) : null}

      <div
        className={cn("table-toolbar", {
          "justify-between": !!totalCount,
        })}
      >
        <DataCountMessage
          count={totalCount || 0}
          dataType={t("common.blocks")}
        />
        <DataExport
          data={prepareExportData()}
          filename={`${t("blocksTable.exportFilenamePrefix")}.csv`}
          className="mb-2"
        />
      </div>
      <div className="border-2 border-theme rounded bg-theme">
        <Table
          data-testid="table-body"
          className=" overflow-auto"
          enableMobileScrollArrows
          enableCompactToggle={true}
        >
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
  expandedRowRef: React.RefObject<HTMLTableRowElement | null>;
  toggleRow: (blockNum: number) => void;
  isMainPageTable: boolean;
}

const TableRowComponent: React.FC<TableRowComponentProps> = ({
  row,
  blockNum,
  paramsState,
  TABLE_CELLS,
  expandedRows,
  expandedRowRef,
  toggleRow,
  isMainPageTable = false,
}) => {
  const { locale: appLocale, t } = useI18n();
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

      return () => clearTimeout(timer);
    } else {
      // Handle the transition when row.isNew becomes false
      setIsNewRow(false);
      setBgColor("bg-theme");
    }
  }, [row.isNew]);

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
              {row.block_num.toLocaleString(appLocale)}
            </Link>
            <CopyButton
              text={String(row.block_num)}
              tooltipText={t("common.copyBlockNumber")}
            />
          </div>
        </TableCell>
        <TableCell className="whitespace-nowrap py-3 px-4">
          <Link className="text-link" href={`@${row.producer_account}`}>
            {row.producer_account}
          </Link>
        </TableCell>
        {!isMainPageTable ? (
          <>
            <TableCell className="whitespace-nowrap py-3 px-4">
              <div className="flex items-center space-x-2">
                <Link href={`/block/${row.block_num}`} className="text-link">
                  {formatHash(row.prev)}
                </Link>
                <CopyButton
                  text={String(row.prev)}
                  tooltipText={t("blocksTable.copyPrevBlockHash")}
                />
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap py-3 px-4">
              <div className="flex items-center space-x-2">
                <Link href={`/block/${row.block_num}`} className="text-link">
                  {formatHash(row.hash)}
                </Link>
                <CopyButton
                  text={String(row.hash)}
                  tooltipText={t("common.copyBlockHash")}
                />
              </div>
            </TableCell>
          </>
        ) : null}

        <TableCell className="whitespace-nowrap py-3 px-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <TimeAgo
                    locale={appLocale}
                    datetime={new Date(formatAndDelocalizeTime(row.created_at))}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-theme text-text p-3">
                {formatAndDelocalizeTime(row.created_at)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        {!isMainPageTable ? (
          <TableCell className="whitespace-nowrap py-3 px-4">
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
        ) : null}
        <TableCell className="whitespace-nowrap py-3 px-4">
          {row.trx_count}
        </TableCell>
        {!isMainPageTable ? (
          <>
            <TableCell className="whitespace-nowrap py-3 px-4">
              {row.operationCount}
            </TableCell>
            <TableCell className="whitespace-nowrap py-3 px-4">
              {row.virtualOperationCount}
            </TableCell>
          </>
        ) : null}
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
        <TableRow className="hover:bg-transparent" ref={expandedRowRef}>
          {/* Add the ref here */}
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
