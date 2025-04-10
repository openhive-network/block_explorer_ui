import React, { useState, useEffect } from "react";
import {
  Loader2,
  MenuSquareIcon,
  MoveVertical,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import {
  formatAndDelocalizeFromTime,
  formatAndDelocalizeTime,
} from "@/utils/TimeUtils";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import VotesHistoryDialog from "@/components/Witnesses/VotesHistoryDialog";
import WitnessScheduleIcon from "@/components/WitnessScheduleIcon";
import LastUpdatedTooltip from "@/components/LastUpdatedTooltip";
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

const TABLE_CELLS = [
  "Rank",
  "Name",
  "Votes",
  "Voters",
  "Missed Blocks",
  "Last Block",
  "Block Size",
  "APR",
  "Price Feed",
  "Feed Age",
  "AC Fee",
  "Version",
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

const RIGHT_ALIGNED_HEADERS = [
  "Missed Blocks",
  "Price Feed",
  "Feed Age",
  "APR",
  "Version",
  "Block Size",
  "AC Fee",
];

const renderSortArrow = (
  cell: string,
  orderBy: string,
  isOrderAscending: boolean
) => {
  const hideSort =
    cell === "missed blocks" ||
    cell === "ac fee" ||
    cell === "version" ||
    cell === "last block" ||
    cell === "apr";
  if (hideSort) return;

  if (sortKeyByCell[cell] !== orderBy) {
    return <MoveVertical size={13} className="ml-1" />;
  } else {
    return isOrderAscending ? (
      <MoveDown size={13} className="ml-1" />
    ) : (
      <MoveUp size={13} className="ml-1" />
    );
  }
};

const isCellUnsortable = (cell: string) => {
  return (
    cell === "Missed Blocks" ||
    cell === "AC Fee" ||
    cell === "Version" ||
    cell === "Last Block" ||
    cell === "APR"
  );
};

export default function Witnesses() {
  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);
  const [sort, setSort] = useState<any>({
    orderBy: "rank",
    isOrderAscending: true,
  });
  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.witnesses,
    sort.orderBy,
    sort.isOrderAscending ? "asc" : "desc"
  );

  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

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

  const handleSortBy = (tableCell: string) => {
    setSort({
      orderBy: sortKeyByCell[tableCell],
      isOrderAscending: !sort.isOrderAscending,
    });
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
    return TABLE_CELLS.map((cell) => {
      const toLowerCase = cell.toLocaleLowerCase();
      const isRightAligned = RIGHT_ALIGNED_HEADERS.includes(cell); // Check if header should be right-aligned
      const headerIndex = TABLE_CELLS.indexOf(cell);

      const className =
        "first:sticky first:left-0 [&:nth-child(2)]:sticky [&:nth-child(2)]:left-12 text-center";

      const buttonClassName = `w-full flex items-center ${
        isRightAligned ? "justify-end text-right" : "justify-start text-left"
      }`;

      return (
        <TableHead key={cell} className={className}>
          <button
            disabled={isCellUnsortable(cell)}
            className={buttonClassName}
            onClick={() => handleSortBy(toLowerCase)}
          >
            <span>{cell}</span>
            {renderSortArrow(toLowerCase, sort.orderBy, sort.isOrderAscending)}
          </button>
        </TableHead>
      );
    });
  };

  return (
    <>
      <Head>
        <title>Witnesses - Hive Explorer</title>
      </Head>
      <div className="page-container bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans antialiased">
        <div className="mx-4 my-4">
          <main className="flex-1">
            <PageTitle title="Hive Witnesses" className="py-4"/>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
              <WitnessScheduleIcon />
              <LastUpdatedTooltip
                lastUpdatedAt={witnessesData?.votes_updated_at}
              />
            </div>

            {isWitnessDataLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="dark:text-white animate-spin h-6 w-6" />
              </div>
            ) : witnessesData?.witnesses?.length > 0 ? (
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

                <Table className="min-w-full">
                  <TableHeader>{buildTableHeader()}</TableHeader>
                  <TableBody>
                    {witnessesData?.witnesses.map(
                      (singleWitness: any, index: any) => (
                        <TableRow
                          key={index}
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
                          <TableCell className="sticky left-0 bg-inherit z-10">
                            {singleWitness.rank}
                          </TableCell>
                          <TableCell className="sticky left-12 bg-inherit flex items-center space-x-2 py-4 whitespace-nowrap min-w-min z-10">
                            <Image
                              className="rounded-full border-2 border-explorer-orange"
                              src={getHiveAvatarUrl(singleWitness.witness_name)}
                              alt="avatar"
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
                                        convertVestsToHP(
                                          hiveChain,
                                          singleWitness.vests,
                                          totalVestingFundHive,
                                          totalVestingShares
                                        )
                                      ) : (
                                        <Loader2 className="dark:text-white animate-spin mt-1 h-2 w-2" />
                                      )}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-left">
                                    <p>
                                      Vests:{" "}
                                      {
                                        formatNumber(
                                          singleWitness.vests || 0,
                                          true
                                        ).split(".")[0]
                                      }
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
                                          convertVestsToHP(
                                            hiveChain,
                                            singleWitness.votes_daily_change,
                                            totalVestingFundHive,
                                            totalVestingShares
                                          )
                                        ) : (
                                          <Loader2 className="dark:text-white animate-spin mt-1 h-2 w-2" />
                                        )}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-left">
                                      Vests Change:{" "}
                                      {
                                        formatNumber(
                                          singleWitness.votes_daily_change || 0,
                                          true
                                        ).split(".")[0]
                                      }
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
                                  text={singleWitness.last_confirmed_block_num}
                                  tooltipText="Copy block number"
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
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.price_feed
                              ? singleWitness.price_feed.toLocaleString()
                              : "--"}
                          </TableCell>
                          <TableCell className="text-right">
                            {singleWitness.feed_updated_at ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-pointer">
                                      {formatAndDelocalizeFromTime(
                                        singleWitness.feed_updated_at
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
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </>
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
