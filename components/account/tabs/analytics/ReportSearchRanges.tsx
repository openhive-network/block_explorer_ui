import React, { useEffect, useState } from "react";
import moment from "moment";
import { Search, CalendarRange, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import useSearchRanges from "@/hooks/common/useSearchRanges";
import { useI18n } from "@/i18n/i18n";

export type RangeKey = "30" | "90" | "180" | "custom";

interface ReportSearchRangesProps {
  onApply: (
    from: Date | number | undefined,
    to: Date | number | undefined
  ) => void;
  defaultRangeKey?: RangeKey;
  className?: string;
}

const PRESETS: { days: number; key: RangeKey }[] = [
  { days: 30, key: "30" },
  { days: 90, key: "90" },
  { days: 180, key: "180" },
];

// Date-range control for the analytics reports: quick day presets plus a Custom
// option that opens the full SearchRanges plugin (last-time / last-blocks /
// block-range / time-range) in a popover — no inline layout shift.
const ReportSearchRanges: React.FC<ReportSearchRangesProps> = ({
  onApply,
  defaultRangeKey = "30",
  className,
}) => {
  const { t } = useI18n();
  const [rangeKey, setRangeKey] = useState<RangeKey>(defaultRangeKey);
  const [open, setOpen] = useState(false);
  const searchRanges = useSearchRanges("timeRange");
  const [isSearchButtonDisabled, setIsSearchButtonDisabled] = useState(false);

  // Seed the Custom pickers with a sensible default window (UTC, chain time).
  useEffect(() => {
    searchRanges.setStartDate(moment.utc().subtract(30, "days").toDate());
    searchRanges.setEndDate(moment.utc().toDate());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (key: RangeKey, days: number) => {
    setRangeKey(key);
    setOpen(false);
    onApply(
      moment.utc().subtract(days, "days").toDate(),
      moment.utc().toDate()
    );
  };

  const handleCustomSearch = async () => {
    const { payloadStartDate, payloadEndDate } =
      await searchRanges.getRangesValues();
    // These reports are date-based; block-mode tabs resolve to no dates. Fall
    // back to a bounded 30-day window so no report silently queries all-time.
    const from = payloadStartDate ?? moment.utc().subtract(30, "days").toDate();
    const to = payloadEndDate ?? moment.utc().toDate();
    onApply(from, to);
    setRangeKey("custom");
    setOpen(false);
  };

  // Match SegmentedToggle (size "md") so all pills in a report line up.
  const pill =
    "px-3.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400";
  const pillActive = "bg-indigo-500 text-white";
  const pillIdle = "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300";

  return (
    <div
      className={cn(
        "inline-flex flex-shrink-0 overflow-hidden rounded border border-gray-200 font-medium dark:border-gray-700",
        className
      )}
      role="group"
      aria-label={t("reportRange.label")}
    >
      {PRESETS.map(({ days, key }) => (
        <button
          key={key}
          type="button"
          aria-pressed={rangeKey === key}
          onClick={() => applyPreset(key, days)}
          className={cn(pill, rangeKey === key ? pillActive : pillIdle)}
        >
          {t(`reportRange.d${days}`)}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-pressed={rangeKey === "custom"}
            className={cn(
              pill,
              "flex items-center gap-1",
              rangeKey === "custom" ? pillActive : pillIdle
            )}
          >
            <CalendarRange className="h-3.5 w-3.5" />
            {t("reportRange.custom")}
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[290px] p-3 [&_.mt-5]:mt-2 [&_.mb-4]:mb-2"
        >
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("reportRange.customTitle")}
          </div>
          <SearchRanges
            rangesProps={searchRanges}
            setIsSearchButtonDisabled={setIsSearchButtonDisabled}
          />
          <Button
            size="sm"
            className="mt-3 w-full gap-1"
            onClick={handleCustomSearch}
            disabled={isSearchButtonDisabled}
            data-testid="apply-filters"
          >
            <Search className="h-3.5 w-3.5" />
            {t("common.search")}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReportSearchRanges;
