import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SearchRanges from "../searchRanges/SearchRanges";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { Button } from "../ui/button";
import useTransferStatistics from "@/hooks/api/homePage/useTransferStatistics";
import TransferVolumeChart from "./TransferVolumeChart";
import TransferStatsKpiStrip from "./TransferStatsKpiStrip";
import Hive from "@/types/Hive";
import { Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import { cn } from "@/lib/utils";
import { computeTrendPct } from "@/utils/chartUtils";

type CoinType = "HIVE" | "HBD";
type Granularity = "hourly" | "daily" | "monthly" | "yearly";

const naiToDecimal = (a: Hive.Amount) =>
  parseFloat(a.amount) / Math.pow(10, a.precision);

const coinOptions: { key: CoinType; label: string }[] = [
  { key: "HIVE", label: "HIVE" },
  { key: "HBD", label: "HBD" },
];

interface TransferVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Hive.TransferStatisticsResponse[] | undefined;
  initialCoinType?: CoinType;
}

const TransferVolumeFullChartDialog: React.FC<TransferVolumeModalProps> = ({
  isOpen,
  onClose,
  data: initialData,
  initialCoinType = "HIVE",
}) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [coinType, setCoinType] = useState<CoinType>(initialCoinType);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [currentChartData, setCurrentChartData] = useState<
    Hive.TransferStatisticsResponse[] | undefined
  >(initialData);

  const { searchRanges } = useSearchesContext();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  const {
    transferStatistics,
    isTransferStatisticsLoading: isChartLoading,
    isTransferStatisticsError: isChartError,
  } = useTransferStatistics(
    granularity,
    coinType,
    "asc",
    fromDate,
    toDate,
    isOpen
  );

  const kpiStats = useMemo(() => {
    const d = currentChartData;
    if (!d || d.length === 0) return null;

    const volumes = d.map((item) => naiToDecimal(item.total_transfer_amount));
    const totalVolume = volumes.reduce((s, v) => s + v, 0);
    const totalTxns = d.reduce((s, item) => s + item.transfer_count, 0);
    const avgPerPeriod = totalVolume / d.length;

    const peakIdx = volumes.indexOf(
      volumes.reduce((m, v) => (v > m ? v : m), -Infinity)
    );
    const peakItem = d[peakIdx];
    const peakDate = moment(peakItem.date).valueOf();
    const peakValue = volumes[peakIdx];

    const trend = computeTrendPct(volumes);

    return { totalVolume, totalTxns, avgPerPeriod, peakDate, peakValue, trend };
  }, [currentChartData]);

  // Sync coin type when card selection changes and dialog reopens
  useEffect(() => {
    if (isOpen) setCoinType(initialCoinType);
  }, [isOpen, initialCoinType]);

  useEffect(() => {
    if (isOpen && initialData) {
      setCurrentChartData(initialData);
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setFromDate(moment().subtract(30, "days").toDate());
      setToDate(moment().toDate());
    }
  }, [
    isOpen,
    initialData,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
  ]);

  useEffect(() => {
    setCurrentChartData(transferStatistics);
  }, [granularity, coinType, transferStatistics]);

  const handleGranularityChange = (value: Granularity) => {
    setGranularity(value);
    if (value === "hourly") {
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setLastTimeUnitValue(7);
      setFromDate(moment().subtract(7, "days").toDate());
      setToDate(moment().toDate());
    } else if (value === "daily") {
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setLastTimeUnitValue(30);
      setFromDate(moment().subtract(30, "days").toDate());
      setToDate(moment().toDate());
    } else {
      setRangeSelectKey("none");
      setLastTimeUnitValue(undefined);
      setFromDate(undefined);
      setToDate(undefined);
    }
  };

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);
    if (transferStatistics) setCurrentChartData(transferStatistics);
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("daily");
    setCurrentChartData(transferStatistics);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[90vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <DialogHeader>
            <div className="mb-4 flex items-center justify-between gap-3 pr-6 flex-wrap">
              <DialogTitle>
                {t("transferVolumeFullChartDialog.historyTitle")}
              </DialogTitle>
              <div
                className="inline-flex items-stretch rounded-full border border-navbar-border overflow-hidden text-xs"
                role="group"
                aria-label="HIVE or HBD"
              >
                {coinOptions.map((opt, idx) => {
                  const isActive = coinType === opt.key;
                  const isFirst = idx === 0;
                  const isLast = idx === coinOptions.length - 1;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setCoinType(opt.key)}
                      aria-pressed={isActive}
                      className={cn(
                        "font-medium transition-colors px-3 py-1",
                        !isLast && "border-r border-navbar-border",
                        isFirst && "rounded-l-full",
                        isLast && "rounded-r-full",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-theme hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row items-start gap-4 mb-4 w-full">
            <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
              <Label>
                {t("transactionStatisticsFullChartDialog.granularity")}
              </Label>
              <Select
                onValueChange={(value) =>
                  handleGranularityChange(value as Granularity)
                }
                value={granularity}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "transactionStatisticsFullChartDialog.selectGranularity"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">{t("common.hourly")}</SelectItem>
                  <SelectItem value="daily">{t("common.daily")}</SelectItem>
                  <SelectItem value="monthly">{t("common.monthly")}</SelectItem>
                  <SelectItem value="yearly">{t("common.yearly")}</SelectItem>
                </SelectContent>
              </Select>
              {granularity === "hourly" && (
                <p className="text-[10px] text-amber-500">
                  {t("transferVolumeFullChartDialog.hourlyWarning") ||
                    "Hourly view works best within 30 days."}
                </p>
              )}
            </div>

            <div className="w-full flex flex-col mb-4">
              <Label>{t("common.filters")}</Label>
              <div className="m-0 p-0 gap-y-0">
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
              </div>
              <div className="w-full flex items-end justify-start mt-2 gap-2">
                <Button
                  onClick={handleSearch}
                  data-testid="apply-filters"
                  disabled={isSearchButtonDisabled}
                >
                  {t("common.search")}
                </Button>
                <Button onClick={handleFilterClear} data-testid="clear-filters">
                  {t("common.clear")}
                </Button>
              </div>
            </div>
          </div>

          {kpiStats && (
            <TransferStatsKpiStrip
              totalVolume={kpiStats.totalVolume}
              totalTxns={kpiStats.totalTxns}
              avgPerPeriod={kpiStats.avgPerPeriod}
              peakDate={kpiStats.peakDate}
              peakValue={kpiStats.peakValue}
              trend={kpiStats.trend}
              coinType={coinType}
              granularity={granularity}
            />
          )}

          <div className="h-[50vh] w-full flex items-center justify-center">
            {isChartLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : isChartError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : (
              currentChartData && (
                <TransferVolumeChart
                  data={currentChartData}
                  coinType={coinType}
                  includeBrush={true}
                  granularity={granularity}
                  peakDate={kpiStats?.peakDate}
                />
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferVolumeFullChartDialog;
