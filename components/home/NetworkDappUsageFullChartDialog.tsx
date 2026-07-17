import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import { Loader2, Download, PieChart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import SearchRanges from "../searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import DataExport from "@/components/DataExport";
import NetworkDappUsageDonut from "./NetworkDappUsageDonut";
import NetworkDappUsageBar from "./NetworkDappUsageBar";
import NetworkDappUsageKpiStrip from "./NetworkDappUsageKpiStrip";
import useNetworkDappUsage from "@/hooks/api/homePage/useNetworkDappUsage";
import { useI18n } from "../../i18n/i18n";
import { spacesToUnderscores } from "@/utils/StringUtils";
import {
  DappMetric,
  dappsForCategory,
  hasUniqueAccounts,
} from "./networkDappUsageUtils";

interface NetworkDappUsageFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkDappUsageFullChartDialog: React.FC<
  NetworkDappUsageFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t, dir } = useI18n();

  const [metric, setMetric] = useState<DappMetric>("ops");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment.utc().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment.utc().toDate()
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

  const { dappUsage, isDappUsageLoading, isDappUsageError } =
    useNetworkDappUsage(fromDate, toDate, isOpen);

  const usersAvailable = hasUniqueAccounts(dappUsage);
  const effectiveMetric: DappMetric =
    metric === "users" && !usersAvailable ? "ops" : metric;

  useEffect(() => {
    if (!dappUsage) return;
    const exists =
      selectedCategory &&
      dappUsage.categories.some((c) => c.category === selectedCategory);
    if (!exists) setSelectedCategory(dappUsage.top_category ?? null);
  }, [dappUsage, selectedCategory]);

  const dapps = useMemo(
    () => dappsForCategory(dappUsage, selectedCategory, effectiveMetric),
    [dappUsage, selectedCategory, effectiveMetric]
  );

  const exportData = useMemo(
    () =>
      (dappUsage?.dapps ?? []).map((d) => ({
        [t("networkDappUsage.colCategory")]: d.category,
        [t("networkDappUsage.colDapp")]: d.app_name,
        [t("networkDappUsage.colCustomJsonId")]: d.custom_json_id,
        [t("networkDappUsage.colOps")]: d.op_count,
        [t("networkDappUsage.colRc")]: d.rc_estimated,
        [t("networkDappUsage.colUsers")]: d.unique_accounts ?? "",
      })),
    [dappUsage, t]
  );

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      const thirtyDaysAgo = moment.utc().subtract(30, "days").toDate();
      const now = moment.utc().toDate();
      setFromDate(thirtyDaysAgo);
      setToDate(now);
      setStartDate(thirtyDaysAgo);
      setEndDate(now);
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
    const { payloadStartDate, payloadEndDate } =
      await searchRanges.getRangesValues();
    // Date-based report: block-mode tabs resolve to no dates → fall back to 30d.
    setFromDate(payloadStartDate ?? moment.utc().subtract(30, "days").toDate());
    setToDate(payloadEndDate ?? moment.utc().toDate());
  };

  const handleFilterClear = () => {
    const thirtyDaysAgo = moment.utc().subtract(30, "days").toDate();
    const now = moment.utc().toDate();
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(thirtyDaysAgo);
    setToDate(now);
    setStartDate(thirtyDaysAgo);
    setEndDate(now);
  };

  const metricOptions: { value: DappMetric; label: string }[] = [
    { value: "ops", label: t("networkDappUsage.metricOps") },
    { value: "rc", label: t("networkDappUsage.metricRc") },
    ...(usersAvailable
      ? [{ value: "users" as const, label: t("networkDappUsage.metricUsers") }]
      : []),
  ];

  const hasData =
    !!dappUsage && dappUsage.total_ops > 0 && dappUsage.categories.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div
          className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer"
          dir={dir}
        >
          <ReportDialogHeader
            title={t("networkDappUsage.dialogTitle")}
            subtitle={t("networkDappUsage.dialogSubtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(t("widgets.networkDappUsageName"))}.csv`}
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
              <div className="flex flex-col gap-y-2">
                <Label>{t("networkDappUsage.metricLabel")}</Label>
                <SegmentedToggle<DappMetric>
                  options={metricOptions}
                  value={effectiveMetric}
                  onChange={setMetric}
                  size="md"
                  ariaLabel={t("networkDappUsage.metricLabel")}
                />
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

          {!isDappUsageLoading && !isDappUsageError && hasData && dappUsage && (
            <NetworkDappUsageKpiStrip data={dappUsage} />
          )}

          <div className="h-[55vh] w-full">
            {isDappUsageLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
              </div>
            ) : isDappUsageError ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-red-500 text-sm">
                  {t("common.errorLoadingData")}
                </p>
              </div>
            ) : !hasData || !dappUsage ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                <PieChart className="h-8 w-8 opacity-50" />
                <p className="text-sm">{t("networkDappUsage.emptyState")}</p>
              </div>
            ) : (
              <div className="grid h-full grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex min-h-0 flex-col rounded-lg border border-gray-200 bg-theme p-2 dark:border-gray-700">
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("networkDappUsage.categoryBreakdown")}
                  </h3>
                  <div className="min-h-0 flex-1">
                    <NetworkDappUsageDonut
                      categories={dappUsage.categories}
                      metric={effectiveMetric}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />
                  </div>
                </div>
                <div className="flex min-h-0 flex-col rounded-lg border border-gray-200 bg-theme p-2 dark:border-gray-700">
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {selectedCategory
                      ? t("networkDappUsage.dappsInCategory", {
                          category: selectedCategory,
                        })
                      : t("networkDappUsage.dappBreakdown")}
                  </h3>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {dapps.length ? (
                      <NetworkDappUsageBar
                        dapps={dapps}
                        category={selectedCategory as string}
                        metric={effectiveMetric}
                      />
                    ) : (
                      <p className="p-4 text-sm text-gray-500">
                        {t("common.noDataAvailable")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkDappUsageFullChartDialog;
