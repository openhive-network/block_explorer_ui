import React, { useState, useEffect } from "react";
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
import Hive from "@/types/Hive";
import { Loader2 } from "lucide-react";

interface TransactionStatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Hive.TransactionStatisticsResponse[] | undefined;
}

const TransactionStatisticsFullChartDialog: React.FC<
  TransactionStatisticsModalProps
> = ({ isOpen, onClose, data: initialData }) => {
  const [granularity, setGranularity] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [currentChartData, setCurrentChartData] = useState<
    Hive.TransactionStatisticsResponse[] | undefined
  >(initialData);

  const { searchRanges } = useSearchesContext();

  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("");
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;
  // Fetch chart data based on filters (fromDate, toDate, granularity)
  const {
    transactionStatistics,
    isTransactionStatisticsLoading: isChartLoading,
    isTransactionStatisticsError: isChartError,
  } = useTransactionStatistics(granularity, "asc", fromDate, toDate, false);

  // Set initial data when modal opens or initialData prop changes
  useEffect(() => {
    if (isOpen && initialData) {
      setCurrentChartData(initialData);
      setLastTimeUnitValue(30);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
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

    // Update chart data after fetching from API
    if (transactionStatistics) {
      setCurrentChartData(transactionStatistics);
    }
  };

  const handleFilterClear = () => {
    setRangeSelectKey("none");
    setTimeUnitSelectKey("days");
    setLastTimeUnitValue(1000);
    setFromDate(undefined);
    setToDate(undefined);
    setGranularity("daily");
    setCurrentChartData(transactionStatistics);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] min-h-[55vh]">
        <div>
          <DialogHeader>
            <div className="mb-4">
              <DialogTitle>Transaction Statistics Chart</DialogTitle>
           
            </div>
          </DialogHeader>

          <div className="flex items-start gap-4 mb-4 w-full">
            <div className="flex flex-col gap-y-3 min-w-fit">
              <Label>Granularity</Label>
              <Select
                onValueChange={(value) => {
                  setGranularity(value as "daily" | "monthly" | "yearly");
                  setLastTimeUnitValue(undefined);
                  setRangeSelectKey("none");
                }}
                defaultValue="daily"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Block RANGE FILTER */}
            <div className="w-1/2 h-[220px] flex flex-col mb-4">
              <Label>Filters</Label>
              <div className="m-0 p-0 gap-y-0">
                <SearchRanges
                  rangesProps={searchRanges}
                  setIsSearchButtonDisabled={setIsSearchButtonDisabled}
                />
              </div>
              <div className="w-1/4 flex items-end justify-start mt-2 gap-2">
                <div>
                  <Button
                    onClick={handleSearch}
                    data-testid="apply-filters"
                    disabled={isSearchButtonDisabled}
                  >
                    Search
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
                  Clear
                </Button>
              </div>
            </div>

            {/* BUTTONS ROW (BELOW FILTERS) */}
          </div>

          <div className="h-[55%] w-[100%] flex items-center justify-center">
            {isChartLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : (
              currentChartData && (
                <TransactionStatisticsChart
                  data={currentChartData}
                  includeBrush={true}
                  showYear={granularity === "yearly"} // Pass prop to control year display
                />
              )
            )}
            {isChartError && (
              <div>Error loading chart data. Please try again.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionStatisticsFullChartDialog;