import React, { useMemo, useState } from "react";
import moment from "moment";
import { Loader2, Download } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReportDialogHeader from "@/components/ui/ReportDialogHeader";
import DataExport from "@/components/DataExport";
import { spacesToUnderscores } from "@/utils/StringUtils";
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
import useSearchRanges from "@/hooks/common/useSearchRanges";
import useHbdHealth from "@/hooks/api/homePage/useHbdHealth";
import HbdHealthChart from "./HbdHealthChart";
import { HbdHealthGranularity } from "@/utils/hbdHealth";
import { useI18n } from "../../i18n/i18n";

interface HbdHealthFullChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRANULARITIES: HbdHealthGranularity[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

// Daily rows over the chain's whole history are ~4,000 points per route, so
// daily and weekly start on the last year; monthly and yearly show everything.
const defaultRange = (granularity: HbdHealthGranularity) =>
  granularity === "daily" || granularity === "weekly"
    ? { from: moment().subtract(12, "months").toDate(), to: moment().toDate() }
    : { from: undefined, to: undefined };

const HbdHealthFullChartDialog: React.FC<HbdHealthFullChartDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const [granularity, setGranularity] =
    useState<HbdHealthGranularity>("monthly");
  const [fromDate, setFromDate] = useState<Date | number | undefined>();
  const [toDate, setToDate] = useState<Date | number | undefined>();

  const searchRanges = useSearchRanges();
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);
  const { setRangeSelectKey, setTimeUnitSelectKey, setLastTimeUnitValue } =
    searchRanges;

  const { points, isLoading, isError, isTreasuryError } = useHbdHealth(
    granularity,
    fromDate,
    toDate,
    false,
    true
  );

  const exportData = useMemo(
    () =>
      points.map((p) => ({
        [t("common.date")]: moment.utc(p.date).format("YYYY-MM-DD HH:mm"),
        [t("hbdHealthCard.protocolRatio")]: p.protocolPct?.toFixed(3) ?? "",
        [t("hbdHealthCard.grossShare")]: p.grossPct.toFixed(3),
        [t("hbdHealthCard.interestRate")]: p.interestRatePct.toFixed(2),
        [t("hbdHealthCard.hbdSupply")]: p.hbdSupply.toFixed(3),
        [t("hbdHealthCard.treasuryHbd")]: p.treasuryHbd?.toFixed(3) ?? "",
        [t("hbdHealthCard.hiveSupply")]: p.hiveSupply.toFixed(3),
        [t("hbdHealthCard.feedPrice")]: p.priceHivePerHbd?.toFixed(3) ?? "",
        [t("hbdHealthCard.printStopLine")]: p.printStopPct ?? "",
        [t("hbdHealthCard.haircutLine")]: p.haircutPct ?? "",
      })),
    [points, t]
  );

  const applyGranularityRange = (value: HbdHealthGranularity) => {
    const { from, to } = defaultRange(value);
    if (from) {
      setRangeSelectKey("lastTime");
      setTimeUnitSelectKey("months");
      setLastTimeUnitValue(12);
    } else {
      setRangeSelectKey("none");
      setLastTimeUnitValue(undefined);
    }
    setFromDate(from);
    setToDate(to);
  };

  const handleGranularityChange = (value: HbdHealthGranularity) => {
    setGranularity(value);
    applyGranularityRange(value);
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
  };

  const handleFilterClear = () => {
    setGranularity("monthly");
    applyGranularityRange("monthly");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[70vw] pr-0">
        <div className="max-h-[90vh] overflow-y-auto overflow-x-hidden pr-6 scrollableContainer">
          <ReportDialogHeader
            title={t("widgets.hbdHealthName")}
            subtitle={t("hbdHealthCard.subtitle")}
            actions={
              <DataExport
                data={exportData}
                filename={`${spacesToUnderscores(
                  t("widgets.hbdHealthName")
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
              <div className="flex flex-col gap-y-3 w-1/2 md:w-1/4">
                <Label>{t("networkGrowthFullChartDialog.granularity")}</Label>
                <Select
                  onValueChange={(value) =>
                    handleGranularityChange(value as HbdHealthGranularity)
                  }
                  value={granularity}
                >
                  <SelectTrigger data-testid="hbd-health-granularity">
                    <SelectValue
                      placeholder={t(
                        "networkGrowthFullChartDialog.selectGranularity"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANULARITIES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {t(`common.${g}`)}
                      </SelectItem>
                    ))}
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

          <div className="h-[55vh] w-full flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="animate-spin h-10 w-10 dark:text-white" />
            ) : isError ? (
              <p className="text-red-500 text-sm">
                {t("common.errorLoadingData")}
              </p>
            ) : points.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {t("common.noDataAvailable")}
              </p>
            ) : (
              <HbdHealthChart
                data={points}
                granularity={granularity}
                includeBrush
              />
            )}
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-500">
            {isTreasuryError && (
              <p className="text-amber-600 dark:text-amber-400">
                {t("hbdHealthCard.protocolUnavailable")}
              </p>
            )}
            <p>{t("hbdHealthCard.footnoteGross")}</p>
            <p>{t("hbdHealthCard.footnoteProtocol")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HbdHealthFullChartDialog;
