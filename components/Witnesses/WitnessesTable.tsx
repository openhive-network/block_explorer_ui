import React from "react";
import Link from "next/link";
import {
  Loader2,
  MenuSquareIcon,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Link as LinkIcon,
} from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn, formatNumber, formatPercent, formatHp } from "@/lib/utils";
import {
  formatAndDelocalizeFromTime,
  formatAndDelocalizeTime,
} from "@/utils/TimeUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatLocalePercent } from "@/utils/chartUtils";
import { RecentMissedBlocksState } from "@/hooks/api/common/useRecentMissedBlocks";
import CopyButton from "@/components/ui/CopyButton";
import { convertVestsToHP } from "@/utils/Calculations";
import { relocalizeAmount } from "@/utils/localeAmount";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import { IHiveChainInterface } from "@hiveio/wax";
import WitnessVoteButton from "./WitnessVoteButton";
import SetProxyButton from "./SetProxyButton";
import CompareSelectToggle from "@/components/compare/CompareSelectToggle";
import { CompareSelection } from "@/hooks/common/useCompareSelection";
import HiveAvatar from "@/components/ui/HiveAvatar";
import useMediaQuery from "@/hooks/common/useMediaQuery";

interface ColumnLabel {
  labelKey: string;
  sortKey?: string;
}

// Each column shows a main value and a smaller second line under it, so the
// table fits without scrolling sideways; both lines keep their own sort.
interface ColumnConfig {
  key: string;
  main: ColumnLabel;
  second?: ColumnLabel[];
  isRightAligned?: boolean;
}

const COLUMNS: ColumnConfig[] = [
  { key: "rank", main: { labelKey: "common.rank", sortKey: "rank" } },
  {
    key: "witness",
    main: { labelKey: "common.name", sortKey: "name" },
    second: [
      { labelKey: "witnesses.version" },
      { labelKey: "witnesses.acfee" },
    ],
  },
  {
    key: "votes",
    main: { labelKey: "witnesses.votes", sortKey: "votes" },
    isRightAligned: true,
  },
  {
    key: "voters",
    main: { labelKey: "witnesses.voters", sortKey: "voters" },
    isRightAligned: true,
  },
  {
    key: "missed",
    main: { labelKey: "witnesses.missedblocks" },
    second: [
      { labelKey: "witnesses.window24h", sortKey: "missed 24h" },
      { labelKey: "witnesses.window7d", sortKey: "missed 7d" },
    ],
    isRightAligned: true,
  },
  {
    key: "lastBlock",
    main: { labelKey: "witnesses.lastblock" },
    second: [{ labelKey: "witnesses.blocksize", sortKey: "block size" }],
    isRightAligned: true,
  },
  {
    key: "priceFeed",
    main: { labelKey: "witnesses.pricefeed", sortKey: "price feed" },
    isRightAligned: true,
  },
  {
    key: "feedAge",
    main: { labelKey: "witnesses.feedage", sortKey: "feed age" },
    isRightAligned: true,
  },
  { key: "apr", main: { labelKey: "witnesses.apr" }, isRightAligned: true },
];

export const SORT_KEY_BY_CELL: { [objectKey: string]: string } = {
  rank: "rank",
  name: "witness",
  votes: "votes",
  voters: "voters_num",
  "block size": "block_size",
  "missed blocks": "missed_blocks",
  "missed 24h": "missed_24h",
  "missed 7d": "missed_7d",
  apr: "hbd_interest_rate",
  "price feed": "price_feed",
  "feed age": "feed_updated_at",
  version: "version",
  "last block produced": "last_confirmed_block_num",
};

// Sorted in the browser: the witness list API knows nothing about them.
export const MISSED_SORT_FIELDS = ["missed_24h", "missed_7d"];

// Rank and Name stay pinned while the rest scrolls; on phones only Name does.
const RANK_COLUMN_WIDTH = 64;

const RECENT_MISSED_SORT_KEYS = ["missed 24h", "missed 7d"];

const renderSortArrow = (
  currentSortKey: string,
  orderByApiField: string,
  isOrderAscending: boolean
) => {
  if (SORT_KEY_BY_CELL[currentSortKey] !== orderByApiField) {
    return <ChevronsUpDown size={13} className="ms-0.5 shrink-0" />;
  }
  return isOrderAscending ? (
    <ChevronUp size={13} className="ms-0.5 shrink-0" />
  ) : (
    <ChevronDown size={13} className="ms-0.5 shrink-0" />
  );
};

const RecentMissedValue: React.FC<{
  label: string;
  row?: Hive.WitnessMissedBlocksResponse;
  isUnknown: boolean;
}> = ({ label, row, isUnknown }) => {
  const { t, locale } = useI18n();
  const missed = row?.missed_count ?? 0;
  const badge = (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded px-1.5 py-0.5 leading-none",
        !isUnknown && missed > 0
          ? "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300"
          : "bg-gray-500/10 text-gray-600 dark:text-gray-300"
      )}
    >
      <span className="text-[10px] opacity-75">{label}</span>
      <span className="text-xs font-semibold tabular-nums">
        {isUnknown ? "--" : missed.toLocaleString(locale)}
      </span>
    </span>
  );
  if (isUnknown || !row || !missed) return badge;
  const scheduled = row.missed_count + row.produced_count;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help">
          {badge}
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="bg-theme text-text text-xs">
          {t("witnesses.missedRateTooltip", {
            rate: formatLocalePercent(row.rate * 100, locale, 2),
            missed: missed.toLocaleString(locale),
            scheduled: scheduled.toLocaleString(locale),
          })}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};

interface WitnessesTableProps {
  witnesses: any[];
  sort: { orderBy: string; isOrderAscending: boolean };
  onSortBy: (sortKey: string) => void;
  showVoteColumn: boolean;
  latestVersion: string | null;
  hiveChain: IHiveChainInterface | null | undefined;
  totalVestingFundHive: Hive.Supply | undefined;
  totalVestingShares: Hive.Supply | undefined;
  onOpenVoters: (witnessName: string) => void;
  onOpenVotesHistory: (witnessName: string) => void;
  onVoteChange: (witnessName: string, voted: boolean) => void;
  compareSelection?: CompareSelection;
  recentMissed?: RecentMissedBlocksState;
}

const WitnessesTable: React.FC<WitnessesTableProps> = ({
  witnesses,
  sort,
  onSortBy,
  showVoteColumn,
  latestVersion,
  hiveChain,
  totalVestingFundHive,
  totalVestingShares,
  onOpenVoters,
  onOpenVotesHistory,
  onVoteChange,
  compareSelection,
  recentMissed,
}) => {
  const { t, locale } = useI18n();
  const showRecentMissed = !!recentMissed?.isAvailable;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const rankSticky = isMobile ? undefined : true;
  const nameSticky = isMobile ? true : RANK_COLUMN_WIDTH;
  const canConvert = !!(
    hiveChain &&
    totalVestingFundHive &&
    totalVestingShares
  );

  const toHp = (vests: string | number) =>
    canConvert ? (
      relocalizeAmount(
        formatHp(
          convertVestsToHP(
            hiveChain!,
            vests as string,
            totalVestingFundHive!,
            totalVestingShares!
          )
        ),
        locale
      )
    ) : (
      <Loader2 className="dark:text-white animate-spin mt-1 h-2 w-2" />
    );

  const renderLabel = (label: ColumnLabel, isMain: boolean) => {
    const text = t(label.labelKey);
    if (!label.sortKey)
      return (
        <span
          key={label.labelKey}
          className={isMain ? undefined : "font-normal"}
        >
          {text}
        </span>
      );
    return (
      <button
        key={label.labelKey}
        type="button"
        className={cn(
          "inline-flex items-center hover:underline",
          !isMain && "font-normal"
        )}
        onClick={() => onSortBy(label.sortKey!)}
      >
        {text}
        {renderSortArrow(label.sortKey, sort.orderBy, sort.isOrderAscending)}
      </button>
    );
  };

  const buildHeader = () =>
    COLUMNS.map((column, index) => {
      const second = (column.second ?? []).filter(
        (label) =>
          showRecentMissed ||
          !RECENT_MISSED_SORT_KEYS.includes(label.sortKey ?? "")
      );
      return (
        <TableCell
          stickyLeft={
            index === 0 ? rankSticky : index === 1 ? nameSticky : undefined
          }
          key={column.key}
          className={cn(
            "!bg-navbar py-2 whitespace-nowrap",
            index === 0 && "w-16 min-w-16 max-w-16",
            index === 1 && isMobile && "px-2"
          )}
        >
          <div
            className={cn(
              "flex flex-col",
              column.isRightAligned ? "items-end text-end" : "items-start"
            )}
          >
            {renderLabel(column.main, true)}
            {second.length > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] opacity-80">
                {second.map((label) => renderLabel(label, false))}
              </span>
            )}
          </div>
        </TableCell>
      );
    });

  const subLine = "text-[11px] text-gray-500 dark:text-gray-400";
  const changeClass = (value: number) =>
    cn(
      "text-[0.7rem]",
      value >= 0
        ? "text-green-500 dark:text-green-400"
        : "text-red-500 dark:text-red-400"
    );

  return (
    <TooltipProvider>
      <Table
        className="min-w-full"
        enableMobileScrollArrows
        isStandaloneTable
        enableCompactToggle
      >
        <TableHeader>
          <TableRow rowVariant="header">
            {buildHeader()}
            {showVoteColumn && (
              <TableCell className="text-center !bg-navbar py-2">
                <span>{t("witnesses.actions")}</span>
              </TableCell>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {witnesses.map((singleWitness: any, index: number) => {
            const recent = recentMissed?.getRecentMissed(
              singleWitness.witness_name
            );
            return (
              <TableRow
                key={singleWitness.witness_id || index}
                data-witness-row={singleWitness.witness_name}
                className={cn(
                  `${
                    index % 2 === 0
                      ? "bg-rowEven hover:bg-rowHover"
                      : "bg-rowOdd  hover:bg-rowHover"
                  }`,
                  "transition-colors duration-150 rounded-md",
                  {
                    "opacity-50 dark:opacity-45 line-through":
                      singleWitness.signing_key === config.inactiveWitnessKey,
                    "font-bold": singleWitness.rank && singleWitness.rank <= 20,
                  }
                )}
              >
                <TableCell
                  stickyLeft={rankSticky}
                  className="w-16 min-w-16 max-w-16"
                >
                  {singleWitness.rank?.toLocaleString(locale)}
                </TableCell>

                <TableCell
                  stickyLeft={nameSticky}
                  className={cn("py-2 whitespace-nowrap", isMobile && "px-2")}
                >
                  <div
                    className={cn(
                      "flex items-center",
                      isMobile ? "gap-1.5" : "gap-2"
                    )}
                  >
                    <HiveAvatar
                      accountName={singleWitness.witness_name}
                      size={isMobile ? 24 : 30}
                      alt={t("common.avatarAltText", {
                        name: singleWitness.witness_name,
                      })}
                      className="rounded-full border-2 border-explorer-orange shrink-0"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Link
                          href={`/@${singleWitness.witness_name}`}
                          className="text-link hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                          target="_blank"
                        >
                          {singleWitness.witness_name}
                        </Link>
                        {singleWitness.url && (
                          <Link
                            href={singleWitness.url}
                            target="_blank"
                            className={cn(
                              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
                              isMobile ? "ms-1" : "ms-2"
                            )}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Link>
                        )}
                        {compareSelection && (
                          <span className={isMobile ? "ms-1" : "ms-2"}>
                            <CompareSelectToggle
                              account={singleWitness.witness_name}
                              selected={compareSelection.isSelected(
                                singleWitness.witness_name
                              )}
                              onToggle={compareSelection.toggle}
                              t={t}
                            />
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(subLine, "flex items-center font-normal")}
                      >
                        <span
                          className={cn(
                            "inline-block h-2 w-2 rounded-full me-1",
                            {
                              "bg-green-500":
                                singleWitness.version === latestVersion,
                              "bg-yellow-500":
                                singleWitness.version !== latestVersion,
                            }
                          )}
                        />
                        {singleWitness.version}
                        {!!singleWitness.account_creation_fee && (
                          <>
                            <span className="mx-1.5 opacity-50">·</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button type="button" className="cursor-help">
                                  <span className="me-1 text-[10px] opacity-60">
                                    {t("witnesses.acfee")}
                                  </span>
                                  {(
                                    singleWitness.account_creation_fee / 1000
                                  ).toLocaleString(locale)}
                                </button>
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipContent className="bg-theme text-text text-xs">
                                  {t("witnesses.acFeeTooltip", {
                                    fee: (
                                      singleWitness.account_creation_fee / 1000
                                    ).toLocaleString(locale),
                                  })}
                                </TooltipContent>
                              </TooltipPortal>
                            </Tooltip>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-end relative">
                  <div className="flex flex-col items-end justify-center pe-5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer">
                          {toHp(singleWitness.vests)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-left">
                        <p>
                          {t("common.vests")}:{" "}
                          {relocalizeAmount(
                            formatNumber(singleWitness.vests || 0, true),
                            locale
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {singleWitness.votes_daily_change !== "0" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              changeClass(singleWitness.votes_daily_change),
                              "cursor-pointer"
                            )}
                          >
                            {singleWitness.votes_daily_change > 0 ? "+" : ""}
                            {toHp(singleWitness.votes_daily_change)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="text-left">
                          {t("common.vestsChange")}:{" "}
                          {relocalizeAmount(
                            formatNumber(
                              singleWitness.votes_daily_change || 0,
                              true
                            ),
                            locale
                          )}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <MenuSquareIcon
                      className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-200 absolute top-1/2 end-0 transform -translate-y-1/2"
                      onClick={() =>
                        onOpenVotesHistory(singleWitness.witness_name)
                      }
                      data-testid="witness-votes-button"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-end relative">
                  <div className="flex flex-col items-end justify-center pe-5">
                    <span>
                      {singleWitness.voters_num.toLocaleString(locale)}
                    </span>
                    {singleWitness.voters_num_daily_change !== 0 && (
                      <span
                        className={changeClass(
                          singleWitness.voters_num_daily_change
                        )}
                      >
                        {singleWitness.voters_num_daily_change > 0 ? "+" : ""}
                        {singleWitness.voters_num_daily_change.toLocaleString(
                          locale
                        )}
                      </span>
                    )}
                    <MenuSquareIcon
                      className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-200 absolute top-1/2 end-0 transform -translate-y-1/2"
                      onClick={() => onOpenVoters(singleWitness.witness_name)}
                      data-testid="witness-voters-button"
                    />
                  </div>
                </TableCell>

                <TableCell className="text-end whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <span>
                      {singleWitness.missed_blocks
                        ? singleWitness.missed_blocks.toLocaleString(locale)
                        : "--"}
                    </span>
                    {showRecentMissed && recentMissed && (
                      <span className="mt-1 flex items-center gap-1.5 font-normal">
                        <RecentMissedValue
                          label={t("witnesses.window24h")}
                          row={recent?.day}
                          isUnknown={recentMissed.isDayUnknown}
                        />
                        <RecentMissedValue
                          label={t("witnesses.window7d")}
                          row={recent?.week}
                          isUnknown={recentMissed.isWeekUnknown}
                        />
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-end whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    {singleWitness.last_confirmed_block_num ? (
                      <div className="flex items-center justify-end">
                        <Link
                          className="text-link"
                          href={`/block/${singleWitness.last_confirmed_block_num}${
                            singleWitness.trxId
                              ? `?trxId=${singleWitness.trxId}`
                              : ""
                          }`}
                        >
                          {singleWitness.last_confirmed_block_num.toLocaleString(
                            locale
                          )}
                        </Link>
                        <CopyButton
                          text={String(singleWitness.last_confirmed_block_num)}
                          tooltipText={t("common.copyBlockNumber")}
                        />
                      </div>
                    ) : (
                      "--"
                    )}
                    <span className={cn(subLine, "font-normal")}>
                      {singleWitness.block_size
                        ? singleWitness.block_size.toLocaleString(locale)
                        : "--"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-end whitespace-nowrap">
                  {singleWitness.price_feed
                    ? singleWitness.price_feed.toLocaleString(locale)
                    : "0"}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  {singleWitness.feed_updated_at ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer">
                          {formatAndDelocalizeFromTime(
                            singleWitness.feed_updated_at,
                            locale
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="text-left">
                        {formatAndDelocalizeTime(singleWitness.feed_updated_at)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    "--"
                  )}
                </TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  {singleWitness.hbd_interest_rate
                    ? formatPercent(singleWitness.hbd_interest_rate, locale)
                    : "0%"}
                </TableCell>

                {showVoteColumn && (
                  <TableCell className="text-center w-[80px] whitespace-nowrap">
                    <div className="inline-flex items-center justify-center gap-1">
                      <WitnessVoteButton
                        witnessName={singleWitness.witness_name}
                        onVoteChange={onVoteChange}
                      />
                      <SetProxyButton
                        witnessName={singleWitness.witness_name}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default WitnessesTable;
