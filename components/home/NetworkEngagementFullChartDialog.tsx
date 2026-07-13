import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Download, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchRanges from "../searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
import NetworkEngagementChart, {
  EngagementGranularity,
} from "./NetworkEngagementChart";
import NetworkEngagementKpiStrip from "./NetworkEngagementKpiStrip";
import useNetworkEngagement from "@/hooks/api/homePage/useNetworkEngagement";
import { useI18n } from "../../i18n/i18n";

interface NetworkEngagementFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkEngagementFullChartDialog: React.FC<
  NetworkEngagementFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<EngagementGranularity>("day");
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment().toDate()
  );

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const {
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setLastTimeUnitValue,
    setStartDate,
    setEndDate,
  } = searchRanges;

  const {
    networkEngagement,
    isNetworkEngagementLoading,
    isNetworkEngagementError,
  } = useNetworkEngagement(fromDate, toDate, granularity, isOpen);

  const chartData = useMemo(
    () =>
      [...(networkEngagement ?? [])].sort((a, b) =>
        a.period < b.period ? -1 : 1
      ),
    [networkEngagement]
  );

  const exportData = useMemo(
    () =>
      chartData.map((d) => ({
        [t("common.date")]: d.period,
        [t("networkEngagementKpiStrip.totalPosts")]: d.total_posts,
        [t("networkEngagementKpiStrip.avgVotes")]: d.avg_votes_per_post,
        [t("networkEngagementKpiStrip.avgComments")]: d.avg_comments_per_post,
        [t("networkEngagementCard.zeroVotePct")]: d.zero_vote_post_pct,
        [t("networkEngagementCard.zeroCommentPct")]: d.zero_comment_post_pct,
      })),
    [chartData, t]
  );

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const thirtyDaysAgo = moment().subtract(30, "days").toDate();
      const now = moment().toDate();
      setFromDate(thirtyDaysAgo);
      setToDate(now);
      setStartDate(thirtyDaysAgo);
      setEndDate(now);
      setGranularity("day");
    }
  }, [
    isOpen,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setStartDate,
    setEndDate,
  ]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("day");
  };

  const hasData = chartData.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("networkEngagementFullChartDialog.title")}
            subtitle={t("networkEngagementFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.networkEngagementName")
                )}.csv`}
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

          <div className="report-filters mb-5">
            <p className="report-filters-label">{t("common.filters")}</p>
            <div className="flex w-full flex-wrap items-start gap-4">
              <div className="flex w-[140px] flex-col gap-y-2">
                <Label>
                  {t("networkEngagementFullChartDialog.granularity")}
                </Label>
                <Select
                  value={granularity}
                  onValueChange={(v) =>
                    setGranularity(v as EngagementGranularity)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t("common.daily")}</SelectItem>
                    <SelectItem value="week">{t("common.weekly")}</SelectItem>
                    <SelectItem value="month">{t("common.monthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-w-[260px] flex-1 flex-col gap-y-2">
                <Label>{t("common.dateRange")}</Label>
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={handleSearch}
                    data-testid="apply-filters"
                    disabled={isSearchButtonDisabled}
                  >
                    {t("common.search")}
                  </Button>
                  <Button
                    onClick={handleFilterClear}
                    data-testid="clear-filters"
                  >
                    {t("common.clear")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!isNetworkEngagementLoading &&
            !isNetworkEngagementError &&
            hasData && (
              <NetworkEngagementKpiStrip
                data={chartData}
                granularity={granularity}
              />
            )}

          {isNetworkEngagementLoading ? (
            <div className="flex h-[45vh] items-center justify-center">
              <Loader2 className="animate-spin h-16 w-10 dark:text-white" />
            </div>
          ) : isNetworkEngagementError ? (
            <p className="text-red-500 text-sm">
              {t("common.errorLoadingData")}
            </p>
          ) : hasData ? (
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                  {t("networkEngagementFullChartDialog.depthTitle")}
                </h3>
                <div className="h-[34vh] w-full">
                  <NetworkEngagementChart
                    data={chartData}
                    granularity={granularity}
                    variant="depth"
                  />
                </div>
              </div>
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-explorer-dark-gray dark:text-text">
                  {t("networkEngagementFullChartDialog.healthTitle")}
                </h3>
                <p className="mb-1 flex items-start gap-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                  <Info size={12} className="mt-px shrink-0" />
                  <span>{t("networkEngagementCard.ghostPostingNote")}</span>
                </p>
                <div className="h-[34vh] w-full">
                  <NetworkEngagementChart
                    data={chartData}
                    granularity={granularity}
                    variant="health"
                    includeBrush
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {t("common.noDataAvailable")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkEngagementFullChartDialog;
