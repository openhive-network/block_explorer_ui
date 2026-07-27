import React from "react";
import { ExternalLink } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n/i18n";
import Hive from "@/types/Hive";
import {
  CustomJsonMetric,
  getCategoryColor,
  metricValue,
  formatMetricValue,
  rowLabelFor,
  rowSubLabelFor,
  homepageFor,
} from "./networkCustomJsonUtils";

interface Props {
  rows: Hive.NetworkTopCustomJsonRow[];
  metric: CustomJsonMetric;
  groupBy: "id" | "app" | "category";
  registry?: Hive.CustomJsonAppRegistryRow[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
}

const NetworkDappUsageLeaderboard: React.FC<Props> = ({
  rows,
  metric,
  groupBy,
  registry,
  selectedId,
  onSelectId,
}) => {
  const { theme } = useTheme();
  const { t, locale, dir } = useI18n();
  const isDark = theme === "dark";
  const max =
    rows.reduce((m, r) => Math.max(m, metricValue(r, metric)), 0) || 1;
  const idClickable = groupBy === "id";

  return (
    <div className="overflow-x-auto" dir={dir}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">
            <th className="p-2 font-semibold">#</th>
            <th className="p-2 font-semibold">
              {t("networkDappUsage.colName")}
            </th>
            <th className="p-2 font-semibold">
              {t("networkDappUsage.colCategory")}
            </th>
            <th className="p-2 text-right font-semibold">
              {t("networkDappUsage.metricOps")}
            </th>
            <th className="p-2 text-right font-semibold">
              {t("networkDappUsage.metricBytes")}
            </th>
            <th className="p-2 text-right font-semibold">
              {t("networkDappUsage.kpiRc")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const id = r.json_id ?? "";
            const isSelected = idClickable && id === selectedId;
            const homepage = homepageFor(r, registry);
            const barPct = (metricValue(r, metric) / max) * 100;
            const subLabel = rowSubLabelFor(r, groupBy);
            return (
              <tr
                key={`${groupBy}-${id || r.app_name || r.category}-${i}`}
                onClick={idClickable && id ? () => onSelectId(id) : undefined}
                className={`border-t border-gray-100 dark:border-gray-800 ${
                  idClickable && id ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-indigo-100/80 ring-1 ring-inset ring-indigo-400 dark:bg-indigo-500/20 dark:ring-indigo-500"
                    : "hover:bg-explorer-extra-light-gray/60"
                }`}
              >
                <td className="p-2 tabular-nums text-gray-400">{i + 1}</td>
                <td className="relative p-2 font-medium">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 -z-0 rounded-r opacity-15"
                    style={{
                      width: `${barPct}%`,
                      background: getCategoryColor(r.category, isDark),
                    }}
                  />
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <span className="inline-flex flex-col leading-tight">
                      <span>{rowLabelFor(r, groupBy)}</span>
                      {subLabel && (
                        <span className="text-[10px] font-normal text-gray-400">
                          {subLabel}
                        </span>
                      )}
                    </span>
                    {homepage && (
                      <a
                        href={homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-link"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </span>
                </td>
                <td className="p-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: getCategoryColor(r.category, isDark),
                      }}
                    />
                    {r.category}
                  </span>
                </td>
                <td className="p-2 text-right tabular-nums">
                  {formatMetricValue(r.op_count, "ops", locale)}
                </td>
                <td className="p-2 text-right tabular-nums">
                  {formatMetricValue(r.op_bytes, "bytes", locale)}
                </td>
                <td className="p-2 text-right tabular-nums">
                  {formatMetricValue(r.rc_estimate, "rc", locale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NetworkDappUsageLeaderboard;
