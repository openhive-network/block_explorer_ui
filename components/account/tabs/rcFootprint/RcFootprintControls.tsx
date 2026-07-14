import React from "react";
import { useI18n } from "@/i18n/i18n";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import DateTimePicker from "@/components/DateTimePicker";
import { config } from "@/Config";
import { FootprintMetric } from "./rcFootprintUtils";

export type RangeKey = "30" | "90" | "180" | "custom";

interface RcFootprintControlsProps {
  metric: FootprintMetric;
  onMetricChange: (m: FootprintMetric) => void;
  rangeKey: RangeKey;
  onRangeKeyChange: (r: RangeKey) => void;
  customFrom: Date;
  customTo: Date;
  onCustomFromChange: (d: Date) => void;
  onCustomToChange: (d: Date) => void;
}

const RcFootprintControls: React.FC<RcFootprintControlsProps> = ({
  metric,
  onMetricChange,
  rangeKey,
  onRangeKeyChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedToggle<RangeKey>
          value={rangeKey}
          onChange={onRangeKeyChange}
          ariaLabel={t("rcFootprint.dateRange")}
          size="md"
          options={[
            { value: "30", label: t("rcFootprint.range30") },
            { value: "90", label: t("rcFootprint.range90") },
            { value: "180", label: t("rcFootprint.range180") },
            { value: "custom", label: t("rcFootprint.rangeCustom") },
          ]}
        />
        {rangeKey === "custom" && (
          <div className="flex items-center gap-1.5">
            <DateTimePicker
              date={customFrom}
              setDate={onCustomFromChange}
              firstDate={new Date(config.firstBlockTime)}
              lastDate={customTo}
            />
            <span className="text-gray-400">–</span>
            <DateTimePicker
              date={customTo}
              setDate={onCustomToChange}
              firstDate={customFrom}
            />
          </div>
        )}
      </div>

      <SegmentedToggle<FootprintMetric>
        value={metric}
        onChange={onMetricChange}
        ariaLabel={t("rcFootprint.metric")}
        size="md"
        options={[
          { value: "ops", label: t("rcFootprint.metricOps") },
          { value: "rc", label: t("rcFootprint.metricRc") },
        ]}
      />
    </div>
  );
};

export default RcFootprintControls;
