import React from "react";
import { Activity, Cpu, Layers, AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import KpiTile from "@/components/ui/KpiTile";
import Hive from "@/types/Hive";
import { formatRc } from "./rcFootprintUtils";

interface RcFootprintKpiStripProps {
  data: Hive.AccountDappFootprintResponse;
  gridClassName?: string;
}

const RcFootprintKpiStrip: React.FC<RcFootprintKpiStripProps> = ({
  data,
  gridClassName = "grid-cols-2 lg:grid-cols-4",
}) => {
  const { t, locale } = useI18n();

  const kpis = [
    {
      key: "total-ops",
      Icon: Activity,
      label: t("rcFootprint.totalOps"),
      value: data.total_ops.toLocaleString(locale),
      exact: undefined as string | undefined,
      info: undefined as string | undefined,
    },
    {
      key: "total-rc",
      Icon: Cpu,
      label: t("rcFootprint.totalRcEst"),
      value: formatRc(data.total_rc_estimated, locale),
      exact: `${data.total_rc_estimated.toLocaleString(locale)} RC`,
      info: t("rcFootprint.footprintEstimateNote"),
    },
    {
      key: "top-category",
      Icon: Layers,
      label: t("rcFootprint.topCategory"),
      value: data.top_category ?? t("rcFootprint.none"),
      exact: undefined,
      info: undefined,
    },
    {
      key: "top-dapp",
      Icon: AppWindow,
      label: t("rcFootprint.topDapp"),
      value: data.top_dapp ?? t("rcFootprint.none"),
      exact: undefined,
      info: undefined,
    },
  ];

  return (
    <div className={cn("grid gap-3", gridClassName)}>
      {kpis.map(({ key, Icon, label, value, exact, info }) => (
        <KpiTile
          key={key}
          label={label}
          icon={<Icon className="h-3 w-3 shrink-0" />}
          infoText={info}
          valueClassName="whitespace-normal break-words"
          value={
            exact ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{value}</span>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="top" className="text-[11px]">
                      {exact}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            ) : (
              value
            )
          }
        />
      ))}
    </div>
  );
};

export default RcFootprintKpiStrip;
