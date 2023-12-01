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
import useWitnesses from "@/api/witnessesPage/useWitnesses";

export default function Witnesses() {
  const [voterAccount, setVoterAccount] = useState<string>("");
  const [isVotersOpen, setIsVotersOpen] = useState<boolean>(false);
  const [isVotesHistoryOpen, setIsVotesHistoryOpen] = useState<boolean>(false);

  const { witnessData, isWitnessDataLoading } = useWitnesses();

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
      <Table className="text-white">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 "></TableHead>
            <TableHead className="sticky left-6">Name</TableHead>
            <TableHead>Votes</TableHead>
            <TableHead>Voters</TableHead>
            <TableHead>Block Size</TableHead>
            <TableHead>Price Feed</TableHead>
            <TableHead>Feed Age</TableHead>
            <TableHead>Version</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {witnessData.map((singleWitness, index) => (
            <TableRow
              key={index}
              className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}`}
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
                  }` + " text-explorer-turquoise sticky left-6"
                }
              >
                {" "}
                <Link href={`/account/${singleWitness.witness}`}>
                  {singleWitness.witness}
                </Link>
              </TableCell>
              <TableCell
                onClick={() => {
                  setVoterAccount(singleWitness.witness);
                  setIsVotesHistoryOpen(true);
                }}
              >
                <span className="flex items-center cursor-pointer">
                  {singleWitness.vests?.toLocaleString()}
                  <MenuSquareIcon className="w-4 ml-1" />
                </span>
              </TableCell>
              <TableCell
                onClick={() => {
                  setVoterAccount(singleWitness.witness);
                  setIsVotersOpen(true);
                }}
              >
                <span className="flex items-center cursor-pointer">
                  {singleWitness.voters_num.toLocaleString()}
                  <MenuSquareIcon className="w-4 ml-1" />
                </span>
              </TableCell>
              <TableCell>
                {singleWitness.block_size
                  ? singleWitness.block_size.toLocaleString()
                  : "--"}
              </TableCell>
              <TableCell>
                {singleWitness.price_feed
                  ? singleWitness.price_feed.toLocaleString()
                  : "--"}
              </TableCell>
              <TableCell>
                {singleWitness.feed_age ? singleWitness.feed_age : "--"}
              </TableCell>
              <TableCell>{singleWitness.version}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
