import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TimeAgo from "timeago-react";
import { Download, Loader2 } from "lucide-react";

import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import HiveAvatar from "@/components/ui/HiveAvatar";
import DataExport from "@/components/DataExport";
import WitnessMissedBlocksChart from "./WitnessMissedBlocksChart";
import useWitnessMissedBlocks from "@/hooks/api/homePage/useWitnessMissedBlocks";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import Hive from "@/types/Hive";
import { spacesToUnderscores } from "@/utils/StringUtils";
import WitnessMissedBlocksKpiStrip from "./WitnessMissedBlocksKpiStrip";
import {
  completedTrend,
  currentPeriodStart,
  formatMissRate,
  RANGE_DAYS,
  rangeToWindow,
  toMissedBlocksRows,
  toMissedBlocksTrend,
  type MissedBlocksGranularity,
  type MissedBlocksRange,
} from "@/utils/witnessMissedBlocks";
import { useI18n } from "@/i18n/i18n";

// The API caps limit_count at 1000.
const ROW_OPTIONS = [25, 100, 1000];
const ALL_ROWS = 1000;

// Matches the witness schedule widget so both share one cached request.
const WITNESS_RANK_LIMIT = 100;

const PRESETS: MissedBlocksRange[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "180d",
  "1y",
];

const PRESET_LABEL_KEYS: Record<MissedBlocksRange, string> = {
  today: "witnessMissedBlocksCard.today",
  "7d": "witnessMissedBlocksCard.last7d",
  "30d": "witnessMissedBlocksCard.last30d",
  "90d": "witnessMissedBlocksCard.last90d",
  "180d": "witnessMissedBlocksCard.last180d",
  "1y": "witnessMissedBlocksCard.last1y",
};

const LEADERBOARD_TITLE_KEYS: Record<Hive.WitnessMissedBlocksOrder, string> = {
  missed: "witnessMissedBlocksCard.leaderboardTitle",
  rate: "witnessMissedBlocksCard.leaderboardTitleRate",
  last_missed: "witnessMissedBlocksCard.leaderboardTitleLastMissed",
};

interface WitnessMissedBlocksFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRange?: MissedBlocksRange;
}

const WitnessMissedBlocksFullChartDialog: React.FC<
  WitnessMissedBlocksFullChartDialogProps
> = ({ isOpen, onClose, initialRange = "today" }) => {
  const { t, locale } = useI18n();

  const [fromDate, setFromDate] = useState<Date | number | undefined>();
  const [toDate, setToDate] = useState<Date | number | undefined>();
  const [witness, setWitness] = useState<string>("");
  const [appliedWitness, setAppliedWitness] = useState<string>("");
  const [granularity, setGranularity] =
    useState<MissedBlocksGranularity>("day");
  const [orderBy, setOrderBy] =
    useState<Hive.WitnessMissedBlocksOrder>("missed");
  const [limitCount, setLimitCount] = useState<number>(100);
  // "" = custom range, no preset selected.
  const [preset, setPreset] = useState<MissedBlocksRange | "">(initialRange);
  // Queries wait for the reset, so a reopen skips the stale filters.
  const [isReady, setIsReady] = useState(false);

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const applyWindow = (range: MissedBlocksRange) => {
    const { fromDate: from, toDate: to } = rangeToWindow(range);
    // The picker has no "today"; 1 day is the closest.
    const days = Math.max(RANGE_DAYS[range] ?? 1, 1);
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(days);
    setStartDate(from);
    setEndDate(to);
    setFromDate(from);
    setToDate(to);
  };

  const choosePreset = (range: MissedBlocksRange) => {
    setPreset(range);
    applyWindow(range);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      return;
    }
    applyWindow(initialRange);
    setPreset(initialRange);
    setWitness("");
    setAppliedWitness("");
    setGranularity("day");
    setOrderBy("missed");
    setLimitCount(100);
    setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialRange]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock ?? (payloadStartDate as Date | undefined));
    setToDate(payloadToBlock ?? (payloadEndDate as Date | undefined));
    setAppliedWitness(witness.trim());
    setPreset("");
  };

  const handleClear = () => {
    applyWindow(initialRange);
    setPreset(initialRange);
    setWitness("");
    setAppliedWitness("");
    setGranularity("day");
    setOrderBy("missed");
    setLimitCount(100);
  };

  const {
    missedBlocksData,
    isMissedBlocksLoading,
    isMissedBlocksError,
    isMissedBlocksPreviousData: isLeaderboardStale,
  } = useWitnessMissedBlocks({
    fromDate,
    toDate,
    witness: appliedWitness || undefined,
    orderBy,
    limitCount,
    enabled: isOpen && isReady,
  });

  const {
    missedBlocksData: trendData,
    isMissedBlocksLoading: isTrendLoading,
    isMissedBlocksError: isTrendError,
    isMissedBlocksPreviousData: isTrendStale,
  } = useWitnessMissedBlocks({
    fromDate,
    toDate,
    witness: appliedWitness || undefined,
    granularity,
    enabled: isOpen && isReady,
  });

  const { witnessesData } = useWitnesses(
    WITNESS_RANK_LIMIT,
    "rank",
    "asc",
    isOpen
  );

  const rows = useMemo(
    () => toMissedBlocksRows(missedBlocksData, witnessesData?.witnesses),
    [missedBlocksData, witnessesData]
  );
  const trend = useMemo(() => toMissedBlocksTrend(trendData), [trendData]);
  const provisionalFrom = currentPeriodStart(granularity);
  const hasProvisional =
    trend.length > 0 && trend[trend.length - 1].period >= provisionalFrom;
  const kpiTrend = useMemo(
    () => completedTrend(trend, provisionalFrom),
    [trend, provisionalFrom]
  );

  const chartDateFormat =
    granularity === "month"
      ? "MMM YYYY"
      : granularity === "week"
        ? "ll"
        : "MMM D";

  // On phones the badge and produced count move under the name to leave it room.
  const activeBadge = (
    <span className="rounded-full bg-emerald-500/15 px-1.5 text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
      {t("witnessMissedBlocksCard.active")}
    </span>
  );
  const produced = (row: { producedCount: number }) =>
    t("witnessMissedBlocksCard.producedCount", {
      produced: row.producedCount.toLocaleString(locale),
    });

  const exportData = useMemo(
    () =>
      rows.map((row) => ({
        [t("witnessMissedBlocksCard.witness")]: row.producer,
        [t("witnessMissedBlocksCard.status")]: row.isActive
          ? t("witnessMissedBlocksCard.active")
          : t("witnessMissedBlocksCard.backup"),
        [t("witnessMissedBlocksCard.missedBlocks")]:
          row.missedCount.toLocaleString(locale),
        [t("witnessMissedBlocksCard.producedBlocks")]:
          row.producedCount.toLocaleString(locale),
        [t("witnessMissedBlocksCard.missRate")]: formatMissRate(
          row.rate,
          locale
        ),
        [t("witnessMissedBlocksCard.lastMissedBlock")]:
          row.lastMissedBlock > 0
            ? row.lastMissedBlock.toLocaleString(locale)
            : "",
        [t("witnessMissedBlocksCard.lastMissed")]: formatAndDelocalizeTime(
          row.lastMissedAt
        ),
      })),
    [rows, t, locale]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("witnessMissedBlocksCard.title")}
            subtitle={t("witnessMissedBlocksFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(t("widgets.witnessMissedBlocksName"))}.csv`}
                skipColumnSelection
              >
                <button
                  type="button"
                  title={t("common.export")}
                  className="report-export-btn"
                >
                  <Download className="h-4 w-4" />
                  {t("common.export")}
                </button>
              </DataExport>
            }
          />

          <div className="report-filters mb-4">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-y-2">
                  <Label>{t("witnessMissedBlocksCard.witness")}</Label>
                  <AutocompleteInput
                    value={witness}
                    onChange={setWitness}
                    placeholder={t("witnessMissedBlocksCard.anyWitness")}
                    inputType="account_name"
                    className="w-full bg-theme border-0 border-b-2"
                  />
                </div>

                <div className="flex w-[150px] flex-col gap-y-2">
                  <Label>{t("witnessMissedBlocksCard.granularity")}</Label>
                  <Select
                    value={granularity}
                    onValueChange={(v) =>
                      setGranularity(v as MissedBlocksGranularity)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">{t("common.daily")}</SelectItem>
                      <SelectItem value="week">{t("common.weekly")}</SelectItem>
                      <SelectItem value="month">
                        {t("common.monthly")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={handleSearch}
                data-testid="apply-filters"
                disabled={isSearchButtonDisabled}
              >
                {t("common.search")}
              </Button>
              <Button onClick={handleClear} data-testid="clear-filters">
                {t("common.clear")}
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("witnessMissedBlocksCard.quickRange")}:
              </span>
              <SegmentedToggle<MissedBlocksRange | "">
                options={PRESETS.map((value) => ({
                  value,
                  label: t(PRESET_LABEL_KEYS[value]),
                }))}
                value={preset}
                onChange={(v) => v && choosePreset(v as MissedBlocksRange)}
                ariaLabel={t("witnessMissedBlocksCard.quickRange")}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("witnessMissedBlocksCard.orderBy")}:
              </span>
              <SegmentedToggle<Hive.WitnessMissedBlocksOrder>
                options={[
                  {
                    value: "missed",
                    label: t("witnessMissedBlocksCard.orderMissed"),
                  },
                  {
                    value: "rate",
                    label: t("witnessMissedBlocksCard.orderRate"),
                  },
                  {
                    value: "last_missed",
                    label: t("witnessMissedBlocksCard.orderLastMissed"),
                  },
                ]}
                value={orderBy}
                onChange={setOrderBy}
                ariaLabel={t("witnessMissedBlocksCard.orderBy")}
                className="min-w-0 shrink"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="me-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                {t("witnessMissedBlocksCard.rows")}:
              </span>
              <SegmentedToggle
                options={ROW_OPTIONS.map((option) => ({
                  value: String(option),
                  label:
                    option === ALL_ROWS
                      ? t("witnessMissedBlocksCard.allRows")
                      : option.toLocaleString(locale),
                }))}
                value={String(limitCount)}
                onChange={(v) => setLimitCount(Number(v))}
                ariaLabel={t("witnessMissedBlocksCard.rows")}
              />
            </div>
          </div>

          {orderBy === "rate" && (
            <p className="mb-3 text-[11px] text-amber-500">
              {t("witnessMissedBlocksCard.rateOrderNote")}
            </p>
          )}

          {!isTrendLoading && !isTrendError && trend.length > 0 && (
            <div
              className={`mb-4 transition-opacity ${isTrendStale || isLeaderboardStale ? "opacity-40" : ""}`}
            >
              <WitnessMissedBlocksKpiStrip rows={rows} trend={kpiTrend} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="flex min-w-0 flex-col">
              <h3 className="mb-2 text-sm font-semibold">
                {appliedWitness
                  ? t("witnessMissedBlocksCard.chartTitleWitness", {
                      witness: appliedWitness,
                    })
                  : t("witnessMissedBlocksCard.chartTitleChain")}
                {isTrendStale && (
                  <Loader2 className="ms-2 inline h-3.5 w-3.5 animate-spin" />
                )}
              </h3>
              <div
                className={`h-[46vh] w-full transition-opacity ${isTrendStale ? "opacity-40" : ""}`}
                aria-busy={isTrendStale}
              >
                {isTrendLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
                  </div>
                ) : isTrendError ? (
                  <p className="flex h-full items-center justify-center text-sm text-red-500">
                    {t("common.errorLoadingData")}
                  </p>
                ) : trend.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-gray-500">
                    {t("witnessMissedBlocksCard.noMisses")}
                  </p>
                ) : (
                  <WitnessMissedBlocksChart
                    data={trend}
                    dateFormat={chartDateFormat}
                    provisionalFrom={
                      hasProvisional ? provisionalFrom : undefined
                    }
                  />
                )}
              </div>
              {hasProvisional && !isTrendLoading && !isTrendError && (
                <p className="mt-1 text-[10px] text-gray-400">
                  {t(
                    kpiTrend.length < trend.length
                      ? "witnessMissedBlocksCard.partialNote"
                      : "witnessMissedBlocksCard.partialNoteOnly"
                  )}
                </p>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {t(LEADERBOARD_TITLE_KEYS[orderBy])}
                  {isLeaderboardStale && (
                    <Loader2 className="ms-2 inline h-3.5 w-3.5 animate-spin" />
                  )}
                </h3>
                {rows.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {t("witnessMissedBlocksCard.showingRows", {
                      count: rows.length.toLocaleString(locale),
                    })}
                  </span>
                )}
              </div>

              <div
                className={`h-[46vh] overflow-y-auto pe-1 scrollableContainer transition-opacity ${isLeaderboardStale ? "opacity-40" : ""}`}
                aria-busy={isLeaderboardStale}
              >
                {isMissedBlocksLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : isMissedBlocksError ? (
                  <p className="py-6 text-sm text-red-500">
                    {t("common.errorLoadingData")}
                  </p>
                ) : rows.length === 0 ? (
                  <p className="py-6 text-sm text-gray-500">
                    {appliedWitness
                      ? t("witnessMissedBlocksCard.noMissesForWitness", {
                          witness: appliedWitness,
                        })
                      : t("witnessMissedBlocksCard.noMisses")}
                  </p>
                ) : (
                  <div className="flex flex-col divide-y divide-navbar-border">
                    {rows.map((row) => (
                      <div
                        key={row.producer}
                        className="flex items-center gap-2 py-1.5"
                      >
                        <HiveAvatar
                          accountName={row.producer}
                          size={22}
                          alt={row.producer}
                          className="shrink-0 rounded-full"
                        />
                        <div className="flex min-w-0 flex-grow flex-col">
                          <Link
                            href={"/@" + row.producer}
                            className="truncate text-link text-sm"
                          >
                            {row.producer}
                          </Link>
                          <span className="flex flex-wrap items-center gap-x-1 text-[10px] leading-tight text-gray-500">
                            {row.isActive && (
                              <span className="sm:hidden">{activeBadge}</span>
                            )}
                            {row.lastMissedBlock > 0 && (
                              <>
                                {t("witnessMissedBlocksCard.lastMissed")}
                                <Link
                                  href={"/block/" + row.lastMissedBlock}
                                  className="text-link tabular-nums"
                                >
                                  {row.lastMissedBlock.toLocaleString(locale)}
                                </Link>
                                <TimeAgo
                                  locale={locale}
                                  datetime={
                                    new Date(
                                      formatAndDelocalizeTime(row.lastMissedAt)
                                    )
                                  }
                                />
                              </>
                            )}
                            <span className="tabular-nums sm:hidden">
                              · {produced(row)}
                            </span>
                          </span>
                        </div>
                        {row.isActive && (
                          <span className="hidden shrink-0 sm:inline">
                            {activeBadge}
                          </span>
                        )}
                        <span className="hidden w-20 shrink-0 text-end text-[10px] tabular-nums text-gray-500 sm:inline">
                          {produced(row)}
                        </span>
                        <span className="w-14 shrink-0 text-end text-sm font-semibold tabular-nums">
                          {row.missedCount.toLocaleString(locale)}
                        </span>
                        <span className="w-14 shrink-0 text-end text-xs tabular-nums text-gray-500">
                          {formatMissRate(row.rate, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WitnessMissedBlocksFullChartDialog;
