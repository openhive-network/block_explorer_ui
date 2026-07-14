import React from "react";
import { Activity, Cpu, Layers, AppWindow } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
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
      title: undefined as string | undefined,
    },
    {
      key: "total-rc",
      Icon: Cpu,
      label: t("rcFootprint.totalRcEst"),
      value: formatRc(data.total_rc_estimated, locale),
      title: `${data.total_rc_estimated.toLocaleString(locale)} RC`,
    },
    {
      key: "top-category",
      Icon: Layers,
      label: t("rcFootprint.topCategory"),
      value: data.top_category ?? t("rcFootprint.none"),
      title: data.top_category ?? undefined,
    },
    {
      key: "top-dapp",
      Icon: AppWindow,
      label: t("rcFootprint.topDapp"),
      value: data.top_dapp ?? t("rcFootprint.none"),
      title: data.top_dapp ?? undefined,
    },
  ];

  return (
    <div className={cn("grid gap-3", gridClassName)}>
      {kpis.map(({ key, Icon, label, value, title }) => (
        <div
          key={key}
          title={title}
          className={cn(
            "rounded-md border border-gray-200 dark:border-gray-700",
            "bg-theme px-4 py-3 shadow-sm flex flex-col"
          )}
        >
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          <div className="text-base font-semibold truncate">{value}</div>
        </div>
      ))}
    </div>
  );
};

export default RcFootprintKpiStrip;
