import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MenuSquareIcon,
  MoveVertical,
  MoveUp,
  MoveDown,
} from "lucide-react";
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
import useWitnesses from "@/api/common/useWitnesses";
import { config } from "@/Config";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import Head from "next/head";
import moment from "moment";

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
  "feed age": "feed_age",
  version: "version",
};

const renderSortArrow = (
  cell: string,
  orderBy: string,
  isOrderAscending: boolean
) => {
  // Remove this code block when sorting by `missed_blocks` and `hbd_interest_rate` will be available
  const hideSort = cell === "missed blocks" || cell === "apr";
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

// Remove this code block when sorting by `missed_blocks` and `hbd_interest_rate` will be available
const isCellUnsortable = (cell: string) => {
  return cell === "APR" || cell === "Missed Blocks";
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

  if (!witnessesData || !witnessesData.length) return;

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
      <div className="md:m-8 max-w-[100vw]">
        <VotersDialog
          accountName={voterAccount}
          isVotersOpen={isVotersOpen}
          changeVotersDialogue={changeVotersDialogue}
        />
        <VotesHistoryDialog
          accountName={voterAccount}
          isVotesHistoryOpen={isVotesHistoryOpen}
          changeVoteHistoryDialogue={changeVotesHistoryDialog}
        />
        <Table
          className="text-white min-w-[80vw]"
          data-testid="table-body"
        >
          <TableHeader>
            <TableRow>{buildTableHeader()}</TableRow>
          </TableHeader>
          <TableBody>
            {witnessesData.map((singleWitness: any, index: any) => (
              <TableRow
                key={index}
                className={cn(
                  `${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`,
                  {
                    "line-through":
                      singleWitness.signing_key === config.inactiveWitnessKey,
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
                  <Link
                    href={`/@${singleWitness.witness}`}
                    data-testid="witness-name"
                  >
                    {singleWitness.witness}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center">
                    {formatNumber(singleWitness.vests || 0, true).split(".")[0]}
                    <MenuSquareIcon
                      className="w-4 ml-1 cursor-pointer"
                      onClick={() => {
                        setVoterAccount(singleWitness.witness);
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
                        setVoterAccount(singleWitness.witness);
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
                <TableCell>
                  {singleWitness.feed_updated_at
                    ? moment(singleWitness.feed_updated_at).fromNow()
                    : "--"}
                </TableCell>
                <TableCell>{singleWitness.version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
