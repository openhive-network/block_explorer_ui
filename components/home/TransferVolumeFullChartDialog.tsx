import React, { useState, useEffect } from "react";
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
import Hive from "@/types/Hive";
import { Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/i18n";

interface TransferVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Hive.TransferStatisticsResponse[] | undefined;
}

const TransferVolumeFullChartDialog: React.FC<
  TransferVolumeModalProps
> = ({ isOpen, onClose, data: initialData }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [currentChartData, setCurrentChartData] = useState<
    Hive.TransferStatisticsResponse[] | undefined
  >(initialData);

  const { searchRanges } = useSearchesContext();

  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("");
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  // Fetch chart data based on filters (fromDate, toDate, granularity)
  const {
    transferStatistics,
    isTransferStatisticsLoading: isChartLoading,
    isTransferStatisticsError: isChartError,
  } = useTransferStatistics(granularity, "HIVE", "asc", fromDate, toDate, isOpen);

  // Set initial data when modal opens or initialData prop changes
  useEffect(() => {
    if (isOpen && initialData) {
      setCurrentChartData(initialData);
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");

      const date = new Date();
      date.setDate(date.getDate() - 30);
      setFromDate(date);
    }
  }, [
    isOpen,
    initialData,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
  ]);

  useEffect(() => {
    // Fetch new data when granularity changes
    setCurrentChartData(transferStatistics);
  }, [granularity, transferStatistics]);

  const handleSearch = async () => {
    const {
      payloadFromBlock,
      payloadToBlock,
      payloadStartDate,
      payloadEndDate,
    } = await searchRanges.getRangesValues();
    setFromDate(payloadFromBlock || payloadStartDate);
    setToDate(payloadToBlock || payloadEndDate);

    // Update chart data after fetching from API
    if (transferStatistics) {
      setCurrentChartData(transferStatistics);
    }
  };

  const handleFilterClear = () => {
    setRangeSelectKey("none");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(1000);
    setFromDate(undefined);
    setToDate(undefined);
    setGranularity("daily");
    setCurrentChartData(transferStatistics);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[90vw] ">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden scrollableContainer">
          <DialogHeader>
            <div className="mb-4">
              <DialogTitle>{t("transferVolumeFullChartDialog.historyTitle")}</DialogTitle>
           
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row items-start gap-4 mb-4 w-full">
            <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
              <Label>{t("transactionStatisticsFullChartDialog.granularity")}</Label>
              <Select
                onValueChange={(value) => {
                  setGranularity(value as "daily" | "monthly" | "yearly");
                  setLastTimeUnitValue(undefined);
                  setRangeSelectKey("none");
                }}
                defaultValue="daily"
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("transactionStatisticsFullChartDialog.selectGranularity")} />
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
                <Button
                  onClick={handleFilterClear}
                  data-testid="clear-filters"
                >
                  {t("common.clear")}
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[60vh] w-[100%] flex items-center justify-center">
            {isChartLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : (
              currentChartData && (
                <TransferVolumeChart
                  data={currentChartData}
                  includeBrush={true}
                  showYear={granularity === "yearly"} // Pass prop to control year display
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
