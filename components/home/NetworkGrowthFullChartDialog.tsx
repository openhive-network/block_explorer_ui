import React, { useState, useEffect } from "react";
import moment from "moment";
import { Loader2 } from "lucide-react";
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
import { Button } from "../ui/button";
import useTotalWalletAddresses from "@/hooks/api/homePage/useTotalWalletAddresses";
import NetworkGrowthChart from "./NetworkGrowthChart";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { useI18n } from "../../i18n/i18n";

interface NetworkGrowthFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkGrowthFullChartDialog: React.FC<
  NetworkGrowthFullChartDialogProps
> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  const [granularity, setGranularity] = useState<
    "daily" | "monthly" | "yearly"
  >("daily");
  const [fromDate, setFromDate] = useState<Date | number | undefined>(
    moment().subtract(90, "days").toDate()
  );
  const [toDate, setToDate] = useState<Date | number | undefined>(
    moment().toDate()
  );

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  const {
    walletStats,
    isWalletStatsLoading: isChartLoading,
    isWalletStatsError: isChartError,
  } = useTotalWalletAddresses(granularity, "asc", fromDate, toDate, false);

  useEffect(() => {
    if (isOpen) {
      setLastTimeUnitValue(90);
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setFromDate(moment().subtract(90, "days").toDate());
      setToDate(moment().toDate());
      setGranularity("daily");
    }
  }, [isOpen, setLastTimeUnitValue, setRangeSelectKey, setTimeUnitSelectKey]);

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
    setLastTimeUnitValue(90);
    setFromDate(moment().subtract(90, "days").toDate());
    setToDate(moment().toDate());
    setGranularity("daily");
  };

  const handleGranularityChange = (value: "daily" | "monthly" | "yearly") => {
    setGranularity(value);
    if (value === "daily") {
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("days");
      setLastTimeUnitValue(90);
      setFromDate(moment().subtract(90, "days").toDate());
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
      <DialogContent className="min-w-[70vw]">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden scrollableContainer">
          <DialogHeader>
            <div className="mb-4">
              <DialogTitle>
                {t("networkGrowthFullChartDialog.title")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row items-start gap-4 mb-4 w-full">
            <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
              <Label>{t("networkGrowthFullChartDialog.granularity")}</Label>
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
                      "networkGrowthFullChartDialog.selectGranularity"
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

          <div className="h-[55vh] w-full flex items-center justify-center">
            {isChartLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
              </div>
            ) : isChartError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : (
              walletStats && (
                <NetworkGrowthChart
                  data={walletStats}
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

export default NetworkGrowthFullChartDialog;
