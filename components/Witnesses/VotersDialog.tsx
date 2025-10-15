import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Loader2, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Switch } from "../ui/switch";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import useWitnessVoters from "@/hooks/api/common/useWitnessVoters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useWitnessDetails from "@/hooks/api/common/useWitnessDetails";
import CustomPagination from "../CustomPagination";
import { config } from "@/Config";
import { convertVestsToHP } from "@/utils/Calculations";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import NoResult from "../NoResult";
import DataCountMessage from "../DataCountMessage";
import Explorer from "@/types/Explorer";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import Hive from "@/types/Hive";
import VotersChart from "./VotersChart";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Image from "next/image";
import DataExport from "../DataExport";
import { useI18n } from "@/i18n/i18n";
import AutoCompleteInput from "../ui/AutoCompleteInput";
import { Button } from "@/components/ui/button";
import { trimAccountName } from "@/utils/StringUtils";
import { useSettings } from "@/contexts/SettingsContext";

type VotersDialogProps = {
  accountName: string;
  isVotersOpen: boolean;
  changeVotersDialogue: (isOpen: boolean) => void;
  liveDataEnabled: boolean;
  accountDetails?: Explorer.FormattedAccountDetails;
};

interface VoterData {
  voter_name: string;
  vests: number;
  account_vests: number;
  proxied_vests: number;
}

interface ChartVoter {
  voterWeight: number;
  voterName: string;
}

const VotersDialog: React.FC<VotersDialogProps> = ({
  accountName,
  isVotersOpen,
  changeVotersDialogue,
  liveDataEnabled,
  accountDetails,
}) => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [sortKey, setSortKey] = useState<string>("vests");
  const [isAsc, setIsAsc] = useState<boolean>(false);
  const [pageNum, setPageNum] = useState<number>(1);

  const [isHP, setIsHP] = useState<boolean>(settings.displayVestHpMode === "hp");
  useEffect(() => {
      setIsHP(settings.displayVestHpMode === "hp");
    }, [settings.displayVestHpMode]);
    
  const [voterNameInput, setVoterNameInput] = useState<string>("");

  const [activeVoterName, setActiveVoterName] = useState<string | undefined>(
    undefined
  );

  const handleSearch = () => {
    setActiveVoterName(
      voterNameInput ? trimAccountName(voterNameInput) : undefined
    );
    setPageNum(1);
  };

  const handleClear = () => {
    setVoterNameInput("");
    setActiveVoterName(undefined);
    setPageNum(1);
  };

  const { witnessDetails } = useWitnessDetails(
    accountName,
    accountDetails ? !!accountDetails?.is_witness : true
  );
  const { witnessVoters, isWitnessVotersLoading } = useWitnessVoters(
    accountName,
    isVotersOpen,
    isAsc,
    sortKey,
    liveDataEnabled,
    pageNum,
    activeVoterName
  );
  const { witnessVoters: chartData } = useWitnessVoters(
    accountName,
    isVotersOpen,
    false,
    "vests",
    liveDataEnabled,
    1
  );

  const changeSorter = (newIsAsc: boolean, newSortKey: string) => {
    const isAscForChange = newSortKey === sortKey ? newIsAsc : false;
    setSortKey(newSortKey);
    setIsAsc(isAscForChange);
  };

  const onHeaderClick = (propertyKey: string) => {
    if (!changeSorter) return;

    changeSorter(!isAsc, propertyKey);
  };

  const showSorter = (columnName: string) => {
    if (columnName === sortKey) {
      return isAsc ? (
        <ChevronDown
          onClick={() => onHeaderClick(columnName)}
          className="cursor-pointer hover:bg-buttonHover ml-1 text-text"
          size={15}
        />
      ) : (
        <ChevronUp
          onClick={() => onHeaderClick(columnName)}
          className="cursor-pointer hover:bg-buttonHover mx-2 text-text"
          size={15}
        />
      );
    } else
      return (
        <ChevronsUpDown
          onClick={() => onHeaderClick(columnName)}
          className="cursor-pointer hover:bg-buttonHover mx-2 text-text"
          size={15}
        />
      );
  };

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
    return `${formatNumber(value, true)} VESTS`;
  };

  const totalAccountVests = Number(witnessDetails?.vests);

  const calculateVoterWeight = useCallback(
    (voterVests: number): number => {
      return totalAccountVests > 0 ? (voterVests / totalAccountVests) * 100 : 0;
    },
    [totalAccountVests]
  );

  const memoizedVotersChart = useMemo(() => {
    if (!chartData?.voters) return null;

    const topVoters = [...chartData.voters]
      .sort((a, b) => b.vests - a.vests)
      .slice(0, 10);

    const chartVoters: ChartVoter[] = topVoters.map((voter: VoterData) => {
      const voterWeight = calculateVoterWeight(voter.vests);

      return {
        voterWeight: voterWeight,
        voterName: voter.voter_name,
      };
    });

    return (
      <VotersChart
        voters={chartVoters}
        accountName={accountName}
      />
    );
  }, [chartData, accountName, calculateVoterWeight]);

  const prepareExportData = () => {
    if (!witnessVoters || !witnessVoters.voters || !accountName) return [];

    return witnessVoters.voters.map((voter: VoterData) => {
      const voterWeight = calculateVoterWeight(voter.vests);

      // Format the values as they appear in the table
      const votesFormatted = fetchHivePower(voter.vests.toString(), isHP);
      const accountVestsFormatted = fetchHivePower(
        voter.account_vests.toString(),
        isHP
      );
      const proxiedVestsFormatted = fetchHivePower(
        voter.proxied_vests.toString(),
        isHP
      );
      const voterWeightFormatted = formatPercent(voterWeight * 100);

      return {
        [t("votersDialog.voter")]: voter.voter_name,
        [t("votersDialog.votes")]: votesFormatted,
        [t("votersDialog.accountVests")]: accountVestsFormatted,
        [t("votersDialog.proxiedVests")]: proxiedVestsFormatted,
        [t("votersDialog.voterWeight")]: voterWeightFormatted,
      };
    });
  };

  return (
    <Dialog
      open={isVotersOpen}
      onOpenChange={changeVotersDialogue}
    >
      <DialogContent
        className={cn(
          "h-3/4 max-w-7xl flex flex-col md:flex-row overflow-y-auto md:p-6 p-1",
          !witnessVoters && "flex justify-center items-center"
        )}
        data-testid="voters-dialog"
      >
        {isWitnessVotersLoading && !witnessVoters ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin mt-1 h-8 w-8 ml-3 ..." />
          </div>
        ) : witnessVoters ? (
          witnessVoters.voters?.length === 0 && !activeVoterName ? (
            <div className="flex justify-center items-center w-full h-full">
              <NoResult />
            </div>
          ) : (
            <>
              {/* Chart Column */}
              <div className="w-full md:w-1/3 p-4">
                <div>
                  <div
                    className="flex justify-center text-left font-semibold"
                    data-testid="voters-dialog-witness-name"
                  >
                    {accountName.toUpperCase()}
                    {t("votersDialog.nameVoters")}
                  </div>
                </div>
                {memoizedVotersChart}
              </div>

              <div className="w-full flex flex-col mt-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border rounded-md mb-4">
                  {/* Search Input Group */}
                  <div className="w-full sm:w-auto sm:flex-grow">
                    <div className="flex rounded-md shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 gap-x-2">
                      <AutoCompleteInput
                        value={voterNameInput}
                        onChange={setVoterNameInput}
                        placeholder={t(
                          "votesHistoryDialog.voterNamePlaceholder"
                        )}
                        inputType="account_name"
                        className="flex-grow rounded-none rounded-l-md border-r-0 focus:ring-0 bg-theme dark:bg-theme"
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isWitnessVotersLoading}
                        className="rounded-none"
                      >
                        {t("common.search")}
                      </Button>
                      <Button
                        onClick={handleClear}
                        variant="outline"
                        className="rounded-none rounded-r-md"
                      >
                        {t("common.clear")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center w-full mb-2 px-2">
                  <DataCountMessage
                    count={witnessVoters.total_votes}
                    dataType={t("votersDialog.voters")}
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <label className="mr-2 text-sm">
                        {t("votersDialog.vests")}
                      </label>
                      <Switch
                        checked={isHP}
                        onCheckedChange={() => setIsHP((prev) => !prev)}
                        className="mx-1"
                      />
                      <label className="text-sm">{t("votersDialog.hp")}</label>
                    </div>
                    <DataExport
                      data={prepareExportData()}
                      filename={`${accountName}_${t(
                        "votersDialog.voters"
                      )}.csv`}
                    />
                  </div>
                </div>

                {isWitnessVotersLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin h-8 w-8 text-brand" />
                  </div>
                ) : witnessVoters.voters?.length === 0 ? (
                  <div className="flex justify-center items-center w-full h-full mt-4">
                    <NoResult />
                  </div>
                ) : (
                  <div className="relative rounded overflow-hidden w-full">
                    <div className="text-text w-full h-full overflow-auto bg-theme rounded">
                      <Table
                        enableMobileScrollArrows
                        isDialog
                      >
                        <TableHeader>
                          <TableRow rowVariant="header">
                            <TableHead stickyLeft>
                              <span className="flex">
                                {t("votersDialog.voter")} {showSorter("voter")}
                              </span>
                            </TableHead>

                            <TableHead className="text-right">
                              <span className="flex justify-end">
                                {t("votersDialog.votes")} {showSorter("vests")}
                              </span>
                            </TableHead>

                            <TableHead className="text-right">
                              <span className="flex justify-end">
                                {t("votersDialog.accountVests")}{" "}
                                {showSorter("account_vests")}
                              </span>
                            </TableHead>

                            <TableHead className="text-right">
                              <span className="flex justify-end">
                                {t("votersDialog.proxiedVests")}{" "}
                                {showSorter("proxied_vests")}
                              </span>
                            </TableHead>
                            <TableHead className="text-right">
                              <span className="flex justify-end">
                                {t("votersDialog.voterWeight")}
                              </span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody data-testid="voters-dialog-table-body">
                          {witnessVoters.voters.map((voter, index) => {
                            const voterWeight = calculateVoterWeight(
                              voter.vests
                            );
                            return (
                              <TableRow key={index}>
                                <TableCell stickyLeft>
                                  <div className="flex items-center space-x-2 p-2">
                                    <Image
                                      src={getHiveAvatarUrl(voter.voter_name)}
                                      alt={`${voter.voter_name}'s profile`}
                                      width={30}
                                      height={30}
                                      className="rounded-full"
                                    />
                                    <Link
                                      className="text-link"
                                      href={`/@${voter.voter_name}`}
                                      data-testid="voter-name"
                                    >
                                      {voter.voter_name}
                                    </Link>
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="text-right"
                                  data-testid="vote-power"
                                >
                                  {fetchHivePower(voter.vests.toString(), isHP)}
                                </TableCell>
                                <TableCell
                                  className="text-right"
                                  data-testid="account-power"
                                >
                                  {fetchHivePower(
                                    voter.account_vests.toString(),
                                    isHP
                                  )}
                                </TableCell>
                                <TableCell
                                  className="text-right"
                                  data-testid="proxied-power"
                                >
                                  {fetchHivePower(
                                    voter.proxied_vests.toString(),
                                    isHP
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatPercent(voterWeight * 100)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <CustomPagination
                    currentPage={pageNum}
                    onPageChange={setPageNum}
                    pageSize={config.standardPaginationSize}
                    totalCount={witnessVoters.total_votes}
                    className="rounded"
                    isMirrored={false}
                  />
                </div>
              </div>
            </>
          )
        ) : (
          <div className="flex justify-center items-center w-full h-full">
            <p>
              {t("common.errorLoadingData")}: {t("votersDialog.unableToLoad")}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VotersDialog;
