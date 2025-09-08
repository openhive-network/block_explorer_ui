import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { convertVestsToHP } from "@/utils/Calculations";
import { cn, formatNumber } from "@/lib/utils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useProposalVotes from "@/hooks/api/proposals/useProposalVotes";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NoResult from "@/components/NoResult";
import { Loader2, Search, ArrowDown, ArrowUp, ListFilter } from "lucide-react";
import DataCountMessage from "@/components/DataCountMessage";
import DataExport from "@/components/DataExport";
import { grabNumericValue } from "@/utils/StringUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ErrorMessage from "../ErrorMessage";
import {
  prepareChartData,
  ProposalVotesChart,
  TOP_CHART_VOTERS,
} from "./analytics/ProposalVotesChart";
import { useSettings } from "@/contexts/SettingsContext";

interface ProposalVotesDialogProps {
  proposalId: number;
  children: React.ReactNode;
}

export const ProposalVotesDialog = ({
  proposalId,
  children,
}: ProposalVotesDialogProps) => {
  const { t } = useI18n();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState<"name" | "power">("power");
  const [isAsc, setIsAsc] = useState(false);
  const [unit, setUnit] = useState<"hp" | "vests">(settings.displayMode);
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string | null>(
    null
  );

  const [isFetchComplete, setIsFetchComplete] = useState(false);
  const prevVotesCount = useRef(0);

  const {
    votes,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProposalVotes(proposalId, isOpen);

  const { hiveChain } = useHiveChainContext();
  const { dynamicGlobalData } = useDynamicGlobal() as any;

  useEffect(() => {
    if (!isOpen) {
      setIsFetchComplete(false);
      prevVotesCount.current = 0;
      return;
    }
    if (isFetchingNextPage || isFetchComplete || !hasNextPage) {
      if (!isLoading && !hasNextPage) setIsFetchComplete(true);
      return;
    }
    if (votes.length > 0 && votes.length === prevVotesCount.current) {
      setIsFetchComplete(true);
      return;
    }
    if (votes.length >= prevVotesCount.current) {
      prevVotesCount.current = votes.length;
      fetchNextPage();
    }
  }, [
    isOpen,
    votes,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isFetchComplete,
    isLoading,
  ]);

  const processedVotesWithVests = useMemo(() => {
    return votes.map((vote) => {
      const account = vote.accountDetails;
      if (!account) {
        return {
          voter: vote.voter,
          directVests: 0,
          proxiedVests: 0,
          totalVests: 0,
          displayTotalVests: 0,
          hasProxy: false,
          isDataLoaded: false,
          proxy: "",
        };
      }

      const directVests = grabNumericValue(account.vesting_shares.amount);
      const totalProxiedVests =
        Array.isArray(account.proxied_vsf_votes) &&
        account.proxied_vsf_votes.length > 0
          ? account.proxied_vsf_votes.reduce(
              (sum, currentVests) => Number(sum) + Number(currentVests),
              0
            )
          : 0;

      const hasActiveProxy = (account.proxy || "") !== "";

      // The value used for all calculations (chart, export)
      const effectiveTotalVests = hasActiveProxy
        ? 0
        : Number(directVests) + Number(totalProxiedVests);

      const displayTotalVests = Number(directVests) + Number(totalProxiedVests);

      return {
        voter: vote.voter,
        directVests,
        proxiedVests: Number(totalProxiedVests),
        totalVests: effectiveTotalVests, // For calculations
        displayTotalVests, // For sorting
        hasProxy: Number(totalProxiedVests) > 0,
        isDataLoaded: true,
        proxy: account.proxy || "",
      };
    });
  }, [votes]);

  const voterListDisplay = useMemo(() => {
    if (
      processedVotesWithVests.length === 0 ||
      !hiveChain ||
      !dynamicGlobalData
    )
      return [];
    const { rawTotalVestingFundHive, rawTotalVestingShares } =
      dynamicGlobalData.headBlockDetails;

    return processedVotesWithVests.map((vote) => {
      const hasActiveProxy = vote.proxy !== "";

      const directFormatted =
        unit === "hp"
          ? convertVestsToHP(
              hiveChain,
              String(vote.directVests),
              rawTotalVestingFundHive,
              rawTotalVestingShares
            )
          : `${formatNumber(vote.directVests, true, false)} ${t(
              "common.vests"
            )}`;

      const proxiedFormatted =
        unit === "hp"
          ? convertVestsToHP(
              hiveChain,
              String(vote.proxiedVests),
              rawTotalVestingFundHive,
              rawTotalVestingShares
            )
          : `${formatNumber(vote.proxiedVests, true, false)} ${t(
              "common.vests"
            )}`;

      return { ...vote, directFormatted, proxiedFormatted, hasActiveProxy };
    });
  }, [processedVotesWithVests, unit, hiveChain, dynamicGlobalData, t]);

  const chartProps = useMemo(() => {
    const chartInput = processedVotesWithVests.map((v) => ({
      voter: v.voter,
      totalVests: v.totalVests,
      proposal_total_votes: votes[0]?.proposal.total_votes || "0",
    }));
    return prepareChartData(chartInput, unit, hiveChain, dynamicGlobalData, t);
  }, [processedVotesWithVests, unit, hiveChain, dynamicGlobalData, t, votes]);

  const filteredAndSortedVotes = useMemo(() => {
    let processed = [...voterListDisplay];

    if (activeSegmentFilter) {
      const sortedByPower = [...voterListDisplay].sort(
        (a, b) => b.totalVests - a.totalVests
      );
      const topVotersByName = sortedByPower
        .slice(0, TOP_CHART_VOTERS)
        .map((v) => v.voter);

      if (activeSegmentFilter === "Others") {
        processed = processed.filter(
          (vote) => !topVotersByName.includes(vote.voter)
        );
      } else {
        processed = processed.filter(
          (vote) => vote.voter === activeSegmentFilter
        );
      }
    }

    if (searchQuery.length > 2) {
      processed = processed.filter((vote) =>
        vote.voter.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    processed.sort((a, b) => {
      if (sortBy === "power") {
        return isAsc
          ? a.displayTotalVests - b.displayTotalVests
          : b.displayTotalVests - a.displayTotalVests;
      } else {
        return isAsc
          ? a.voter.localeCompare(b.voter)
          : b.voter.localeCompare(a.voter);
      }
    });
    return processed;
  }, [voterListDisplay, searchQuery, isAsc, sortBy, activeSegmentFilter]);

  const showHeaderSpinner =
    !isFetchComplete && !isLoading && !isError && isOpen;

  const prepareExportData = useMemo(() => {
    if (unit === "hp") {
      if (!hiveChain || !dynamicGlobalData) return [];
      const { rawTotalVestingFundHive, rawTotalVestingShares } =
        dynamicGlobalData.headBlockDetails;

      const headers = {
        voter: t("proposalVotesDialog.voter"),
        total_hp: t("proposalVotesDialog.totalHp"),
        direct_hp: t("proposalVotesDialog.ownedHp"),
        proxied_hp: t("proposalVotesDialog.proxiedHp"),
      };

      return filteredAndSortedVotes.map((vote) => ({
        [headers.voter]: vote.voter,
        [headers.total_hp]: grabNumericValue(
          convertVestsToHP(
            hiveChain,
            String(vote.totalVests),
            rawTotalVestingFundHive,
            rawTotalVestingShares
          )
        ),
        [headers.direct_hp]: vote.hasActiveProxy
          ? 0
          : grabNumericValue(
              convertVestsToHP(
                hiveChain,
                String(vote.directVests),
                rawTotalVestingFundHive,
                rawTotalVestingShares
              )
            ),
        [headers.proxied_hp]: vote.hasActiveProxy
          ? 0
          : grabNumericValue(
              convertVestsToHP(
                hiveChain,
                String(vote.proxiedVests),
                rawTotalVestingFundHive,
                rawTotalVestingShares
              )
            ),
      }));
    } else {
      const headers = {
        voter: t("proposalVotesDialog.voter"),
        total_vests: t("proposalVotesDialog.totalVests"),
        direct_vests: t("proposalVotesDialog.ownedVests"),
        proxied_vests: t("proposalVotesDialog.proxiedVests"),
      };

      return filteredAndSortedVotes.map((vote) => ({
        [headers.voter]: vote.voter,
        [headers.total_vests]: vote.totalVests,
        [headers.direct_vests]: vote.hasActiveProxy ? 0 : vote.directVests,
        [headers.proxied_vests]: vote.hasActiveProxy ? 0 : vote.proxiedVests,
      }));
    }
  }, [filteredAndSortedVotes, unit, hiveChain, dynamicGlobalData, t]);

  const exportFilename = useMemo(() => {
    return t("proposalVotesDialog.exportFilename", {
      proposalId,
      unit,
    });
  }, [t, proposalId, unit]);

  const handleSegmentClick = (segmentName: string | null) => {
    setSearchQuery("");
    setActiveSegmentFilter(segmentName);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-[90vh] max-w-7xl flex flex-col p-4 sm:p-6 overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>
              {t("proposalVotesDialog.title")}
              {proposalId}
            </span>
            {showHeaderSpinner && (
              <Loader2 className="animate-spin h-5 w-5 text-explorer-extra-light-gray" />
            )}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex-grow flex justify-center items-center">
            <Loader2 className="animate-spin h-10 w-10" />
          </div>
        ) : isError ? (
          <div className="flex-grow flex justify-center items-center">
            <ErrorMessage message={t("proposalVotesDialog.error")} />
          </div>
        ) : (
          <TooltipProvider>
            <div className="flex-grow flex flex-col lg:flex-row gap-6 ">
              <div className="lg:w-2/5 flex flex-col items-center justify-center lg:border-r lg:pr-6 lg:border-slate-200 lg:dark:border-slate-800">
                <ProposalVotesChart
                  {...chartProps}
                  onSegmentClick={handleSegmentClick}
                  activeSegment={activeSegmentFilter}
                />
              </div>
              <div className="lg:w-3/5 flex flex-col h-full overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-4">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder={t("proposalVotesDialog.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                    <Select
                      onValueChange={(value) =>
                        setSortBy(value as "name" | "power")
                      }
                      value={sortBy}
                    >
                      <SelectTrigger className="w-full sm:w-[150px] whitespace-nowrap">
                        <ListFilter
                          className={cn("h-4 w-4 mr-2 transition-transform", {
                            "rotate-180": isAsc,
                          })}
                        />
                        <SelectValue
                          placeholder={t(
                            "proposalVotesDialog.sortByPlaceholder"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="power">
                          {t("proposalVotesDialog.sortByPower")}
                        </SelectItem>
                        <SelectItem value="name">
                          {t("proposalVotesDialog.sortByName")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsAsc((prev) => !prev)}
                        >
                          {isAsc ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t("proposalVotesDialog.toggleSortDirection")}
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center space-x-2 rounded-md p-1.5">
                      <Label
                        htmlFor="unit-toggle"
                        className="text-sm"
                      >
                        {t("common.vests")}
                      </Label>
                      <Switch
                        id="unit-toggle"
                        checked={unit === "hp"}
                        onCheckedChange={(checked) =>
                          setUnit(checked ? "hp" : "vests")
                        }
                      />
                      <Label
                        htmlFor="unit-toggle"
                        className="text-sm "
                      >
                        {t("common.hp")}
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="relative flex-grow overflow-y-auto pr-1 mr-1 h-[60vh]">
                  {filteredAndSortedVotes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {filteredAndSortedVotes.map((vote) => (
                        <div
                          key={vote.voter}
                          className="py-2"
                        >
                          <Link
                            href={`/@${vote.voter}`}
                            className="flex items-center space-x-3"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={getHiveAvatarUrl(vote.voter)}
                              alt={vote.voter}
                              width={32}
                              height={32}
                              className="rounded-full flex-shrink-0"
                            />
                            <div className="flex-grow min-w-0">
                              <p className="text-link">{vote.voter}</p>
                              {vote.isDataLoaded ? (
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {vote.hasActiveProxy ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="line-through cursor-help">
                                          {vote.directFormatted}
                                          {vote.hasProxy && (
                                            <>
                                              {" "}
                                              + {vote.proxiedFormatted}{" "}
                                              {t("common.proxySuffix")}
                                            </>
                                          )}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {t(
                                          "proposalVotesDialog.proxiedVoteTooltip",
                                          { proxy: vote.proxy }
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <>
                                      <span>{vote.directFormatted}</span>
                                      {vote.hasProxy && (
                                        <span className="text-slate-400 dark:text-slate-500">
                                          {" "}
                                          + {vote.proxiedFormatted}{" "}
                                          {t("common.proxySuffix")}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </p>
                              ) : (
                                <div className="mt-1 h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : isFetchComplete ? (
                    <NoResult
                      descriptionKey={t("proposalVotesDialog.noResults")}
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <DataCountMessage
                    count={filteredAndSortedVotes.length}
                    dataType={t("proposalVotesDialog.votersDataType")}
                  />
                  <DataExport
                    data={prepareExportData}
                    filename={exportFilename}
                  />
                </div>
              </div>
            </div>
          </TooltipProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};
