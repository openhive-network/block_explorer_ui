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
import NoResult from "../NoResult";
import Explorer from "@/types/Explorer";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";

interface Supply {
  amount: string;
  nai: string;
  precision: number;
}

type VotersDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
  accountDetails?: Explorer.FormattedAccountDetails;
};

const PAGE_SIZE = 100;

const VotesHistoryDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotesHistoryOpen,
  changeVoteHistoryDialogue,
  liveDataEnabled,
  accountDetails,
}) => {
  const [page, setPage] = useState(1);
  const [displayData, setDisplayData] =
    useState<Hive.WitnessesVotesHistoryResponse>();
  const [fromDate, setFromDate] = useState<Date>(
    moment().subtract(7, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date>(moment().toDate());
  const [isHP, setIsHP] = useState<boolean>(true); // Toggle state

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  const [totalVestingShares, setTotalVestingShares] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares
  );
  const [totalVestingFundHive, setTotalVestingFundHive] = useState<Hive.Supply>(
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive
  );

  useEffect(() => {
    if (dynamicGlobalData?.headBlockDetails) {
      setTotalVestingShares(
        dynamicGlobalData.headBlockDetails.rawTotalVestingShares
      );
      setTotalVestingFundHive(
        dynamicGlobalData.headBlockDetails.rawTotalVestingFundHive
      );
    }
  }, [dynamicGlobalData]);

  const { witnessDetails } = useWitnessDetails(
    accountName,
    !!accountDetails?.is_witness
  );

  const { votesHistory, isVotesHistoryLoading } = useWitnessVotesHistory(
    accountName,
    isVotesHistoryOpen,
    fromDate,
    toDate,
    liveDataEnabled
  );

  const handlePageChange = (page: number) => {
    setPage(page);
    setDisplayData(
      votesHistory?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    );
  };

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
    return `${formatNumber(value, true)} Vests`; // Return raw vests if not toggled to HP
  };
  useEffect(() => {
    if (moment(fromDate).isSame(toDate) || moment(fromDate).isAfter(toDate)) {
      setFromDate(moment(fromDate).subtract(1, "hours").toDate());
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    setPage(1);
    if (votesHistory && votesHistory?.length > PAGE_SIZE) {
      setDisplayData(votesHistory.slice(0, PAGE_SIZE - 1));
    } else {
      setDisplayData(votesHistory);
    }
  }, [votesHistory]);

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
            <div>
              <div
                className="flex justify-center items-centertext-center font-semibold"
                data-testid="votes-history-dialog-witness-name"
              >
                {accountName.toUpperCase()} - Votes History
                {isVotesHistoryLoading && (
                  <Loader2 className="animate-spin mt-1 h-4 w-4 ml-3 ..." />
                )}
              </div>
              <div className="flex justify-between items-center w-full pt-4 pb-4">
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
                    totalCount={votesHistory.length}
                    pageSize={PAGE_SIZE}
                  />
                </div>
              </div>
            )}
            {votesHistory?.votes_history?.length === 0 &&
            !isVotesHistoryLoading ? (
              <div>
                <NoResult />
              </div>
            ) : (
              <div className="relative rounded overflow-hidden w-full">
                <div className="text-text w-full h-full overflow-auto bg-theme rounded">
                  <Table>
                    <TableHeader>
                      <TableRow rowVariant="header">
                        <TableHead stickyLeft>Date</TableHead>
                        <TableHead>Voter</TableHead>
                        <TableHead>Vote</TableHead>
                        <TableHead className="text-right">
                          Current Voter Power
                        </TableHead>
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
                              stickyLeft
                              data-testid="date-format"
                            >
                              {formatAndDelocalizeTime(vote.timestamp)}
                            </TableCell>
                            <TableCell data-testid="voter">
                              <Link
                                className="text-link"
                                href={`/@${vote.voter_name}`}
                              >
                                {vote.voter_name}
                              </Link>
                            </TableCell>
                            <TableCell data-testid="vote-arrow">
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
                              {fetchHivePower(vote.vests.toString(), isHP)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        ) : (
          <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VotesHistoryDialog;
