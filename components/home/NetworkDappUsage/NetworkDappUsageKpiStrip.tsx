import React from "react";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { CustomJsonKpis, formatBytes } from "./networkCustomJsonUtils";
import { formatRc } from "../networkRcUtils";
import { formatCompact } from "@/utils/chartUtils";

interface Props {
  kpis: CustomJsonKpis;
}

const Stat: React.FC<{
  value: string;
  label: React.ReactNode;
  hint?: string;
}> = ({ value, label, hint }) => (
  <span className="flex items-baseline gap-1.5">
    <span className="text-base font-bold text-explorer-dark-gray dark:text-text">
      {value}
    </span>
    <span className="flex items-center gap-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
      {hint && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                <Info className="h-3 w-3 opacity-60" />
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[260px] text-left text-[12px]"
              >
                {hint}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  </span>
);

const NetworkDappUsageKpiStrip: React.FC<Props> = ({ kpis }) => {
  const { t, locale } = useI18n();
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 px-1">
      <Stat
        value={formatCompact(kpis.totalOps, locale)}
        label={t("networkDappUsage.kpiTotalOps")}
      />
      <Stat
        value={formatBytes(kpis.totalBytes, locale)}
        label={t("networkDappUsage.kpiPayload")}
      />
      <Stat
        value={formatRc(kpis.totalRc, locale)}
        label={t("networkDappUsage.kpiRc")}
        hint={t("networkDappUsage.rcEstimateHint")}
      />
      {kpis.topCategory && (
        <Stat
          value={kpis.topCategory}
          label={t("networkDappUsage.shareOfActivity", {
            pct: kpis.topCategoryShare.toLocaleString(locale, {
              maximumFractionDigits: 1,
            }),
          })}
        />
      )}
    </div>
  );
};

export default NetworkDappUsageKpiStrip;
