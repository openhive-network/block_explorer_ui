import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import useTransactionStatistics from "@/hooks/api/homePage/useTransactionStatistics";
import TransactionStatisticsChart from "./TransactionStatisticsChart";
import moment from "moment";
import Hive from "@/types/Hive";
import { Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/i18n";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import TxStatsKpiStrip from "./TxStatsKpiStrip";
import { computeTrendPct } from "@/utils/chartUtils";

interface TransactionStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Hive.TransactionStatisticsResponse[] | undefined;
}

const TransactionStatisticsFullChartDialog: React.FC<
  TransactionStatisticsModalProps
> = ({ isOpen, onClose, data: initialData }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment().subtract(30, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment().toDate()
  );
  const [currentChartData, setCurrentChartData] = useState<
    Hive.TransactionStatisticsResponse[] | undefined
  >(initialData);

  const { searchRanges: globalSearchRanges } = useSearchesContext();
  // Create a local searchRanges instance for this dialog to avoid affecting global state
  const searchRanges = useSearchRanges();

  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("");
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;
  const {
    transactionStatistics,
    isTransactionStatisticsLoading: isChartLoading,
    isTransactionStatisticsError: isChartError,
  } = useTransactionStatistics(granularity, "asc", fromDate, toDate, false);

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setFromDate(moment().subtract(30, "days").toDate());
      setToDate(moment().toDate());
      setGranularity("daily");
    }
  }, [isOpen, setLastTimeUnitValue, setRangeSelectKey, setTimeUnitSelectKey]);

  useEffect(() => {
    setCurrentChartData(transactionStatistics);
  }, [granularity, transactionStatistics]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);

    if (transactionStatistics) {
      setCurrentChartData(transactionStatistics);
    }
  };

  const handleFilterClear = () => {
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(30);
    setFromDate(moment().subtract(30, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("daily");
    setCurrentChartData(transactionStatistics);
  };

  const kpiStats = useMemo(() => {
    const d = currentChartData;
    if (!d || d.length === 0) return null;
    const counts = d.map((item) => item.trx_count);
    const totalTxns = counts.reduce((s, v) => s + v, 0);
    const peakIdx = counts.indexOf(Math.max(...counts));
    const peakItem = d[peakIdx];
    return {
      totalTxns,
      avgPerPeriod: totalTxns / d.length,
      peakDate: moment(peakItem.date).valueOf(),
      peakValue: counts[peakIdx],
      trend: computeTrendPct(counts),
    };
  }, [currentChartData]);

  const handleGranularityChange = (value: "daily" | "monthly" | "yearly") => {
    setGranularity(value);
    if (value === "daily") {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <DialogHeader>
            <div className="mb-4">
              <DialogTitle>
                {t("transactionStatisticsFullChartDialog.title")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row items-start gap-4 mb-4 w-full">
            <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
              <Label>
                {t("transactionStatisticsFullChartDialog.granularity")}
              </Label>
              <Select
                onValueChange={(value) =>
                  handleGranularityChange(
                    value as "daily" | "monthly" | "yearly"
                  )
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
                  <SelectItem value="daily">{t("common.daily")}</SelectItem>
                  <SelectItem value="monthly">{t("common.monthly")}</SelectItem>
                  <SelectItem value="yearly">{t("common.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Block RANGE FILTER */}
            <div className="w-full flex flex-col mb-4">
              <Label>{t("common.filters")}</Label>
              <div className="m-0 p-0 gap-y-0">
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
              </div>
              <div className="w-full flex items-end justify-start mt-2 gap-2">
                <div>
                  <Button
                    onClick={handleSearch}
                    data-testid="apply-filters"
                    disabled={isSearchButtonDisabled}
                  >
                    {t("common.search")}
                  </Button>
                  {isSearchButtonDisabled && (
                    <label className="ml-2 text-gray-300 dark:text-gray-500 ">
                      {buttonLabel}
                    </label>
                  )}
                </div>
                <Button onClick={handleFilterClear} data-testid="clear-filters">
                  {t("common.clear")}
                </Button>
              </div>
            </div>
          </div>

          {kpiStats && (
            <TxStatsKpiStrip
              totalTxns={kpiStats.totalTxns}
              avgPerPeriod={kpiStats.avgPerPeriod}
              peakDate={kpiStats.peakDate}
              peakValue={kpiStats.peakValue}
              trend={kpiStats.trend}
              granularity={granularity}
            />
          )}

          <div className="h-[55vh] w-[100%] flex items-center justify-center">
            {isChartLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : (
              currentChartData && (
                <TransactionStatisticsChart
                  data={currentChartData}
                  includeBrush={true}
                  showYear={granularity === "yearly"}
                />
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionStatisticsFullChartDialog;
