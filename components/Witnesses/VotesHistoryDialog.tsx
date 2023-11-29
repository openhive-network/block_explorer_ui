import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
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
import { cn } from "@/lib/utils";
import moment from "moment";
import { config } from "@/Config";
import CustomPagination from "../CustomPagination";
import { ArrowUpCircleIcon, ArrowDownCircleIcon } from "lucide-react";
import useWitnessVotesHistory from "@/api/common/useWitnessVotesHistory";

type VotersDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
};

const tableColums = [
  { key: "timestamp", name: "Date" },
  { key: "voter", name: "Voter" },
  { key: "vote", name: "Vote" },
  { key: "power", name: "Current voter power" },
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

  return (
    <Dialog
      open={isVotesHistoryOpen}
      onOpenChange={changeVoteHistoryDialogue}
    >
      <DialogContent
        className={`h-3/4 max-w-2xl overflow-auto bg-white ${
          !votesHistory && "flex justify-center items-center"
        }`}
      >
        {votesHistory ? (
          <>
            <div className="flex justify-center items-centertext-center font-semibold">
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
              />
              <label>Hive Power</label>
            </div>
            <div className="flex justify-around items-center bg-gray-800 rounded-[4px] text-white p-2">
              <div>
                From:{" "}
                <DateTimePicker
                  value={fromDate}
                  onChange={(date) => setFromDate(date!)}
                  className="text-explorer-turquoise"
                  calendarClassName="text-gray-800"
                  format="yyyy/MM/dd HH:mm:ss"
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                  showLeadingZeros={false}
                />
              </div>
              <div>
                To:{" "}
                <DateTimePicker
                  value={toDate}
                  onChange={(date) => setToDate(date!)}
                  className="text-explorer-turquoise"
                  calendarClassName="text-gray-800"
                  format="yyyy/MM/dd HH:mm:ss"
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                  showLeadingZeros={false}
                />
              </div>
            </div>
            {votesHistory && votesHistory?.length > PAGE_SIZE && (
              <div className="flex justify-center">
                <CustomPagination
                  currentPage={page}
                  totalCount={votesHistory.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(page: number) => handlePageChange(page)}
                />
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
                      })}
                    >
                      <span className="flex ">{column.name}</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData &&
                  displayData?.map((vote, index) => (
                    <TableRow
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }`}
                    >
                      <TableCell className="sticky left-0">
                        {moment(vote.timestamp).format(
                          config.baseMomentTimeFormat
                        )}
                      </TableCell>
                      <TableCell className="text-explorer-turquoise">
                        <Link href={`/account/${vote.voter}`}>
                          {vote.voter}
                        </Link>
                      </TableCell>
                      <TableCell
                        className={`${
                          vote.approve ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {vote.approve ? (
                          <ArrowUpCircleIcon />
                        ) : (
                          <ArrowDownCircleIcon />
                        )}
                      </TableCell>
                      <TableCell>
                        {showHivePower
                          ? vote.vests_hive_power
                          : vote.vests.toLocaleString()}{" "}
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
