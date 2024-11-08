import { useState } from "react";
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

import { config } from "@/Config";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { formatAndDelocalizeFromTime } from "@/utils/TimeUtils";
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

const TABLE_CELLS = [
  "Rank",
  "Name",
  "Votes",
  "Voters",
  "Block Size",
  "Missed Blocks",
  "APR",
  "Price Feed",
  "Feed Age",
  "Version",
  "Last Block Produced",
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
  cell: string,
  orderBy: string,
  isOrderAscending: boolean
) => {
  // Remove this code block when sorting by `missed_blocks` and `hbd_interest_rate` and `last_confirmed_block_num` will be available
  const hideSort =
    cell === "missed blocks" ||
    cell === "apr" ||
    cell === "version" ||
    cell === "last block produced";
  if (hideSort) return;
  //

  if (sortKeyByCell[cell] !== orderBy) {
    return (
      <MoveVertical
        size={13}
        className="min-w-[13px]  ml-1"
      />
    );
  } else {
    return isOrderAscending ? (
      <MoveDown
        size={13}
        className="min-w-[13px] ml-1"
      />
    ) : (
      <MoveUp
        size={13}
        className="min-w-[13px] ml-1"
      />
    );
  }
};

// Remove this code block when sorting by `missed_blocks` and `hbd_interest_rate`  and `last_confirmed_block_num` will be available
const isCellUnsortable = (cell: string) => {
  return (
    cell === "APR" ||
    cell === "Missed Blocks" ||
    cell === "Version" ||
    cell === "Last Block Produced"
  );
};
//

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
      const className =
        "first:sticky first:left-0 [&:nth-child(2)]:sticky [&:nth-child(2)]:left-16 text-center";

      return (
        <TableHead
          key={cell}
          className={className}
        >
          <button
            disabled={isCellUnsortable(cell)}
            className="flex items-center"
            onClick={() => handleSortBy(toLowerCase)}
          >
            {cell}
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
      <div className="md:m-8 max-w-[100vw] px-4">
        <div className="flex justify-between my-5">
          <div className="text-start">
            <p>
              Check{" "}
              <Link
                className="text-explorer-blue"
                href="/schedule"
                data-testid="witness-shedule-link"
              >
                Witnesses Schedule
              </Link>
            </p>
          </div>
          <p>
            Last updated :{" "}
            {formatAndDelocalizeFromTime(witnessesData.votes_updated_at)}
          </p>
        </div>

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
          className="text-white min-w-[80vw]"
          data-testid="table-body"
        >
          <TableHeader>
            <TableRow>{buildTableHeader()}</TableRow>
          </TableHeader>
          <TableBody>
            {witnessesData.witnesses.map((singleWitness: any, index: any) => (
              <TableRow
                key={index}
                className={cn(
                  `${
                    index % 2 === 0
                      ? "bg-rowEven dark:bg-rowEven"
                      : "bg-rowOdd dark:bg-rowOdd"
                  }`,
                  {
                    "line-through":
                      singleWitness.signing_key === config.inactiveWitnessKey,
                    "font-black":
                      singleWitness.rank && singleWitness.rank <= 20,
                  }
                )}
                data-testid="witnesses-table-row"
              >
                <TableCell
                  className={cn("sticky left-0 min-w-[20px]", {
                    "bg-gray-800 md:bg-inherit": index % 2 === 0,
                    "bg-gray-900 md:bg-inherit": index % 2 !== 0,
                  })}
                >
                  {singleWitness.rank}
                </TableCell>
                <TableCell
                  className={cn("text-explorer-turquoise sticky left-16", {
                    "bg-gray-800 md:bg-inherit": index % 2 === 0,
                    "bg-gray-900 md:bg-inherit": index % 2 !== 0,
                  })}
                >
                  <div className="flex justify-between">
                    <Link
                      href={`/@${singleWitness.witness_name}`}
                      target="_blank"
                      data-testid="witness-name"
                    >
                      {singleWitness.witness_name}
                    </Link>
                    <Link
                      href={singleWitness.url ?? ""}
                      target="_blank"
                      data-testid="witness-link"
                    >
                      <LinkIcon size={15} />
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center">
                    {formatNumber(singleWitness.vests || 0, true).split(".")[0]}
                    <MenuSquareIcon
                      className="w-4 ml-1 cursor-pointer"
                      onClick={() => {
                        setVoterAccount(singleWitness.witness_name);
                        setIsVotesHistoryOpen(true);
                      }}
                      data-testid="witness-votes-button"
                    />
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center">
                    {singleWitness.voters_num.toLocaleString()}
                    <MenuSquareIcon
                      className="w-4 ml-1 cursor-pointer"
                      onClick={() => {
                        setVoterAccount(singleWitness.witness_name);
                        setIsVotersOpen(true);
                      }}
                      data-testid="witness-voters-button"
                    />
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {singleWitness.block_size
                    ? singleWitness.block_size.toLocaleString()
                    : "--"}
                </TableCell>
                <TableCell className="text-right">
                  {singleWitness.block_size
                    ? singleWitness.missed_blocks.toLocaleString()
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
                  {singleWitness.feed_updated_at
                    ? formatAndDelocalizeFromTime(singleWitness.feed_updated_at)
                    : "--"}
                </TableCell>
                <TableCell>{singleWitness.version}</TableCell>
                <TableCell className="text-right">
                  {singleWitness.last_confirmed_block_num ? (
                    <Link
                      className="text-link"
                      href={`/block/${singleWitness.last_confirmed_block_num}${
                        singleWitness.trxId
                          ? `?trxId=${singleWitness.trxId}`
                          : ""
                      }`}
                    >
                      {singleWitness.last_confirmed_block_num.toLocaleString()}
                    </Link>
                  ) : (
                    "--"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
