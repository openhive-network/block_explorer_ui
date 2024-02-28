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
import { formatNumber, formatPercent } from "@/lib/utils";
import Head from "next/head";

export default function Witnesses() {
  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);

  const { witnessData, isWitnessDataLoading } = useWitnesses(config.witnessesPerPages.witnesses);

  if (isWitnessDataLoading) {
    return <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />;
  }

  if (!witnessData || !witnessData.length) return;

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
      <div className="mt-16 md:m-8 max-w-[100vw]">
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
        <Table className="text-white" data-testid="table-body">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 "></TableHead>
              <TableHead className="sticky left-6">Name</TableHead>
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
            {witnessData.map((singleWitness, index) => (
              <TableRow
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}
                data-testid="witnesses-table-row"
              >
                <TableCell
                  className={
                    `${
                      index % 2 === 0
                        ? "bg-gray-800 md:bg-inherit"
                        : "bg-gray-900 md:bg-inherit"
                    }` + " sticky left-0"
                  }
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  className={
                    `${
                      index % 2 === 0
                        ? "bg-gray-800 md:bg-inherit"
                        : "bg-gray-900 md:bg-inherit"
                    }` + " text-explorer-turquoise sticky left-6 "
                  }
                >
                  {" "}
                  <Link href={`/@${singleWitness.witness}`} data-testid="witness-name">
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
                  {singleWitness.feed_age
                    ? singleWitness.feed_age.split(".")[0]
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
