import React, {
  Fragment,
  SetStateAction,
  useEffect,
  useState,
  Dispatch,
} from "react";
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
} from "../ui/hybrid-tooltip";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { cn, formatNumber } from "@/lib/utils";
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
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import DataCountMessage from "../DataCountMessage";

interface BlocksTableProps {
  rows: BlockRow[];
  openBlockNum?: number | null;
  handleToggle: (blockNum: number) => void;
  TABLE_CELLS: string[];
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  setIsBlockNavigationActive: Dispatch<SetStateAction<boolean>>;
}

const BlocksTable: React.FC<BlocksTableProps> = ({
  rows,
  openBlockNum,
  handleToggle,
  TABLE_CELLS,
  currentPage,
  totalCount,
  onPageChange,
  setIsBlockNavigationActive,
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
              handleToggle={handleToggle}
              blockNum={row.block_num}
              setIsBlockNavigationActive={setIsBlockNavigationActive}
            >
              {row.additionalDetailsContent}
            </AdditionalDetails>
          </TableCell>
          <TableCell className="whitespace-nowrap sticky left-[32px] z-10 bg-inherit">
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
          <TableCell className="whitespace-nowrap ">
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
            <Link className="text-link" href={`@${row.producer_account}`}>
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
        "Producer reward (VESTS)": formatNumber(
          block.producer_reward,
          true,
          false
        ),
        hash: formatHash(block.hash),
        "prev hash": formatHash(block.prev),
      };
    });
  };

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
        <Table data-testid="table-body" className=" overflow-auto p-3">
          <TableHeader>{buildTableHeader()}</TableHeader>

          <TableBody>{buildTableBody()}</TableBody>
        </Table>
      </div>
    </>
  );
};

export default BlocksTable;
