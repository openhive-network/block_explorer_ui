import { useState, useEffect } from "react";
import { ArrowUpCircleIcon, ArrowDownCircleIcon, Loader2 } from "lucide-react";
import Link from "next/link";

import Explorer from "@/types/Explorer";
import { formatNumber } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { trimAccountName } from "@/utils/StringUtils";
import useWitnessVotesHistory from "@/hooks/api/common/useWitnessVotesHistory";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useI18n } from "../../i18n/i18n";
import { convertVestsToHP } from "@/utils/Calculations";
import { config } from "@/Config";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import CustomPagination from "../CustomPagination";
import NoResult from "../NoResult";
import DataCountMessage from "../DataCountMessage";
import DataExport from "../DataExport";
import SearchRanges from "../searchRanges/SearchRanges";
import Hive from "@/types/Hive";
import VotesHistoryWidget from "./VotesHistoryChart";
import { useSettings } from "@/contexts/SettingsContext";
import HiveAvatar from "@/components/ui/HiveAvatar";

type VotesHistoryDialogProps = {
  accountName: string;
  isVotesHistoryOpen: boolean;
  changeVoteHistoryDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
  accountDetails?: Explorer.FormattedAccountDetails;
};

const VotesHistoryDialog: React.FC<VotesHistoryDialogProps> = ({
  accountName,
  isVotesHistoryOpen,
  changeVoteHistoryDialogue,
  liveDataEnabled,
  accountDetails,
}) => {
  const { t } = useI18n();

  const { settings } = useSettings();

  // State for UI controls and inputs
  const [pageNum, setPageNum] = useState<number>(1);

  const [isHP, setIsHP] = useState<boolean>(
    settings.displayVestHpMode === "hp"
  );
  useEffect(() => {
    setIsHP(settings.displayVestHpMode === "hp");
  }, [settings.displayVestHpMode]);

  const [voterNameInput, setVoterNameInput] = useState<string>("");
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const searchRanges = useSearchRanges();
  const {
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
  } = searchRanges;

  // State for the active API query
  const [activeVoterName, setActiveVoterName] = useState<string | undefined>(
    undefined
  );
  const [activeFromDate, setActiveFromDate] = useState<Date | undefined>(
    undefined
  );
  const [activeToDate, setActiveToDate] = useState<Date | undefined>(undefined);
  const [activeFromBlock, setActiveFromBlock] = useState<number | undefined>(
    undefined
  );
  const [activeToBlock, setActiveToBlock] = useState<number | undefined>(
    undefined
  );

  // API Hooks
  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;
  const { votesHistory, isVotesHistoryLoading } = useWitnessVotesHistory(
    accountName,
    isVotesHistoryOpen,
    pageNum,
    activeFromDate,
    activeToDate,
    activeFromBlock,
    activeToBlock,
    activeVoterName,
    liveDataEnabled
  );

  const totalVestingShares =
    dynamicGlobalData?.headBlockDetails.rawTotalVestingShares;
  const totalVestingFundHive =
    dynamicGlobalData?.headBlockDetails.rawTotalVestingFundHive;

  // Handlers
  const handleSearch = async () => {
    const {
      payloadStartDate,
      payloadEndDate,
      payloadFromBlock,
      payloadToBlock,
    } = await searchRanges.getRangesValues();
    setActiveFromBlock(payloadFromBlock ? payloadFromBlock : undefined);
    setActiveToBlock(payloadToBlock ? payloadToBlock : undefined);
    setActiveVoterName(
      voterNameInput ? trimAccountName(voterNameInput) : undefined
    );
    setActiveFromDate(
      payloadStartDate ? new Date(payloadStartDate) : undefined
    );
    setActiveToDate(payloadEndDate ? new Date(payloadEndDate) : undefined);
    setPageNum(1);
  };

  const handleClear = () => {
    setVoterNameInput("");
    setFromBlock(undefined);
    setToBlock(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setLastBlocksValue(undefined);
    setLastTimeUnitValue(30);
    setRangeSelectKey("none");
    setTimeUnitSelectKey("days");
    setActiveVoterName(undefined);
    setActiveFromDate(undefined);
    setActiveToDate(undefined);
    setActiveFromBlock(undefined);
    setActiveToBlock(undefined);
    setPageNum(1);
  };

  const fetchHivePower = (value: string, isHP: boolean): string => {
    if (isHP) {
      if (!hiveChain || !totalVestingFundHive || !totalVestingShares) return "";
      return convertVestsToHP(
        hiveChain,
        value,
        totalVestingFundHive,
        totalVestingShares
      );
    }
    return `${formatNumber(value, true)} ${t("votesHistoryDialog.vests")}`;
  };

  const prepareExportData = () => {
    if (!votesHistory?.votes_history) return [];
    return votesHistory.votes_history.map((vote: Hive.WitnessVotesHistory) => ({
      [t("votesHistoryDialog.date")]: formatAndDelocalizeTime(vote.timestamp),
      [t("votersDialog.voter")]: vote.voter_name,
      [t("votesHistoryDialog.vote")]: vote.approve
        ? t("votesHistoryDialog.approve", "Approve")
        : t("votesHistoryDialog.disapprove", "Disapprove"),
      [t("votesHistoryDialog.currentVoterPower")]: fetchHivePower(
        vote.vests.toString(),
        isHP
      ),
    }));
  };

  useEffect(() => {
    if (isVotesHistoryOpen) {
      handleClear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVotesHistoryOpen]);

  return (
    <Dialog open={isVotesHistoryOpen} onOpenChange={changeVoteHistoryDialogue}>
      <DialogContent className="h-3/4 max-w-7xl flex flex-col overflow-y-auto md:p-6 p-1">
        <div className="flex max-h-[85vh] min-h-0 flex-col">
          <DialogHeader className="shrink-0 p-4">
            <DialogTitle className="text-center text-lg">
              {accountName.toUpperCase()} -{" "}
              {t("votesHistoryDialog.votesHistory")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {/* Filters Section  */}
            <div className="flex-shrink-0 space-y-1 p-6  rounded-md ">
              <Label className="text-lg">{t("common.filters")}</Label>
              <div className="flex flex-col">
                <div className="w-full md:w-1/3">
                  <AutocompleteInput
                    value={voterNameInput}
                    onChange={setVoterNameInput}
                    placeholder={t("votesHistoryDialog.voterNamePlaceholder")}
                    inputType="account_name"
                    className="w-full bg-theme dark:bg-theme border-0 border-b-2"
                  />
                </div>
                <div className="w-full md:w-2/3">
                  <SearchRanges
                    rangesProps={searchRanges}
                    setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                  />
                </div>
              </div>
              <div className="flex items-end justify-end mt-2 gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={isSearchButtonDisabled || isVotesHistoryLoading}
                >
                  {t("common.search")}
                  {isVotesHistoryLoading && (
                    <Loader2 className="ml-2 animate-spin h-4 w-4" />
                  )}
                </Button>
                <Button onClick={handleClear} variant="outline">
                  {t("common.clear")}
                </Button>
              </div>
            </div>
            {isVotesHistoryLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : votesHistory && votesHistory.votes_history?.length > 0 ? (
              <div className="flex h-full flex-col min-h-0">
                <div className="h-[500px] w-full">
                  <VotesHistoryWidget
                    className="h-full"
                    events={votesHistory?.votes_history}
                    hiveChain={hiveChain as any}
                    totalVestingShares={totalVestingShares}
                    totalVestingFund={totalVestingFundHive}
                    isHp={isHP}
                  />
                </div>
                <div className="mb-2 flex shrink-0 items-center justify-between">
                  <DataCountMessage
                    count={votesHistory.total_votes}
                    dataType={t("votesHistoryDialog.votes")}
                  />
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <label className="mr-2">{t("votersDialog.vests")}</label>
                      <Switch
                        checked={isHP}
                        onCheckedChange={() => setIsHP((prev) => !prev)}
                        className="mx-1"
                      />
                      <label>{t("votersDialog.hp")}</label>
                    </div>
                    <DataExport
                      data={prepareExportData()}
                      filename={`${accountName}_${t(
                        "votesHistoryDialog.votesHistory"
                      ).toLowerCase()}.csv`}
                    />
                  </div>
                </div>

                <div className="pt-4 shrink-0">
                  <CustomPagination
                    currentPage={pageNum}
                    onPageChange={setPageNum}
                    pageSize={config.standardPaginationSize}
                    totalCount={votesHistory?.total_votes}
                    className="rounded"
                    isMirrored={false}
                  />
                </div>

                <div className="flex-1 min-h-0">
                  <div className="text-text w-full rounded bg-theme overflow-auto relative">
                    <Table
                      enableMobileScrollArrows
                      isDialog
                      className="min-w-max"
                    >
                      <TableHeader>
                        <TableRow rowVariant="header">
                          <TableHead stickyLeft>
                            {t("votesHistoryDialog.date")}
                          </TableHead>
                          <TableHead>{t("votersDialog.voter")}</TableHead>
                          <TableHead>{t("votesHistoryDialog.vote")}</TableHead>
                          <TableHead className="text-right">
                            {t("votesHistoryDialog.currentVoterPower")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody data-testid="votes-history-dialog-table-body">
                        {votesHistory.votes_history.map(
                          (vote: Hive.WitnessVotesHistory) => (
                            <TableRow
                              key={`${vote.voter_name}-${vote.timestamp}`}
                            >
                              <TableCell stickyLeft>
                                {formatAndDelocalizeTime(vote.timestamp)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <HiveAvatar
                                    accountName={vote.voter_name}
                                    size={30}
                                    alt={`${vote.voter_name}'s profile`}
                                    className="rounded-full"
                                  />
                                  <Link
                                    className="text-link"
                                    href={`/@${vote.voter_name}`}
                                  >
                                    {vote.voter_name}
                                  </Link>
                                </div>
                              </TableCell>
                              <TableCell>
                                {vote.approve ? (
                                  <ArrowUpCircleIcon color="#17e405" />
                                ) : (
                                  <ArrowDownCircleIcon color="#f71b1b" />
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {fetchHivePower(vote.vests.toString(), isHP)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <NoResult />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VotesHistoryDialog;
