import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Download } from "lucide-react";
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
import NetworkContentVolumeChart from "./NetworkContentVolumeChart";
import NetworkContentVolumeKpiStrip from "./NetworkContentVolumeKpiStrip";
import useNetworkContentVolume from "@/hooks/api/homePage/useNetworkContentVolume";
import { useI18n } from "../../i18n/i18n";

type Granularity = "day" | "week" | "month";

interface NetworkContentVolumeFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkContentVolumeFullChartDialog: React.FC<
  NetworkContentVolumeFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<Granularity>("day");
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
    networkContentVolume,
    isNetworkContentVolumeLoading,
    isNetworkContentVolumeError,
  } = useNetworkContentVolume(fromDate, toDate, granularity, isOpen);

  const chartData = useMemo(
    () =>
      [...(networkContentVolume ?? [])].sort((a, b) =>
        a.period < b.period ? -1 : 1
      ),
    [networkContentVolume]
  );

  const exportData = useMemo(
    () =>
      chartData.map((d) => ({
        period: d.period,
        posts: d.posts,
        comments: d.comments,
        unique_authors: d.unique_authors,
      })),
    [chartData]
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
            title={t("networkContentVolumeFullChartDialog.title")}
            subtitle={t("networkContentVolumeFullChartDialog.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename="network_content_volume.csv"
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
                  {t("networkContentVolumeFullChartDialog.granularity")}
                </Label>
                <Select
                  value={granularity}
                  onValueChange={(v) => setGranularity(v as Granularity)}
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

          {/* KPI strip */}
          {!isNetworkContentVolumeLoading &&
            !isNetworkContentVolumeError &&
            hasData && (
              <NetworkContentVolumeKpiStrip
                data={chartData}
                granularity={granularity}
              />
            )}

          {/* Chart */}
          <div className="h-[55vh] w-full flex items-center justify-center">
            {isNetworkContentVolumeLoading ? (
              <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
            ) : isNetworkContentVolumeError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : hasData ? (
              <NetworkContentVolumeChart data={chartData} includeBrush />
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

export default NetworkContentVolumeFullChartDialog;
