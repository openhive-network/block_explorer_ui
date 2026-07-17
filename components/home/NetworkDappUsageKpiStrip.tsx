import React from "react";
import { Boxes, Trophy, Layers, Activity, Cpu, Users } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import { formatRc } from "./networkRcUtils";

interface NetworkDappUsageKpiStripProps {
  data: Hive.NetworkDappFootprintResponse;
}

const NetworkDappUsageKpiStrip: React.FC<NetworkDappUsageKpiStripProps> = ({
  data,
}) => {
  const { t, locale } = useI18n();

  const tiles: {
    key: string;
    Icon: typeof Boxes;
    label: string;
    value: string;
  }[] = [
    {
      key: "dapps",
      Icon: Boxes,
      label: t("networkDappUsage.kpiTotalDapps"),
      value: data.total_dapps.toLocaleString(locale),
    },
    {
      key: "topDapp",
      Icon: Trophy,
      label: t("networkDappUsage.kpiTopDapp"),
      value: data.top_dapp ?? "—",
    },
    {
      key: "topCategory",
      Icon: Layers,
      label: t("networkDappUsage.kpiTopCategory"),
      value: data.top_category ?? "—",
    },
    {
      key: "ops",
      Icon: Activity,
      label: t("networkDappUsage.kpiTotalOps"),
      value: data.total_ops.toLocaleString(locale),
    },
    {
      key: "rc",
      Icon: Cpu,
      label: t("networkDappUsage.kpiTotalRc"),
      value: formatRc(data.total_rc_estimated, locale),
    },
    ...(data.total_unique_accounts != null
      ? [
          {
            key: "users",
            Icon: Users,
            label: t("networkDappUsage.kpiUniqueUsers"),
            value: data.total_unique_accounts.toLocaleString(locale),
          },
        ]
      : []),
  ];

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {tiles.map(({ key, Icon, label, value }) => (
          <div
            key={key}
            className="flex min-w-[130px] flex-1 flex-col rounded-lg bg-explorer-extra-light-gray p-2.5 shadow-md"
          >
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-words">{label}</span>
            </div>
            <div className="break-words text-base font-bold text-explorer-dark-gray dark:text-text">
              {value}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
        {t("networkDappUsage.rcEstimateNote")}
      </p>
    </div>
  );
};

export default NetworkDappUsageKpiStrip;
