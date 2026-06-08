import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ArrowUp,
  ArrowDown,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Activity,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { trimAccountName } from "@/utils/StringUtils";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import useProposalVotesHistory from "@/hooks/api/proposals/useProposalVotesHistory";
import useProposalVotesHistoryChart from "@/hooks/api/proposals/useProposalVotesHistoryChart";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import { config } from "@/Config";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import CustomPagination from "@/components/CustomPagination";
import NoResult from "@/components/NoResult";
import DataCountMessage from "@/components/DataCountMessage";
import DataExport from "@/components/DataExport";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import ErrorMessage from "@/components/ErrorMessage";
import Hive from "@/types/Hive";

interface ProposalVotesHistoryDialogProps {
  proposalId: number;
  children: React.ReactNode;
}

type DayCount = {
  date: string;
  tooltipDate: string;
  approve: number;
  disapproveNeg: number;
  cumulativeNet: number;
  approveList: string[];
  disapproveList: string[];
};

const TOOLTIP_MAX_NAMES = 8;

const VoterList = ({ names }: { names: string[] }) => (
  <div className="mt-1.5 space-y-1.5">
    {names.slice(0, TOOLTIP_MAX_NAMES).map((name) => (
      <div key={name} className="flex items-center gap-1.5">
        <Image
          src={getHiveAvatarUrl(name)}
          alt="avatar"
          width={20}
          height={20}
          className="rounded-full flex-shrink-0"
        />
        <span className="text-sm truncate">{name}</span>
      </div>
    ))}
    {names.length > TOOLTIP_MAX_NAMES && (
      <p className="text-xs text-slate-400 italic">
        +{names.length - TOOLTIP_MAX_NAMES} more
      </p>
    )}
  </div>
);

// ---------- custom tooltip ----------
const VoteTooltip = ({
  active,
  payload,
  approveLabel,
  disapproveLabel,
}: {
  active?: boolean;
  payload?: any[];
  approveLabel: string;
  disapproveLabel: string;
}) => {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DayCount | undefined;
  if (!d) return null;

  return (
    <div className="data-box max-w-[260px]">
      {/* Header */}
      <p className="font-bold text-base">{d.tooltipDate}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        {t("proposalVotesHistoryDialog.netSoFar")}{" "}
        <span
          className={
            d.cumulativeNet >= 0
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-rose-600 dark:text-rose-400 font-semibold"
          }
        >
          {d.cumulativeNet > 0 ? "+" : ""}
          {d.cumulativeNet}
        </span>
      </p>

      {/* Voted section */}
      {d.approveList.length > 0 && (
        <>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {approveLabel}: +{d.approveList.length}
            {d.approveList.length > TOOLTIP_MAX_NAMES && (
              <span className="font-normal text-slate-400">
                {" "}
                (showing {TOOLTIP_MAX_NAMES})
              </span>
            )}
          </p>
          <VoterList names={d.approveList} />
        </>
      )}

      {/* Unvoted section */}
      {d.disapproveList.length > 0 && (
        <>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {disapproveLabel}: -{d.disapproveList.length}
            {d.disapproveList.length > TOOLTIP_MAX_NAMES && (
              <span className="font-normal text-slate-400">
                {" "}
                (showing {TOOLTIP_MAX_NAMES})
              </span>
            )}
          </p>
          <VoterList names={d.disapproveList} />
        </>
      )}
    </div>
  );
};

// ---------- KPI chip ----------
const KpiChip = ({
  icon: Icon,
  label,
  value,
  valueClass = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueClass?: string;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 px-4 py-3 gap-1 min-w-0">
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium truncate">
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{label}</span>
    </div>
    <span className={`text-xl font-bold tabular-nums ${valueClass}`}>
      {value}
    </span>
  </div>
);

// ---------- main component ----------
export const ProposalVotesHistoryDialog: React.FC<
  ProposalVotesHistoryDialogProps
> = ({ proposalId, children }) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  const [isOpen, setIsOpen] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  const [voterNameInput, setVoterNameInput] = useState("");
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  const isHighVolumeProposal = proposalId === 0;
  const searchRanges = useSearchRanges(
    isHighVolumeProposal ? "lastTime" : "none"
  );
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

  const [activeVoterName, setActiveVoterName] = useState<string | undefined>(
    undefined
  );
  const [activeFromDate, setActiveFromDate] = useState<Date | undefined>(() =>
    isHighVolumeProposal
      ? moment().subtract(30, "days").milliseconds(0).toDate()
      : undefined
  );
  const [activeToDate, setActiveToDate] = useState<Date | undefined>(undefined);
  const [activeFromBlock, setActiveFromBlock] = useState<number | undefined>(
    undefined
  );
  const [activeToBlock, setActiveToBlock] = useState<number | undefined>(
    undefined
  );

  const { votesHistory, isVotesHistoryLoading, isVotesHistoryError } =
    useProposalVotesHistory(
      proposalId,
      isOpen,
      pageNum,
      activeFromDate,
      activeToDate,
      activeFromBlock,
      activeToBlock,
      activeVoterName,
      direction
    );

  const { chartRawData, isChartLoading, isChartError } =
    useProposalVotesHistoryChart(
      proposalId,
      isOpen,
      activeFromDate,
      activeToDate,
      activeFromBlock,
      activeToBlock,
      activeVoterName
    );

  const handleSearch = async () => {
    const {
      payloadStartDate,
      payloadEndDate,
      payloadFromBlock,
      payloadToBlock,
    } = await searchRanges.getRangesValues();
    setActiveFromBlock(payloadFromBlock || undefined);
    setActiveToBlock(payloadToBlock || undefined);
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
    setTimeUnitSelectKey("days");
    setActiveVoterName(undefined);
    setActiveToDate(undefined);
    setActiveFromBlock(undefined);
    setActiveToBlock(undefined);
    setPageNum(1);
    if (isHighVolumeProposal) {
      setRangeSelectKey("lastTime");
      setActiveFromDate(moment().subtract(30, "days").milliseconds(0).toDate());
    } else {
      setRangeSelectKey("none");
      setActiveFromDate(undefined);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleClear();
      setDirection("desc");
      setHiddenSeries(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const approveLabel = t("proposalVotesHistoryDialog.approve");
  const disapproveLabel = t("proposalVotesHistoryDialog.disapprove");

  const kpi = useMemo(() => {
    const history = chartRawData?.votes_history ?? [];
    const voted = history.filter((v) => v.approve).length;
    const unvoted = history.filter((v) => !v.approve).length;
    return {
      total: chartRawData?.total_votes ?? 0,
      voted,
      unvoted,
      net: voted - unvoted,
    };
  }, [chartRawData]);

  const chartData = useMemo((): DayCount[] => {
    const history = chartRawData?.votes_history ?? [];
    const map = new Map<string, Omit<DayCount, "cumulativeNet">>();
    for (const v of history) {
      const dayKey = moment(v.timestamp).format("YYYY-MM-DD");
      const displayDate = moment(v.timestamp).format("MMM D");
      const tooltipDate = moment(v.timestamp).format("YYYY MMM D");
      if (!map.has(dayKey)) {
        map.set(dayKey, {
          date: displayDate,
          tooltipDate,
          approve: 0,
          disapproveNeg: 0,
          approveList: [],
          disapproveList: [],
        });
      }
      const row = map.get(dayKey)!;
      if (v.approve) {
        row.approve += 1;
        row.approveList.push(v.voter_name);
      } else {
        row.disapproveNeg -= 1;
        row.disapproveList.push(v.voter_name);
      }
    }
    let running = 0;
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => {
        running += row.approve + row.disapproveNeg;
        return { ...row, cumulativeNet: running };
      });
  }, [chartRawData]);

  const prepareExportData = () => {
    if (!votesHistory?.votes_history) return [];
    return votesHistory.votes_history.map(
      (vote: Hive.ProposalVoteHistoryEntry) => ({
        [t("proposalVotesHistoryDialog.date")]: formatAndDelocalizeTime(
          vote.timestamp
        ),
        [t("proposalVotesHistoryDialog.voter")]: vote.voter_name,
        [t("proposalVotesHistoryDialog.vote")]: vote.approve
          ? approveLabel
          : disapproveLabel,
      })
    );
  };

  const hasTableData =
    votesHistory && (votesHistory.votes_history?.length ?? 0) > 0;
  const hasChartData = chartData.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="h-[90vh] max-w-7xl flex flex-col p-4 sm:p-6 overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {t("proposalVotesHistoryDialog.title")}
            {proposalId}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex-shrink-0 space-y-1 rounded-md border border-slate-100 dark:border-slate-800 p-4">
          <Label className="text-base font-semibold">
            {t("common.filters")}
          </Label>
          <div className="flex flex-col">
            <div className="w-full md:w-1/3">
              <AutocompleteInput
                value={voterNameInput}
                onChange={setVoterNameInput}
                placeholder={t(
                  "proposalVotesHistoryDialog.voterNamePlaceholder"
                )}
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
              disabled={
                isSearchButtonDisabled ||
                isVotesHistoryLoading ||
                isChartLoading
              }
            >
              {t("common.search")}
              {(isVotesHistoryLoading || isChartLoading) && (
                <Loader2 className="ml-2 animate-spin h-4 w-4" />
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              {t("common.clear")}
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          {isChartLoading && !isChartError ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-xl border bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 animate-pulse"
              />
            ))
          ) : (
            <>
              <KpiChip
                icon={Activity}
                label={t("proposalVotesHistoryDialog.kpiTotal")}
                value={kpi.total}
              />
              <KpiChip
                icon={ThumbsUp}
                label={approveLabel}
                value={kpi.voted}
                valueClass="text-emerald-600 dark:text-emerald-400"
              />
              <KpiChip
                icon={ThumbsDown}
                label={disapproveLabel}
                value={kpi.unvoted}
                valueClass="text-rose-600 dark:text-rose-400"
              />
              <KpiChip
                icon={TrendingUp}
                label={t("proposalVotesHistoryDialog.kpiNet")}
                value={kpi.net > 0 ? `+${kpi.net}` : kpi.net}
                valueClass={
                  kpi.net >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }
              />
            </>
          )}
        </div>

        {/* Chart */}
        <div className="h-[320px] w-full flex-shrink-0">
          {isChartLoading ? (
            <div className="h-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : isChartError ? (
            <div className="flex h-full items-center justify-center">
              <ErrorMessage message={t("proposalVotesHistoryDialog.error")} />
            </div>
          ) : hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                stackOffset="sign"
                margin={{ top: 10, right: 40, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={strokeColor}
                  opacity={0.12}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: strokeColor }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: strokeColor }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#8b5cf6" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  wrapperStyle={{ zIndex: 9999 }}
                  content={(props: any) => (
                    <VoteTooltip
                      {...props}
                      approveLabel={approveLabel}
                      disapproveLabel={disapproveLabel}
                    />
                  )}
                />
                <Legend
                  onClick={(data: any) => toggleSeries(data.dataKey)}
                  formatter={(value, entry: any) => (
                    <span
                      style={{
                        cursor: "pointer",
                        opacity: hiddenSeries.has(entry.dataKey) ? 0.35 : 1,
                        textDecoration: hiddenSeries.has(entry.dataKey)
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
                <Brush
                  dataKey="date"
                  height={24}
                  travellerWidth={8}
                  stroke={theme === "dark" ? "#475569" : "#cbd5e1"}
                  fill={theme === "dark" ? "#1e293b" : "#f8fafc"}
                  tickFormatter={(v) => v}
                />
                <ReferenceLine
                  yAxisId="left"
                  y={0}
                  stroke={strokeColor}
                  opacity={0.35}
                />
                <Bar
                  yAxisId="left"
                  dataKey="approve"
                  stackId="a"
                  name={approveLabel}
                  fill="#22c55e"
                  radius={[3, 3, 0, 0]}
                  hide={hiddenSeries.has("approve")}
                />
                <Bar
                  yAxisId="left"
                  dataKey="disapproveNeg"
                  stackId="a"
                  name={disapproveLabel}
                  fill="#ef4444"
                  radius={[0, 0, 3, 3]}
                  hide={hiddenSeries.has("disapproveNeg")}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeNet"
                  name={t("proposalVotesHistoryDialog.kpiNet")}
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  hide={hiddenSeries.has("cumulativeNet")}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Table */}
        {isVotesHistoryError ? (
          <div className="flex h-40 items-center justify-center">
            <ErrorMessage message={t("proposalVotesHistoryDialog.error")} />
          </div>
        ) : isVotesHistoryLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : hasTableData ? (
          <div className="mt-6">
            <CustomPagination
              currentPage={pageNum}
              onPageChange={setPageNum}
              pageSize={config.standardPaginationSize}
              totalCount={votesHistory.total_votes}
              className="rounded"
              isMirrored={false}
            />
            <div
              className={cn("table-toolbar", {
                "justify-between": !!votesHistory.total_votes,
              })}
            >
              <DataCountMessage
                count={votesHistory.total_votes}
                dataType={t("proposalVotesHistoryDialog.votes")}
              />
              <DataExport
                data={prepareExportData()}
                filename={t("proposalVotesHistoryDialog.exportFilename", {
                  proposalId,
                })}
              />
            </div>
            <div className="text-text w-full rounded bg-theme overflow-auto">
              <Table enableMobileScrollArrows isDialog className="min-w-max">
                <TableHeader>
                  <TableRow rowVariant="header">
                    <TableHead
                      stickyLeft
                      className="cursor-pointer select-none"
                      onClick={() => {
                        setDirection((d) => (d === "desc" ? "asc" : "desc"));
                        setPageNum(1);
                      }}
                    >
                      <span className="flex items-center gap-1">
                        {t("proposalVotesHistoryDialog.date")}
                        {direction === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUp className="h-3 w-3" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead>
                      {t("proposalVotesHistoryDialog.voter")}
                    </TableHead>
                    <TableHead>
                      {t("proposalVotesHistoryDialog.vote")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votesHistory.votes_history.map(
                    (vote: Hive.ProposalVoteHistoryEntry) => (
                      <TableRow key={`${vote.voter_name}-${vote.timestamp}`}>
                        <TableCell stickyLeft>
                          {formatAndDelocalizeTime(vote.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Image
                              src={getHiveAvatarUrl(vote.voter_name)}
                              alt={`${vote.voter_name}'s profile`}
                              width={30}
                              height={30}
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
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : !isChartLoading ? (
          <div className="flex h-40 items-center justify-center">
            <NoResult
              descriptionKey={t("proposalVotesHistoryDialog.noResults")}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
