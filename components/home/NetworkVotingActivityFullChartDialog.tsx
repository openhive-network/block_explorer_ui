import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Loader2, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import DataExport from "@/components/DataExport";
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
import useNetworkVoteStats from "@/hooks/api/homePage/useNetworkVoteStats";
import VotingActivityChart from "./VotingActivityChart";
import VotingActivityKpiStrip from "./VotingActivityKpiStrip";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

interface NetworkVotingActivityFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkVotingActivityFullChartDialog: React.FC<
  NetworkVotingActivityFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { settings } = useSettings();

  const [granularity, setGranularity] = useState<"day" | "week" | "month">(
    "day"
  );
  const [fromDate, setFromDate] = useState<string | undefined>(
    moment().subtract(30, "days").format("YYYY-MM-DD")
  );
  const [toDate, setToDate] = useState<string | undefined>(
    moment().format("YYYY-MM-DD")
  );

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  useEffect(() => {
    if (!isOpen) return;
    const thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD");
    const now = moment().format("YYYY-MM-DD");
    setLastTimeUnitValue(30);
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setFromDate(thirtyDaysAgo);
    setToDate(now);
    setGranularity("day");
  }, [isOpen, setLastTimeUnitValue, setRangeSelectKey, setTimeUnitSelectKey]);

  const { voteStats, isVoteStatsLoading, isVoteStatsError } =
    useNetworkVoteStats(
      fromDate,
      toDate,
      granularity,
      settings.liveData,
      isOpen
    );

  const exportData = useMemo(
    () =>
      (voteStats ?? []).map((row) => ({
        period: row.period,
        total_votes: row.total_votes,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        unvotes: row.unvotes,
        self_votes: row.self_votes,
        unique_voters: row.unique_voters,
      })),
    [voteStats]
  );

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(
      payloadFromBlock
        ? String(payloadFromBlock)
        : payloadStartDate
          ? moment(payloadStartDate).format("YYYY-MM-DD")
          : undefined
    );
    setToDate(
      payloadToBlock
        ? String(payloadToBlock)
        : payloadEndDate
          ? moment(payloadEndDate).format("YYYY-MM-DD")
          : undefined
    );
  };

  const handleFilterClear = () => {
    searchRanges.setRangeSelectKey("lastTime");
    searchRanges.setTimeUnitSelectKey("days");
    searchRanges.setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").format("YYYY-MM-DD"));
    setToDate(moment().format("YYYY-MM-DD"));
    setGranularity("day");
  };

  const handleGranularityChange = (value: "day" | "week" | "month") => {
    setGranularity(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("votingActivityFullChartDialog.title")}
            subtitle={t("votingActivityFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename="voting_activity.csv"
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
              <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
                <Label>{t("votingActivityFullChartDialog.granularity")}</Label>
                <Select
                  onValueChange={(v) =>
                    handleGranularityChange(v as "day" | "week" | "month")
                  }
                  value={granularity}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "votingActivityFullChartDialog.selectGranularity"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t("common.daily")}</SelectItem>
                    <SelectItem value="week">{t("common.weekly")}</SelectItem>
                    <SelectItem value="month">{t("common.monthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full flex flex-col mb-4">
                <Label>{t("common.dateRange")}</Label>
                <div className="m-0 p-0 gap-y-0">
                  <SearchRanges
                    rangesProps={searchRanges}
                    setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                  />
                </div>
                <div className="w-full flex items-end justify-start mt-2 gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearchButtonDisabled}
                  >
                    {t("common.search")}
                  </Button>
                  <Button onClick={handleFilterClear}>
                    {t("common.clear")}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!isVoteStatsLoading &&
            !isVoteStatsError &&
            voteStats &&
            voteStats.length > 0 && (
              <VotingActivityKpiStrip
                data={voteStats}
                granularity={granularity}
              />
            )}

          <div className="h-[55vh] w-full flex items-center justify-center">
            {isVoteStatsLoading ? (
              <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
            ) : isVoteStatsError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : voteStats && voteStats.length > 0 ? (
              <VotingActivityChart
                data={voteStats}
                includeBrush
                showGranularity={granularity}
              />
            ) : (
              <p className="text-gray-500 text-sm">
                {t("common.noDataAvailable")}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkVotingActivityFullChartDialog;
