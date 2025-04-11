import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import AdditionalDetails from "../ui/AdditionalDetails";
import CopyButton from "../ui/CopyButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { formatNumber } from "@/lib/utils";
import DataExport from "../DataExport";
import { formatHash } from "@/utils/StringUtils";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import { BlockRow } from "@/pages/blocks";
import JumpToPage from "../JumpToPage";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";
import { convertVestsToHP } from "@/utils/Calculations";

interface BlocksTableProps {
  rows: BlockRow[];
  openBlockNum?: number | null;
  handleToggle: (blockNum: number) => void;
  TABLE_CELLS: string[];
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

const BlocksTable: React.FC<BlocksTableProps> = ({
  rows,
  openBlockNum,
  handleToggle,
  TABLE_CELLS,
  currentPage,
  totalCount,
  onPageChange,
}) => {
  const buildTableHeader = () => {
    return (
      <TableRow>
        {TABLE_CELLS.map((cell, index) => (
          <TableHead
            key={index}
            scope="col"
            className={`text-left ${
              index < 2 ? "sticky left-0 z-10 bg-theme" : ""
            } ${index === 0 ? "min-w-2" : ""}`}
          >
            {cell}
          </TableHead>
        ))}
      </TableRow>
    );
  };

  const buildTableBody = () => {
    if (!rows) return null;
    return rows.map((row) => (
      <Fragment key={row.hash}>
        <TableRow className="text-left bg-theme hover:bg-rowHover ">
        <TableCell className="w-[12px] sticky left-0 z-10 bg-inherit">
            <AdditionalDetails
            >
              {row.additionalDetailsContent}
            </AdditionalDetails>
          </TableCell>
          <TableCell className="whitespace-nowrap sticky left-[32px] z-10 bg-inherit">
            <div className="flex items-center space-x-2">
              <Link
                href={`/block/${row.block_num}`}
                className="text-link"
              >
                {row.block_num.toLocaleString()}
              </Link>
              <CopyButton
                text={String(row.block_num)}
                tooltipText="Copy block number"
              />
            </div>
          </TableCell>
          <TableCell className="whitespace-nowrap ">
            <div className="flex items-center space-x-2">
              <Link
                href={`/block/${row.block_num}`}
                className="text-link"
              >
                {formatHash(row.hash)}
              </Link>
              <CopyButton
                text={String(row.hash)}
                tooltipText="Copy block hash"
              />
            </div>
          </TableCell>
          <TableCell className="whitespace-nowrap">{row.trx_count}</TableCell>

          <TableCell className="whitespace-nowrap">
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
                <TooltipContent className="bg-theme text-text">
                  {formatAndDelocalizeTime(row.timestamp)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <Link
              className="text-link"
              href={`@${row.producer_account}`}
            >
              {row.producer_account}
            </Link>
          </TableCell>
          <TableCell className="whitespace-nowrap">
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
        </TableRow>
      </Fragment>
    ));
  };

  const prepareExportData = () => {
    if (!rows) return [];

    return rows.map((block) => {
      return {
        Block: block.block_num,
        Transactions: block.trx_count,
        Timestamp: block.timestamp,
        Producer: block.producer_account,
        "Producer reward (VESTS)":
          formatNumber(block.producer_reward, true, false) ,
        hash: formatHash(block.hash),
        "prev hash": formatHash(block.prev),
      };
    });
  };

  const [totalVestingShares, setTotalVestingShares] =
    useState<Hive.Supply | null>(null);
  const [totalVestingFundHive, setTotalVestingFundHive] =
    useState<Hive.Supply | null>(null);
  const { hiveChain } = useHiveChainContext();

  useEffect(() => {
    const fetchDynamicGlobalProperties = async () => {
      const dynamicGlobalProperties =
        await fetchingService.getDynamicGlobalProperties();
      const _totalVestingfundHive =
        dynamicGlobalProperties.total_vesting_fund_hive;
      const _totalVestingShares = dynamicGlobalProperties.total_vesting_shares;

      setTotalVestingFundHive(_totalVestingfundHive);
      setTotalVestingShares(_totalVestingShares);
    };

    fetchDynamicGlobalProperties();
  }, []);

  return (
    <>
    {totalCount > config.standardPaginationSize ? (
    <div className="sticky z-20 top-[3.2rem] md:top-[4rem] mt-6 bg-theme">
      <div className="flex flex-col md:flex-row items-center gap-2 flex-1 justify-between w-full">
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
  ) : ""}
      <div className="flex justify-end">
        <DataExport
          data={prepareExportData()}
          filename={`blocks.csv`}
          className="mt-4"
        />
      </div>
      <Table
        data-testid="table-body"
        className="rounded-[6px] overflow-auto mt-3"
      >
        <TableHeader>{buildTableHeader()}</TableHeader>

        <TableBody>{buildTableBody()}</TableBody>
      </Table>
    </>
  );
};

export default BlocksTable;
