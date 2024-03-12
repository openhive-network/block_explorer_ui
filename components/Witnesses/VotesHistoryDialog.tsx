import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import DateTimePicker  from "../DateTimePicker";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { cn, formatNumber } from "@/lib/utils";
import moment from "moment";
import { config } from "@/Config";
import CustomPagination from "../CustomPagination";
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from "lucide-react";
import useWitnessVotesHistory from "@/api/common/useWitnessVotesHistory";
import JumpToPage from "../JumpToPage";

type VotersDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
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
}) => {
  const [showHivePower, setShowHivePower] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [displayData, setDisplayData] = useState<Hive.WitnessVotesHistory[]>();
  const [fromDate, setFromDate] = useState<Date>(
    moment().subtract(7, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date>(moment().toDate());

  const { votesHistory, isVotesHistoryLoading } = useWitnessVotesHistory(
    accountName,
    isVotesHistoryOpen,
    fromDate,
    toDate
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

  const buildCustomDialogStyle = () => {
    const intialDialogStyle = "max-w-2xl bg-white overflow-auto";

    if (!votesHistory) {
      return `${intialDialogStyle} flex column justify-center items-center`;
    }
    if (votesHistory.length < 4) return intialDialogStyle;

    return `h-3/4 ${intialDialogStyle}`;
  };

  return (
    <Dialog
      open={isVotesHistoryOpen}
      onOpenChange={changeVoteHistoryDialogue}
    >
      <DialogContent className={buildCustomDialogStyle()} data-testid="votes-history-dialog">
        {votesHistory ? (
          <>
            <div className="flex justify-center items-centertext-center font-semibold" data-testid="votes-history-dialog-witness-name">
              {accountName}{" "}
              {isVotesHistoryLoading && (
                <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
              )}
            </div>
            <div className="flex">
              <label>Vests</label>
              <Switch
                className="mx-2"
                checked={showHivePower}
                onCheckedChange={setShowHivePower}
                data-testid="votes-history-dialog-vests-hivepower-button"
              />
              <label>Hive Power</label>
            </div>
            <div className="flex justify-around items-center bg-gray-800 rounded text-white p-3">
              <div>
                <p>From: </p>
                <DateTimePicker
                  date={fromDate}
                  setDate={setFromDate}
                  side="left"
                />
              </div>
              <div>
                <p>To: </p>
                <DateTimePicker
                  date={toDate}
                  setDate={setToDate}
                  side="right"
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
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  {tableColums.map((column, index) => (
                    <TableHead
                      key={column.key}
                      className={cn({
                        "sticky md:static left-0": !index,
                        "flex justify-end items-center": column.isRightAligned
                      })}
                    >
                      <span className="flex ">{column.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody data-testid="votes-history-dialog-table-body">
                {displayData &&
                  displayData?.map((vote, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }`}
                    >
                      <TableCell className="sticky left-0" data-testid="date-format">
                        {moment(vote.timestamp).format(
                          config.baseMomentTimeFormat
                        )}
                      </TableCell>
                      <TableCell className="text-explorer-turquoise">
                      <Link href={`/@${vote.voter}`}>
                          {vote.voter}
                        </Link>
                      </TableCell>
                      <TableCell
                        className={`${
                          vote.approve ? "text-green-400" : "text-red-400"
                        }`}
                        data-testid="vote-arrow"
                      >
                        {vote.approve ? (
                          <ArrowUpCircleIcon />
                        ) : (
                          <ArrowDownCircleIcon />
                        )}
                      </TableCell>
                      <TableCell className="text-right" data-testid="current-voter-power">
                        {showHivePower
                          ? formatNumber(vote.vests_hive_power, false)
                          : formatNumber(vote.vests, true)
                        }
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
