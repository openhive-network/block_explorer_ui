import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import Hive from "@/types/Hive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import moment from "moment";
import { config } from "@/Config";

type VotersDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  votesHistory: Hive.WitnessVotesHistory[] | undefined;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
};

const tableColums = [
  { key: "timestamp", name: "Date"},
  { key: "voter", name: "Voter" },
  { key: "vests", name: "Votes" },
  { key: "account_vests", name: "Account" },
  { key: "proxied_vests", name: "Proxy" }
];

const VotesHistoryDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotesHistoryOpen,
  votesHistory,
  changeVoteHistoryDialogue
}) => {
  const [showHivePower, setShowHivePower] = useState<boolean>(false);

  return (
    <Dialog
      open={isVotesHistoryOpen}
      onOpenChange={changeVoteHistoryDialogue}
    >
      <DialogContent className={`h-3/4 max-w-2xl overflow-auto bg-white ${!votesHistory && "flex justify-center items-center"}`}>
        {
          votesHistory ? (
            <>
              <div className="flex  justify-center  items-centertext-center font-semibold	">
                {accountName}{" "}
              </div>
              <div className="flex">
                <label>Vests</label>
                <Switch
                  className="mx-2"
                  checked={showHivePower}
                  onCheckedChange={setShowHivePower}
                />
                <label>Hive Power</label>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColums.map((column, index) => (
                      <TableHead
                        key={column.key}
                        className={cn({
                          "sticky left-0 bg-white": !index,
                        })}
                      >
                        <span className="flex text-black">
                          {column.name}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votesHistory &&
                    votesHistory?.map((vote, index) => (
                      
                      <TableRow
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-gray-200"
                        }`}
                      >
                        <TableCell className={`sticky left-0 bg-explorer-bg-start ${
                          index % 2 === 0 ? "bg-gray-50 md:bg-inherit" : "bg-gray-200 md:bg-inherit"
                        }`} >
                          {moment(vote.timestamp).format(config.baseMomentTimeFormat)}
                        </TableCell>
                        <TableCell
                          className={`text-blue-600 ${
                            index % 2 === 0 ? "bg-gray-50 md:bg-inherit" : "bg-gray-200 md:bg-inherit"
                          }`}
                        >
                          <Link href={`/account/${vote.voter}`}>{vote.voter}</Link>
                        </TableCell>
                        <TableCell className={`${vote.approve ? "text-green-700" : "text-red-700"}`}>
                          {showHivePower
                            ? vote.vests_hive_power
                            : vote.vests.toLocaleString()}{" "}
                        </TableCell>
                        <TableCell className={`${vote.approve ? "text-green-700" : "text-red-700"}`}>
                          {showHivePower
                            ? vote.account_hive_power
                            : vote.account_vests.toLocaleString()}{" "}
                        </TableCell>
                        <TableCell className={`${vote.approve ? "text-green-700" : "text-red-700"}`}>
                          {showHivePower
                            ? vote.proxied_hive_power
                            : vote.proxied_vests.toLocaleString()}{" "}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            
            </>
          ) : (
            <Loader2  className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
          )
        }
      </DialogContent>
    </Dialog>
  );
};

export default VotesHistoryDialog;
