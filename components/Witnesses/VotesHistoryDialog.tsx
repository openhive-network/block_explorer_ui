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
import LastUpdatedTooltip from "../LastUpdatedTooltip";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { convertVestsToHP } from "@/utils/Calculations";
import fetchingService from "@/services/FetchingService";

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
  { key: "power", name: "Current Voter Power", isRightAligned: true },
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
  const [isHP, setIsHP] = useState<boolean>(true); // Toggle state

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
  interface Supply {
    amount: string;
    nai: string;
    precision: number;
  }

  const [totalVestingShares, setTotalVestingShares] = useState<Supply>({
    amount: "0",
    nai: "",
    precision: 0,
  });
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Supply>({
    amount: "0",
    nai: "",
    precision: 0,
  });
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

  const fetchHivePower = (value: string, isHP: boolean): string => {
    if (isHP) {
      if (!hiveChain) return "";
      return convertVestsToHP(
        hiveChain,
        value,
        totalVestingFundHive,
        totalVestingShares
      );
    }
    return formatNumber(parseInt(value), true, false) + " Vests"; // Return raw vests if not toggled to HP
  };

  useEffect(() => {
    if (fromDate >= toDate) {
      const date = new Date(toDate);
      date.setHours(date.getHours() - 1);
      setFromDate(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  return (
    <Dialog
      open={isVotesHistoryOpen}
      onOpenChange={changeVoteHistoryDialogue}
    >
      <DialogContent
        className={cn("h-3/4 max-w-4xl bg-explorer-bg-start", {
          "flex justify-center items-center": !votesHistory,
        })}
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
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center">
                {witnessDetails && (
                  <LastUpdatedTooltip
                    lastUpdatedAt={witnessDetails.votes_updated_at}
                  />
                )}
              </div>

              <div className="flex items-center">
                <label className="mr-2">Vests</label>
                <Switch
                  checked={isHP}
                  onCheckedChange={() => setIsHP((prev) => !prev)}
                  className="mx-1"
                />
                <label>HP</label>
              </div>
            </div>
            <div className="flex justify-around items-center bg-explorer-bg-start rounded text-text p-2">
              <div>
                <p>From: </p>
                <DateTimePicker
                  date={fromDate}
                  setDate={setFromDate}
                  side="bottom"
                  lastDate={toDate}
                />
              </div>
              <div>
                <p>To: </p>
                <DateTimePicker
                  date={toDate}
                  setDate={setToDate}
                  side="bottom"
                  firstDate={fromDate}
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
                        {" "}
                        {fetchHivePower(vote.vests.toString(), isHP)}
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
