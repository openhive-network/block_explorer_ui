import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
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
import CopyButton from "../ui/CopyButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/hybrid-tooltip";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { cn, convertBooleanArrayToIds, formatNumber } from "@/lib/utils";
import DataExport from "../DataExport";
import { formatHash } from "@/utils/StringUtils";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import { Block, BlockRow } from "@/pages/blocks";
import Explorer from "@/types/Explorer";
import JumpToPage from "../JumpToPage";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import Hive from "@/types/Hive";
import { convertVestsToHP } from "@/utils/Calculations";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import DataCountMessage from "../DataCountMessage";
import { Button } from "../ui/button";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import BlockOperationsContent from "./BlockOperationContent";
import BlockOpsCell from "./BlockOpsCell";
import { bucketLabelKey } from "./OpBucketBar";
import {
  NON_VIRTUAL_BUCKET_ORDER,
  OP_BUCKET_ORDER,
} from "@/utils/operationBuckets";
import { computeSlotDeltas, type SlotDelta } from "@/utils/slotGaps";
import { useI18n } from "@/i18n/i18n";

// Column indexes carrying a magnitude, per table mode. Full table:
// 0 block · 1 producer · 2 prev hash · 3 hash · 4 time · [5 Δt] · reward ·
// transactions · operations · virtual ops · expander. The Δt column is dropped
// on a sparse result set, which shifts everything after it left by one.
const fullNumericColumns = (hasSlotTiming: boolean) => {
  const first = hasSlotTiming ? 6 : 5;
  return new Set([first, first + 1, first + 2, first + 3]);
};
const MAIN_NUMERIC_COLUMNS = new Set([3]);

// Position of the Δt header in the full table, used to hang its explanation.
const SLOT_DELTA_COLUMN = 5;

// Names the witnesses that skipped the slot — never the producer of either
// adjacent block, which is why the attribution lives here and not on their row.
const MissedSlotRow: React.FC<{
  colSpan: number;
  missedSlots: number;
  producers: string[];
}> = ({ colSpan, missedSlots, producers }) => {
  const { t } = useI18n();
  return (
    <TableRow className="hover:bg-transparent" data-testid="missed-slot-row">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 bg-amber-500/10 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {producers.length
              ? t("blocksPage.slotHealth.missedBy", { count: missedSlots })
              : t("blocksPage.slotHealth.missedRow", { count: missedSlots })}
          </span>
          {producers.length ? (
            <span className="flex flex-wrap items-center gap-1">
              {producers.map((producer, index) => (
                <span key={`${producer}-${index}`}>
                  <Link href={`/@${producer}`} className="text-link">
                    {producer}
                  </Link>
                  {index < producers.length - 1 ? "," : null}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
};

interface BlocksTableProps {
  rows: BlockRow[]; // Changed to BlockRow, since we added the counts
  paramsState?: Explorer.AllBlocksSearchProps;
  TABLE_CELLS: string[];
  currentPage: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  isMainPageTable?: boolean;
  allBlocksPageLink?: string;
  // False when the rows are not a consecutive run, so slot timing is meaningless.
  showSlotTiming?: boolean;
  slotDeltas?: SlotDelta[];
  missedProducersByBlock?: Record<number, string[]>;
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
  showSlotTiming = true,
  slotDeltas: slotDeltasProp,
  missedProducersByBlock = {},
}) => {
  const { t, dir } = useI18n();
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [scrollTarget, setScrollTarget] = useState<number | null>(null);
  const expandedRowRef = useRef<HTMLTableRowElement>(null); // Ref to expanded row

  // Hoisted out of the rows: one subscription per table, not one per row.
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;
  const headBlockDetails = dynamicGlobalData?.headBlockDetails;

  const rewardToHp = useCallback(
    (rewardVests: number) => {
      const fund: Hive.Supply | undefined =
        headBlockDetails?.rawTotalVestingFundHive;
      const shares: Hive.Supply | undefined =
        headBlockDetails?.rawTotalVestingShares;
      if (!hiveChain || !fund || !shares) return undefined;
      return convertVestsToHP(hiveChain, String(rewardVests), fund, shares);
    },
    [hiveChain, headBlockDetails]
  );

  const ownDeltas = useMemo(
    () => (slotDeltasProp ? [] : computeSlotDeltas(rows ?? [])),
    [rows, slotDeltasProp]
  );
  const slotDeltas = slotDeltasProp ?? ownDeltas;

  // Only the row just opened carries the ref, or the last expanded row wins.
  const toggleRow = (blockNum: number) => {
    const isOpen = expandedRows.includes(blockNum);
    setExpandedRows(
      isOpen
        ? expandedRows.filter((rowId) => rowId !== blockNum)
        : [...expandedRows, blockNum]
    );
    setScrollTarget(isOpen ? null : blockNum);
  };

  useEffect(() => {
    if (scrollTarget === null) return;
    expandedRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
    setScrollTarget(null);
  }, [scrollTarget]);

  const numericColumns = isMainPageTable
    ? MAIN_NUMERIC_COLUMNS
    : fullNumericColumns(showSlotTiming);

  const showSlotColumns = !isMainPageTable && showSlotTiming;

  // With an operation-type filter on, the API returns only those types, so every
  // bar would be the same flat colour.
  const opTypeFiltered =
    (convertBooleanArrayToIds(paramsState?.filters ?? [])?.length ?? 0) > 0;

  const buildTableHeader = () => {
    return (
      <TableRow>
        {TABLE_CELLS.map((cell, index) => (
          <TableHead
            key={index}
            scope="col"
            className={cn(
              // start-0 rather than left-0: in RTL the frozen column belongs on the right.
              index === 0 ? "sticky start-0 z-10 bg-theme" : "",
              numericColumns.has(index) ? "text-end" : "text-start"
            )}
          >
            {showSlotColumns && index === SLOT_DELTA_COLUMN ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="cursor-help border-b border-dotted border-current"
                      data-testid="slot-delta-header"
                    >
                      {cell}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme text-text max-w-xs p-2 text-xs font-normal">
                    {t("blocksPage.slotDeltaTooltip")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              cell
            )}
          </TableHead>
        ))}
      </TableRow>
    );
  };

  const buildTableBody = () => {
    if (!rows) return null;
    return rows.map((row, index) => {
      const blockNum = row.block_num;
      const delta = slotDeltas[index];
      // Newest-first, so the slots missed before this block sit below its row.
      const showGap = showSlotColumns && delta?.missedSlots > 0;

      return (
        <Fragment key={row.hash}>
          <TableRowComponent
            row={row}
            blockNum={blockNum}
            paramsState={paramsState}
            TABLE_CELLS={TABLE_CELLS}
            expandedRows={expandedRows}
            expandedRowRef={
              row.block_num === scrollTarget ? expandedRowRef : undefined
            }
            toggleRow={toggleRow}
            isMainPageTable={isMainPageTable}
            delta={delta}
            showSlotTiming={showSlotTiming}
            showOpBar={!opTypeFiltered}
            rewardToHp={rewardToHp}
          />
          {showGap ? (
            <MissedSlotRow
              colSpan={TABLE_CELLS.length}
              missedSlots={delta.missedSlots}
              producers={missedProducersByBlock[row.block_num] ?? []}
            />
          ) : null}
        </Fragment>
      );
    });
  };

  const prepareExportData = () => {
    if (!rows) return [];

    return rows.map((block, index) => {
      const delta = slotDeltas[index];
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
        ...(showSlotColumns
          ? {
              [t("blocksPage.slotDelta")]:
                delta?.deltaSeconds === null || delta === undefined
                  ? ""
                  : delta.deltaSeconds,
              [t("blocksPage.slotHealth.missedRowHeader")]:
                delta?.missedSlots ?? 0,
            }
          : {}),
        ...Object.fromEntries(
          OP_BUCKET_ORDER.map((bucket) => [
            t(bucketLabelKey(bucket)),
            block.buckets?.[bucket] ?? 0,
          ])
        ),
      };
    });
  };

  return (
    <>
      {totalCount > config.standardPaginationSize ? (
        <div className="flex flex-wrap justify-between items-center bg-theme px-5 sticky z-20 top-[3.2rem] md:top-[4rem]">
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

          {/* Three columns on the full page so the pager sits at true centre and
              lines up with the block range bar above. Centring it together with
              Jump to page pushed it left by half that control's width. The home
              table keeps the original single centred group. */}
          <div
            className={cn(
              "flex w-full flex-1 flex-col items-center",
              isMainPageTable
                ? "justify-center md:flex-row"
                : "md:grid md:grid-cols-[1fr_auto_1fr]"
            )}
          >
            {!isMainPageTable ? <div className="hidden md:block" /> : null}
            <CustomPagination
              currentPage={currentPage || 1}
              totalCount={totalCount}
              pageSize={config.standardPaginationSize}
              onPageChange={onPageChange}
              isMirrored={true}
            />
            <div
              className={cn(
                "mb-2 mt-2 flex w-full items-center justify-center md:w-auto md:justify-end",
                !isMainPageTable && "md:justify-self-end"
              )}
            >
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
  paramsState?: Explorer.AllBlocksSearchProps;
  TABLE_CELLS: string[];
  expandedRows: number[];
  expandedRowRef?: React.RefObject<HTMLTableRowElement | null>;
  toggleRow: (blockNum: number) => void;
  isMainPageTable: boolean;
  delta?: SlotDelta;
  showSlotTiming?: boolean;
  showOpBar?: boolean;
  rewardToHp: (rewardVests: number) => string | undefined;
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
  delta,
  showSlotTiming = true,
  showOpBar = true,
  rewardToHp,
}) => {
  const { locale: appLocale, t } = useI18n();
  const [isNewRow, setIsNewRow] = useState(row.isNew);
  const [bgColor, setBgColor] = useState("bg-theme"); // Initial background color
  useEffect(() => {
    if (row.isNew) {
      setIsNewRow(true); // Make sure we use the state variable
      // A wash rather than a flood, and not green: green is the slot-health
      // status colour here, and a new block is not a claim about its health.
      // Opaque, not an alpha tint: the sticky first cell uses bg-inherit, so a
      // translucent row colour gets painted twice and that cell reads darker.
      setBgColor("bg-sky-100 dark:bg-sky-900");

      const timer = setTimeout(() => {
        setIsNewRow(false);
        setBgColor("bg-theme"); // Revert to the base background color
      }, 2200); // 2 seconds

      return () => clearTimeout(timer);
    } else {
      setIsNewRow(false);
      setBgColor("bg-theme");
    }
  }, [row.isNew]);

  // Always reserve the edge so the row does not shift when it lights up.
  const newRowAccent = isNewRow
    ? "border-s-4 border-s-sky-500 dark:border-s-sky-400"
    : "border-s-4 border-s-transparent";

  return (
    <>
      <TableRow
        className={`text-start ${bgColor} hover:bg-rowHover border-b-2 transition-colors duration-300 ease-in-out ${newRowAccent}`}
      >
        <TableCell className="whitespace-nowrap sticky start-0 z-10 bg-inherit p-4">
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
                {/* The previous hash identifies block N-1, not this block. */}
                <Link
                  href={`/block/${row.block_num - 1}`}
                  className="text-link"
                >
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
        {!isMainPageTable && showSlotTiming ? (
          <TableCell className="whitespace-nowrap py-3 px-4">
            {delta?.deltaSeconds === null || delta === undefined ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="cursor-help text-explorer-light-gray"
                      data-testid="slot-delta-unknown"
                    >
                      -
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme text-text p-2 text-xs">
                    {t(
                      `blocksPage.slotHealth.unknown.${delta?.reason ?? "no-predecessor"}`
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span
                // dir="ltr": RTL bidi otherwise reorders the sign to "3s+".
                dir="ltr"
                className={cn(
                  delta.missedSlots > 0 &&
                    "font-medium text-amber-600 dark:text-amber-400"
                )}
                data-testid="slot-delta"
              >
                {`+${delta.deltaSeconds}s`}
              </span>
            )}
          </TableCell>
        ) : null}
        {!isMainPageTable ? (
          <TableCell className="whitespace-nowrap py-3 px-4 text-end tabular-nums">
            {row.producer_reward !== undefined ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      {formatNumber(row.producer_reward, true, false)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-theme text-text">
                    {rewardToHp(row.producer_reward)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              "-"
            )}
          </TableCell>
        ) : null}
        <TableCell className="whitespace-nowrap py-3 px-4 text-end tabular-nums">
          {row.trx_count}
        </TableCell>
        {!isMainPageTable ? (
          <>
            <TableCell className="whitespace-nowrap py-3 px-4 text-end tabular-nums">
              <BlockOpsCell
                buckets={row.buckets}
                order={NON_VIRTUAL_BUCKET_ORDER}
                total={row.operationCount}
                showBar={showOpBar}
              />
            </TableCell>
            <TableCell className="whitespace-nowrap py-3 px-4 text-end tabular-nums">
              {row.virtualOperationCount}
            </TableCell>
          </>
        ) : null}
        <TableCell className="text-end pe-4">
          <Button
            data-testid="expand-details"
            className="p-0 h-fit bg-inherit"
            aria-expanded={expandedRows.includes(row.block_num)}
            aria-label={t("blocksTable.toggleBlockDetails", {
              block: row.block_num,
            })}
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

      {expandedRows.includes(row.block_num) && (
        <TableRow className="hover:bg-transparent" ref={expandedRowRef}>
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
