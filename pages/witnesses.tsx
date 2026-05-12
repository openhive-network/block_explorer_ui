import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/i18n/i18n";
import {
  Loader2,
  MenuSquareIcon,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Link as LinkIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { cn, formatNumber, formatPercent, formatHp } from "@/lib/utils";
import {
  formatAndDelocalizeFromTime,
  formatAndDelocalizeTime,
} from "@/utils/TimeUtils";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useWitnessVoteChain from "@/hooks/api/common/useWitnessVoteChain";
import { useAuth } from "@/contexts/AuthContext";
import WitnessVoteButton from "@/components/Witnesses/WitnessVoteButton";
import SetProxyButton from "@/components/Witnesses/SetProxyButton";
import VoterFilterBanner from "@/components/Witnesses/VoterFilterBanner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dynamic from "next/dynamic";
const VotersDialog = dynamic(
  () => import("@/components/Witnesses/VotersDialog"),
  { ssr: false }
);
const VotesHistoryDialog = dynamic(
  () => import("@/components/Witnesses/VotesHistoryDialog"),
  { ssr: false }
);
import WitnessScheduleIcon from "@/components/WitnessScheduleIcon";
import CopyButton from "@/components/ui/CopyButton";
import ScrollTopButton from "@/components/ScrollTopButton";
import { config } from "@/Config";
import NoResult from "@/components/NoResult";
import fetchingService from "@/services/FetchingService";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHP } from "@/utils/Calculations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Hive from "@/types/Hive";
import { IHiveChainInterface } from "@hiveio/wax";
import PageTitle from "@/components/PageTitle";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";

interface TableCellConfig {
  displayKey: string;
  sortKey: string;
  isRightAligned?: boolean;
  isUnsortable?: boolean;
}

const TABLE_CELL_CONFIGS: TableCellConfig[] = [
  { displayKey: "common.rank", sortKey: "rank" },
  { displayKey: "common.name", sortKey: "name" },
  { displayKey: "witnesses.votes", sortKey: "votes" },
  { displayKey: "witnesses.voters", sortKey: "voters" },
  {
    displayKey: "witnesses.missedblocks",
    sortKey: "missed blocks",
    isRightAligned: true,
    isUnsortable: true,
  },
  {
    displayKey: "witnesses.lastblock",
    sortKey: "last block produced",
    isUnsortable: true,
  },
  {
    displayKey: "witnesses.blocksize",
    sortKey: "block size",
    isRightAligned: true,
  },
  {
    displayKey: "witnesses.apr",
    sortKey: "apr",
    isRightAligned: true,
    isUnsortable: true,
  },
  {
    displayKey: "witnesses.pricefeed",
    sortKey: "price feed",
    isRightAligned: true,
  },
  {
    displayKey: "witnesses.feedage",
    sortKey: "feed age",
    isRightAligned: true,
  },
  {
    displayKey: "witnesses.acfee",
    sortKey: "ac fee",
    isRightAligned: true,
    isUnsortable: true,
  },
  {
    displayKey: "witnesses.version",
    sortKey: "version",
    isRightAligned: true,
    isUnsortable: true,
  },
];

const sortKeyByCell: { [objectKey: string]: string } = {
  rank: "rank",
  name: "witness",
  votes: "votes",
  voters: "voters_num",
  "block size": "block_size",
  "missed blocks": "missed_blocks",
  apr: "hbd_interest_rate",
  "price feed": "price_feed",
  "feed age": "feed_updated_at",
  version: "version",
  "last block produced": "last_confirmed_block_num",
};

const renderSortArrow = (
  currentSortKey: string,
  orderByApiField: string,
  isOrderAscending: boolean
) => {
  if (sortKeyByCell[currentSortKey] !== orderByApiField) {
    return <ChevronsUpDown size={15} className="ml-1" />;
  } else {
    return isOrderAscending ? (
      <ChevronDown size={15} className="ml-1" />
    ) : (
      <ChevronUp size={15} className="ml-1" />
    );
  }
};

export default function Witnesses() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const voterFilter = router.isReady
    ? (router.query.voter as string | undefined)
    : undefined;

  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<{
    orderBy: string;
    isOrderAscending: boolean;
  }>({
    orderBy: sortKeyByCell["rank"],
    isOrderAscending: true,
  });

  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.witnesses,
    voterFilter ? sortKeyByCell["rank"] : sort.orderBy,
    voterFilter ? "asc" : sort.isOrderAscending ? "asc" : "desc"
  );

  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

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

  const {
    witnessVotes: voterWitnessVotes,
    proxyChain,
    isLoading: isFilterLoading,
  } = useWitnessVoteChain(voterFilter || "");

  const { username, isLoggedIn } = useAuth();

  // Logged-in user's own proxy chain (for proxy banner on this page)
  const { proxyChain: userProxyChain } = useWitnessVoteChain(
    isLoggedIn ? username || "" : ""
  );

  // Vote column only for the logged-in user's own filter view (security: hide from others)
  const showVoteColumn = isLoggedIn && (!voterFilter || voterFilter === username);

  // Tracks local vote changes for immediate filter re-render (bypasses blockchain latency)
  const [localVoteChanges, setLocalVoteChanges] = useState<
    Record<string, boolean>
  >({});

  const handleVoteChange = (witnessName: string, voted: boolean) => {
    setLocalVoteChanges((prev) => ({ ...prev, [witnessName]: voted }));
  };

  const filteredWitnesses = useMemo(() => {
    if (!witnessesData?.witnesses) return [];
    if (!voterFilter) return witnessesData.witnesses;
    const voteSet = new Set(voterWitnessVotes);
    if (voterFilter === username) {
      Object.entries(localVoteChanges).forEach(([w, voted]) => {
        if (voted) voteSet.add(w);
        else voteSet.delete(w);
      });
    }
    if (voteSet.size === 0) return [];
    return witnessesData.witnesses.filter((w: any) =>
      voteSet.has(w.witness_name)
    );
  }, [witnessesData, voterFilter, voterWitnessVotes, username, localVoteChanges]);

  const sortedFilteredWitnesses = useMemo(() => {
    if (!voterFilter || filteredWitnesses.length === 0)
      return filteredWitnesses;
    const apiFieldToObjField: Record<string, string> = {
      rank: "rank",
      witness: "witness_name",
      votes: "vests",
      voters_num: "voters_num",
      block_size: "block_size",
      missed_blocks: "missed_blocks",
      hbd_interest_rate: "hbd_interest_rate",
      price_feed: "price_feed",
      feed_updated_at: "feed_updated_at",
      version: "version",
      last_confirmed_block_num: "last_confirmed_block_num",
    };
    const field = apiFieldToObjField[sort.orderBy] ?? "rank";
    const dir = sort.isOrderAscending ? 1 : -1;
    return [...filteredWitnesses].sort((a: any, b: any) => {
      const av = a[field],
        bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return dir;
      if (bv == null) return -dir;
      if (typeof av === "number" && typeof bv === "number")
        return (av - bv) * dir;
      if (av instanceof Date && bv instanceof Date)
        return (av.getTime() - bv.getTime()) * dir;
      return (
        String(av).localeCompare(String(bv), undefined, { numeric: true }) *
        dir
      );
    });
  }, [filteredWitnesses, voterFilter, sort]);

  useEffect(() => {
    if (witnessesData?.witnesses) {
      const versions = new Set<string>();
      witnessesData.witnesses.forEach((witness: any) => {
        versions.add(witness.version);
      });
      const sortedVersions = Array.from(versions).sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true })
      );
      setAvailableVersions(sortedVersions);
      setLatestVersion(sortedVersions[0] || null);
    }
  }, [witnessesData]);

  const handleSortBy = (clickedSortKey: string) => {
    if (!clickedSortKey || !sortKeyByCell[clickedSortKey]) {
      return;
    }
    const apiFieldForSort = sortKeyByCell[clickedSortKey];
    setSort((prevSort) => ({
      orderBy: apiFieldForSort,
      isOrderAscending:
        apiFieldForSort === prevSort.orderBy
          ? !prevSort.isOrderAscending
          : true,
    }));
  };

  if (isWitnessDataLoading) {
    return (
      <Loader2 className="dark:text-white animate-spin mt-1 h-8 w-8 ml-3 ..." />
    );
  }

  if (!witnessesData || !witnessesData.witnesses.length) return;

  const changeVotersDialogue = (isOpen: boolean) => {
    setIsVotersOpen(isOpen);
  };

  const changeVotesHistoryDialog = (isOpen: boolean) => {
    setIsVotesHistoryOpen(isOpen);
  };

  const buildTableHeader = () => {
    return TABLE_CELL_CONFIGS.map((cellConfig, index) => {
      const isRightAligned = !!cellConfig.isRightAligned;
      const isUnsortable = !!cellConfig.isUnsortable;
      const className = "text-center !bg-navbar py-2";
      const buttonClassName = `w-full flex items-center ${
        isRightAligned ? "justify-end text-right" : "justify-start text-left"
      } ${cellConfig.displayKey === "witnesses.version" ? "pr-2" : ""}`;

      return (
        <TableCell
          stickyLeft={index === 0 ? true : undefined}
          key={cellConfig.sortKey}
          className={className}
        >
          <button
            disabled={isUnsortable}
            className={buttonClassName}
            onClick={() => {
              if (!isUnsortable) {
                handleSortBy(cellConfig.sortKey);
              }
            }}
          >
            <span>{t(cellConfig.displayKey)}</span>
            {!isUnsortable &&
              renderSortArrow(
                cellConfig.sortKey,
                sort.orderBy,
                sort.isOrderAscending
              )}
          </button>
        </TableCell>
      );
    });
  };

  return (
    <>
      <Head>
        <title>{t("witnesses.title")} - Hive Explorer</title>
      </Head>
      <div className="page-container rounded bg-white dark:bg-theme text-gray-800 dark:text-gray-200 font-sans antialiased">
        <div className="mx-4 my-4">
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start bg-theme">
              <PageTitle titleKey="pageTitle.hiveWitnesses" className="py-4" />

              <div className="flex justify-start md:justify-end mt-2 md:mt-0 ml-1 md:ml-4 mr-4 flex-shrink-0">
                <WitnessScheduleIcon />
              </div>
            </div>

            <VoterFilterBanner
              voter={voterFilter || username || ""}
              isOwnView={!voterFilter || voterFilter === username}
              proxyChain={voterFilter ? proxyChain : userProxyChain}
              voteCount={voterWitnessVotes.length}
              isCountLoading={isFilterLoading}
              onClearFilter={
                voterFilter
                  ? () =>
                      router.push("/witnesses", undefined, { shallow: true })
                  : undefined
              }
            />

            {isWitnessDataLoading ||
            !router.isReady ||
            (voterFilter && isFilterLoading) ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="dark:text-white animate-spin h-6 w-6" />
              </div>
            ) : sortedFilteredWitnesses.length > 0 ? (
              <>
                <VotersDialog
                  accountName={voterAccount}
                  isVotersOpen={isVotersOpen}
                  changeVotersDialogue={changeVotersDialogue}
                  liveDataEnabled={false}
                />
                <VotesHistoryDialog
                  accountName={voterAccount}
                  isVotesHistoryOpen={isVotesHistoryOpen}
                  changeVoteHistoryDialogue={changeVotesHistoryDialog}
                  liveDataEnabled={false}
                />

                <Table
                  className="min-w-full"
                  enableMobileScrollArrows
                  isStandaloneTable
                  enableCompactToggle
                >
                  <TableHeader>
                    <TableRow rowVariant="header">
                      {buildTableHeader()}
                      {showVoteColumn && (
                        <TableCell className="text-center !bg-navbar py-2">
                          <span>{t("witnesses.actions")}</span>
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFilteredWitnesses.map(
                      (singleWitness: any, index: number) => (
                        <TableRow
                          key={singleWitness.witness_id || index}
                          className={cn(
                            `${
                              index % 2 === 0
                                ? "bg-rowEven hover:bg-rowHover"
                                : "bg-rowOdd  hover:bg-rowHover"
                            }`,
                            "transition-colors duration-150 rounded-md",
                            {
                              "opacity-50 dark:opacity-45 line-through":
                                singleWitness.signing_key ===
                                config.inactiveWitnessKey,
                              "font-bold":
                                singleWitness.rank && singleWitness.rank <= 20,
                            }
                          )}
                        >
                          <TableCell stickyLeft>{singleWitness.rank}</TableCell>
                          <TableCell
                            stickyLeft
                            className="flex items-center space-x-2 py-4 whitespace-nowrap"
                          >
                            <Image
                              className="rounded-full border-2 border-explorer-orange"
                              src={getHiveAvatarUrl(singleWitness.witness_name)}
                              alt={t("common.avatarAltText", {
                                name: singleWitness.witness_name,
                              })}
                              width={30}
                              height={30}
                            />
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
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-2"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </Link>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-right relative">
                            <div className="flex flex-col items-end justify-center pr-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-pointer">
                                      {hiveChain &&
                                      totalVestingFundHive &&
                                      totalVestingShares ? (
                                        formatHp(
                                          convertVestsToHP(
                                            hiveChain,
                                            singleWitness.vests,
                                            totalVestingFundHive,
                                            totalVestingShares
                                          )
                                        )
                                      ) : (
                                        <Loader2 className="dark:text-white animate-spin mt-1 h-2 w-2" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-left">
                                    <p>
                                      {t("common.vests")}:{" "}
                                      {formatNumber(
                                        singleWitness.vests || 0,
                                        true
                                      )}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {singleWitness.votes_daily_change !== "0" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span
                                        className={cn(
                                          "text-[0.7rem]",
                                          singleWitness.votes_daily_change >= 0
                                            ? "text-green-500 dark:text-green-400"
                                            : "text-red-500 dark:text-red-400",
                                          "cursor-pointer"
                                        )}
                                      >
                                        {singleWitness.votes_daily_change > 0
                                          ? "+"
                                          : ""}
                                        {hiveChain &&
                                        totalVestingFundHive &&
                                        totalVestingShares ? (
                                          formatHp(
                                            convertVestsToHP(
                                              hiveChain,
                                              singleWitness.votes_daily_change,
                                              totalVestingFundHive,
                                              totalVestingShares
                                            )
                                          )
                                        ) : (
                                          <Loader2 className="dark:text-white animate-spin mt-1 h-2 w-2" />
                                        )}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-left">
                                      {t("common.vestsChange")}:{" "}
                                      {formatNumber(
                                        singleWitness.votes_daily_change || 0,
                                        true
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <MenuSquareIcon
                                className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-200 absolute top-1/2 right-0 transform -translate-y-1/2"
                                onClick={() => {
                                  setVoterAccount(singleWitness.witness_name);
                                  setIsVotesHistoryOpen(true);
                                }}
                                data-testid="witness-votes-button"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right relative">
                            <div className="flex flex-col items-end justify-center pr-2">
                              <div className="flex flex-col items-end">
                                <span>
                                  {singleWitness.voters_num.toLocaleString()}
                                </span>
                                {singleWitness.voters_num_daily_change !==
                                  0 && (
                                  <span
                                    className={cn(
                                      "text-[0.7rem]",
                                      singleWitness.voters_num_daily_change > 0
                                        ? "text-green-500 dark:text-green-400"
                                        : "text-red-500 dark:text-red-400"
                                    )}
                                  >
                                    {singleWitness.voters_num_daily_change > 0
                                      ? "+"
                                      : ""}
                                    {singleWitness.voters_num_daily_change.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 justi">
                                <MenuSquareIcon
                                  className="w-4 h-4 cursor-pointer opacity-50 hover:opacity-80 transition-opacity duration-200 absolute top-1/2 right-0 transform -translate-y-1/2"
                                  onClick={() => {
                                    setVoterAccount(singleWitness.witness_name);
                                    setIsVotersOpen(true);
                                  }}
                                  data-testid="witness-voters-button"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.missed_blocks
                              ? singleWitness.missed_blocks.toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {singleWitness.last_confirmed_block_num ? (
                              <div className="flex items-center justify-end">
                                <Link
                                  className="text-link"
                                  href={`/block/${
                                    singleWitness.last_confirmed_block_num
                                  }${
                                    singleWitness.trxId
                                      ? `?trxId=${singleWitness.trxId}`
                                      : ""
                                  }`}
                                >
                                  {singleWitness.last_confirmed_block_num.toLocaleString()}
                                </Link>
                                <CopyButton
                                  text={String(
                                    singleWitness.last_confirmed_block_num
                                  )}
                                  tooltipText={t("common.copyBlockNumber")}
                                />
                              </div>
                            ) : (
                              "--"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.block_size
                              ? singleWitness.block_size.toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.hbd_interest_rate
                              ? formatPercent(singleWitness.hbd_interest_rate)
                              : "0%"}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.price_feed
                              ? singleWitness.price_feed.toLocaleString()
                              : "0"}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.feed_updated_at ? (
                              <TooltipProvider>
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
                                    {formatAndDelocalizeTime(
                                      singleWitness.feed_updated_at
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              "--"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.account_creation_fee
                              ? (
                                  singleWitness.account_creation_fee / 1000
                                ).toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <span
                                className={cn(
                                  "inline-block h-2 w-2 rounded-full mr-1",
                                  {
                                    "bg-green-500":
                                      singleWitness.version === latestVersion,
                                    "bg-yellow-500":
                                      singleWitness.version !== latestVersion,
                                  }
                                )}
                              />
                              {singleWitness.version}
                            </div>
                          </TableCell>

                          {showVoteColumn && (
                            <TableCell className="text-center w-[80px] whitespace-nowrap">
                              <div className="inline-flex items-center justify-center gap-1">
                                <WitnessVoteButton
                                  witnessName={singleWitness.witness_name}
                                  onVoteChange={handleVoteChange}
                                />
                                <SetProxyButton
                                  witnessName={singleWitness.witness_name}
                                />
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </>
            ) : voterFilter ? (
              <div className="flex flex-col items-center gap-4">
                <NoResult
                  titleKey="witnesses.noVotesForVoter"
                  descriptionKey="witnesses.noVotesForVoterDesc"
                />
                <Link
                  href="/witnesses"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-explorer-blue text-white text-sm font-medium shadow-sm hover:bg-explorer-blue/90 hover:shadow-md transition-all"
                >
                  {t("witnesses.browseAll")}
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:translate-x-0.5",
                      locale === "ar" && "rotate-180 group-hover:-translate-x-0.5"
                    )}
                  />
                </Link>
              </div>
            ) : (
              <NoResult />
            )}
          </main>
        </div>
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
}
