import { useState } from "react";
import Link from "next/link";
import { Loader2, MenuSquareIcon } from "lucide-react";
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

export default function Witnesses() {
  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);

  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.witnesses
  );

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
          className="text-white"
          data-testid="table-body"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0"></TableHead>
              <TableHead className="sticky left-11">Name</TableHead>
              <TableHead className="text-center">Votes</TableHead>
              <TableHead className="text-center">Voters</TableHead>
              <TableHead className="text-center">Block Size</TableHead>
              <TableHead className="text-center">Missed Blocks</TableHead>
              <TableHead className="text-right">APR</TableHead>
              <TableHead className="text-center">Price Feed</TableHead>
              <TableHead>Feed Age</TableHead>
              <TableHead>Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {witnessesData.map((singleWitness, index) => (
              <TableRow
                key={index}
                className={cn(`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`,{"line-through": singleWitness.signing_key === config.inactiveWitnessKey})}
                data-testid="witnesses-table-row"
              >
                <TableCell
                  className={cn("sticky left-0 min-w-[20px]", {
                    "bg-gray-800 md:bg-inherit": index % 2 === 0,
                    "bg-gray-900 md:bg-inherit": index % 2 !== 0
                  })}
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  className={cn("text-explorer-turquoise sticky left-11", {
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
