import { useEffect, useState } from "react";
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import moment from "moment";

import Hive from "@/types/Hive";
import { cn, formatNumber } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import useWitnessVotesHistory from "@/hooks/api/common/useWitnessVotesHistory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "../ui/switch";
import JumpToPage from "../JumpToPage";
import CustomPagination from "../CustomPagination";
import DateTimePicker from "../DateTimePicker";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";

type VotersDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
};

const tableColums = [
  { key: "timestamp", name: "Date" },
  { key: "voter", name: "Voter" },
  { key: "vote", name: "Vote" },
  { key: "power", name: "Current voter power", isRightAligned: true },
];

const PAGE_SIZE = 100;

const VotesHistoryDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotesHistoryOpen,
  changeVoteHistoryDialogue,
  liveDataEnabled,
}) => {
  const [page, setPage] = useState(1);
  const [displayData, setDisplayData] =
    useState<Hive.WitnessesVotesHistoryResponse>();
  const [fromDate, setFromDate] = useState<Date>(
    moment().subtract(7, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date>(moment().toDate());

  const { witnessDetails } = useWitnessDetails(accountName, true) as any;
  const { votesHistory, isVotesHistoryLoading } = useWitnessVotesHistory(
    accountName,
    isVotesHistoryOpen,
    fromDate,
    toDate,
    liveDataEnabled
  );

  useEffect(() => {
    setPage(1);
    if (votesHistory && votesHistory?.length > PAGE_SIZE) {
      setDisplayData(votesHistory.slice(0, PAGE_SIZE - 1));
    } else {
      setDisplayData(votesHistory);
    }
  }, [votesHistory]);

  const handlePageChange = (page: number) => {
    setPage(page);
    setDisplayData(
      votesHistory?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    );
  };

  return (
    <Dialog
      open={isVotesHistoryOpen}
      onOpenChange={changeVoteHistoryDialogue}
    >
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[700px] bg-explorer-bg-start overflow-auto",
          {
            "flex column justify-center items-center": !votesHistory,
            "h-3/4": votesHistory?.length >= 16,
          }
        )}
        data-testid="votes-history-dialog"
      >
        {votesHistory ? (
          <>
            <div
              className="flex justify-center items-centertext-center font-semibold"
              data-testid="votes-history-dialog-witness-name"
            >
              {accountName.toUpperCase()} - Votes History
              {isVotesHistoryLoading && (
                <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
              )}
            </div>
            <div className="flex justify-between">
              {witnessDetails && (
                <p>Last updated : {witnessDetails.votes_updated_at}</p>
              )}
            </div>
            <div className="flex justify-around items-center bg-explorer-bg-start rounded text-text p-2">
              <div>
                <p>From: </p>
                <DateTimePicker
                  date={fromDate}
                  setDate={setFromDate}
                  side="bottom"
                />
              </div>
              <div>
                <p>To: </p>
                <DateTimePicker
                  date={toDate}
                  setDate={setToDate}
                  side="bottom"
                />
              </div>
            </div>
            {votesHistory && votesHistory?.length > PAGE_SIZE && (
              <div className="flex justify-center items-center">
                <CustomPagination
                  currentPage={page}
                  totalCount={votesHistory.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(page: number) => handlePageChange(page)}
                />
                <div className="justify-self-end">
                  <JumpToPage
                    currentPage={page}
                    onPageChange={(page: number) => handlePageChange(page)}
                  />
                </div>
              </div>
            )}
            <Table className="text-text">
              <TableHeader>
                <TableRow>
                  {tableColums.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={cn("min-h-12 h-auto p-3", {
                        "sticky md:static left-0": !index,
                        "flex justify-end items-center": column.isRightAligned,
                      })}
                    >
                      <span className="flex ">{column.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody data-testid="votes-history-dialog-table-body">
                {displayData?.votes_history &&
                  displayData?.votes_history.map((vote, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-rowEven" : "bg-rowOdd"
                      }`}
                    >
                      <TableCell
                        className={`sticky md:static left-0 ${
                          index % 2 === 0
                            ? "bg-rowEven md:bg-inherit"
                            : "bg-rowOdd md:bg-inherit"
                        }`}
                        data-testid="date-format"
                      >
                        {formatAndDelocalizeTime(vote.timestamp)}
                      </TableCell>
                      <TableCell
                        className="text-link"
                        data-testid="voter"
                      >
                        <Link href={`/@${vote.voter_name}`}>
                          {vote.voter_name}
                        </Link>
                      </TableCell>
                      <TableCell
                        className={`${
                          vote.approve
                            ? "text-explorer-light-green"
                            : "text-explorer-red"
                        }`}
                        data-testid="vote-arrow"
                      >
                        {vote.approve ? (
                          <ArrowUpCircleIcon color="#17e405" />
                        ) : (
                          <ArrowDownCircleIcon color="#f71b1b" />
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-testid="current-voter-power"
                      >
                        {formatNumber(vote.vests, true)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        ) : (
          <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VotesHistoryDialog;
