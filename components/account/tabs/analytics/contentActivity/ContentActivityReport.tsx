import React, { useMemo, useState } from "react";
import moment from "moment";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";
import { spacesToUnderscores } from "@/utils/StringUtils";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import useAccountContentStats from "@/hooks/api/accountPage/useAccountContentStats";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { BaseReportProps } from "../reportRegistry";
import { useRegisterReportExport } from "../reportExports";
import ReportSearchRanges from "../ReportSearchRanges";
import ContentActivityChart from "./ContentActivityChart";
import ContentActivityKpiStrip from "./ContentActivityKpiStrip";
import {
  buildPeriods,
  buildRewardRows,
  Granularity,
  ActivityView,
} from "./contentActivityUtils";

const ContentActivityReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({
  accountName,
  liveDataEnabled,
  dynamicGlobalData,
  widgetId,
  fillHeight = true,
}) => {
  const { t, dir } = useI18n();
  const { hiveChain } = useHiveChainContext();

  const [view, setView] = useState<ActivityView>("activity");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [range, setRange] = useState<{
    from: Date | number | undefined;
    to: Date | number | undefined;
  }>(() => ({
    from: moment().subtract(180, "days").toDate(),
    to: moment().toDate(),
  }));

  const {
    accountContentStats,
    isAccountContentStatsLoading,
    isAccountContentStatsError,
  } = useAccountContentStats(
    accountName,
    granularity,
    range.from,
    range.to,
    liveDataEnabled
  );

  const { rows } = useMemo(
    () => buildPeriods(accountContentStats, granularity, range.from, range.to),
    [accountContentStats, granularity, range.from, range.to]
  );
  const rewardRows = useMemo(
    () => buildRewardRows(rows, hiveChain, dynamicGlobalData),
    [rows, hiveChain, dynamicGlobalData]
  );

  const hasActivity = rows.some(
    (r) =>
      r.posts ||
      r.comments ||
      r.votes_cast ||
      r.votes_received ||
      r.replies_received
  );
  const hasReward = rewardRows.some((r) => r.hive || r.hbd || r.hp);
  const isEmpty = view === "rewards" ? !hasReward : !hasActivity;

  const exportData = useMemo(
    () =>
      rows.map((r, i) => ({
        [t("contentActivity.period")]: r.period,
        [t("contentActivity.posts")]: r.posts,
        [t("contentActivity.comments")]: r.comments,
        [t("contentActivity.votesCast")]: r.votes_cast,
        [t("contentActivity.votesReceived")]: r.votes_received,
        [t("contentActivity.repliesReceived")]: r.replies_received,
        [t("contentActivity.rewardHive")]: rewardRows[i]?.hive ?? 0,
        [t("contentActivity.rewardHbd")]: rewardRows[i]?.hbd ?? 0,
        [t("contentActivity.rewardHp")]: rewardRows[i]?.hp ?? 0,
      })),
    [rows, rewardRows, t]
  );

  // Publish the CSV to the widget header (same generic export as other reports).
  const exportDatasets = useMemo(
    () => [
      {
        name: t("contentActivity.exportCsv"),
        filename: `${spacesToUnderscores(
          t("analyticsDashboard.contentActivityReportTitle")
        )}_${accountName}`,
        rows: exportData,
      },
    ],
    [exportData, accountName, t]
  );
  useRegisterReportExport(widgetId, exportDatasets);

  const viewOptions = [
    { value: "activity" as const, label: t("contentActivity.viewActivity") },
    { value: "rewards" as const, label: t("contentActivity.viewRewards") },
  ];
  const granularityOptions = [
    { value: "day" as const, label: t("contentActivity.granDay") },
    { value: "week" as const, label: t("contentActivity.granWeek") },
    { value: "month" as const, label: t("contentActivity.granMonth") },
  ];

  // Fill the cell (analytics tab) vs. natural height (home widget); the chart
  // needs an explicit height when the layout doesn't stretch.
  const rootClass = cn(
    "w-full flex flex-col gap-2 p-1",
    fillHeight && "h-full"
  );
  // Home-widget height: tall enough that the panels + dataZoom slider clear each
  // other once the wrapped legend eats into the area.
  const areaClass = fillHeight
    ? "flex-1 min-h-0 relative"
    : "relative h-[380px]";
  const stateClass = fillHeight
    ? "flex-1 flex items-center justify-center"
    : "h-[380px] flex items-center justify-center";

  return (
    <div className={rootClass} dir={dir}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex flex-col items-start gap-2">
          <ReportSearchRanges
            onApply={(from, to) => setRange({ from, to })}
            defaultRangeKey="180"
          />
          <SegmentedToggle
            options={granularityOptions}
            value={granularity}
            onChange={setGranularity}
            ariaLabel={t("contentActivity.granularityToggleLabel")}
            size="md"
          />
        </div>
        <SegmentedToggle
          options={viewOptions}
          value={view}
          onChange={setView}
          ariaLabel={t("contentActivity.viewToggleLabel")}
          size="md"
        />
      </div>

      {isAccountContentStatsLoading ? (
        <div className={stateClass}>
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      ) : isAccountContentStatsError ? (
        <div
          className={cn(stateClass, "text-sm text-rose-600 dark:text-rose-400")}
        >
          {t("common.errorLoadingData")}
        </div>
      ) : (
        <>
          <ContentActivityKpiStrip
            rows={rows}
            rewardRows={rewardRows}
            view={view}
          />
          <div className={areaClass}>
            {isEmpty ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                {view === "rewards"
                  ? t("contentActivity.noRewards")
                  : t("contentActivity.noActivity")}
              </div>
            ) : (
              <ContentActivityChart
                rows={rows}
                rewardRows={rewardRows}
                view={view}
                granularity={granularity}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContentActivityReport;
