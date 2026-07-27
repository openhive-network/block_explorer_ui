import React, { useMemo, useState } from "react";
import { Loader2, PieChart } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useI18n } from "@/i18n/i18n";
import { useTheme } from "@/contexts/ThemeContext";
import useNetworkTopCustomJson from "@/hooks/api/homePage/useNetworkTopCustomJson";
import NetworkDappUsageDonut from "./NetworkDappUsageDonut";
import NetworkDappUsageKpiStrip from "./NetworkDappUsageKpiStrip";
import NetworkDappUsageTreemap from "./NetworkDappUsageTreemap";
import {
  CustomJsonMetric,
  buildCategorySlices,
  computeCustomJsonKpis,
  metricValue,
} from "./networkCustomJsonUtils";

const ORDER_BY: Record<
  CustomJsonMetric,
  "op_count" | "op_bytes" | "rc_estimate"
> = { ops: "op_count", bytes: "op_bytes", rc: "rc_estimate" };

const NetworkDappUsageFullChartDialog = dynamic(
  () => import("./NetworkDappUsageFullChartDialog"),
  { ssr: false }
);

const NetworkDappUsageCard: React.FC = () => {
  const { t, dir, locale } = useI18n();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [metric, setMetric] = useState<CustomJsonMetric>("ops");

  const fromDate = useMemo(
    () => moment.utc().subtract(30, "days").toDate(),
    []
  );

  // order_by pinned so the metric toggle re-ranks client-side without refetching.
  const { topCustomJson, isTopCustomJsonLoading, isTopCustomJsonError } =
    useNetworkTopCustomJson({
      from_date: fromDate,
      limit_count: 100,
      group_by: "category",
      order_by: "op_count",
    });
  const { topCustomJson: appRows } = useNetworkTopCustomJson({
    from_date: fromDate,
    limit_count: 10,
    group_by: "app",
    order_by: ORDER_BY[metric],
  });

  const categories = useMemo(() => topCustomJson ?? [], [topCustomJson]);
  const kpis = useMemo(
    () => computeCustomJsonKpis(categories, metric),
    [categories, metric]
  );
  const metricTotal = useMemo(
    () => categories.reduce((s, c) => s + metricValue(c, metric), 0),
    [categories, metric]
  );
  const donutSlices = useMemo(
    () =>
      buildCategorySlices(
        categories,
        metric,
        isDark,
        t("networkDappUsage.others")
      ),
    [categories, metric, isDark, t]
  );
  const legend = useMemo(() => {
    const total = donutSlices.reduce((s, x) => s + x.value, 0) || 1;
    return donutSlices
      .map((s) => ({
        name: s.name,
        color: s.color,
        pct: (s.value / total) * 100,
      }))
      .filter((it) => it.pct >= 0.3);
  }, [donutSlices]);
  const isEmpty =
    !!topCustomJson && (categories.length === 0 || kpis?.totalOps === 0);

  const metricOptions: { value: CustomJsonMetric; label: string }[] = [
    { value: "ops", label: t("networkDappUsage.metricOps") },
    { value: "bytes", label: t("networkDappUsage.metricBytes") },
    { value: "rc", label: t("networkDappUsage.metricRc") },
  ];
  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden" dir={dir}>
      <CardHeaderWithLink
        title={t("widgets.networkDappUsageName")}
        actions={
          <>
            <SegmentedToggle<CustomJsonMetric>
              options={metricOptions}
              value={metric}
              onChange={setMetric}
              ariaLabel={t("networkDappUsage.metricLabel")}
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {t("common.fullChart")}
            </button>
          </>
        }
      />
      <div className="p-2 space-y-2">
        {isTopCustomJsonLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isTopCustomJsonError ? (
          <p className="py-8 text-center text-sm text-red-500">
            {t("common.errorLoadingData")}
          </p>
        ) : !topCustomJson || isEmpty || !kpis ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-500">
            <PieChart className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("networkDappUsage.emptyState")}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="px-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("networkDappUsage.last30Days")}
              </span>
              <NetworkDappUsageKpiStrip kpis={kpis} />
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-explorer-extra-light-gray p-2 shadow-md">
                <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {t("networkDappUsage.categoryBreakdown")}
                </h3>
                <div className="h-[260px]">
                  <NetworkDappUsageDonut slices={donutSlices} metric={metric} />
                </div>
              </div>

              {appRows && appRows.length > 0 && (
                <div className="rounded-lg bg-explorer-extra-light-gray p-2 shadow-md">
                  <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("networkDappUsage.topApps")}
                  </h3>
                  <div className="h-[260px]">
                    <NetworkDappUsageTreemap
                      apps={appRows}
                      metric={metric}
                      total={metricTotal}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-gray-600 dark:text-gray-300">
              {legend.map((it) => (
                <span key={it.name} className="flex items-center gap-1">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: it.color }}
                  />
                  {it.name}
                  <span className="tabular-nums text-gray-500 dark:text-gray-400">
                    {it.pct.toLocaleString(locale, {
                      maximumFractionDigits: 1,
                    })}
                    %
                  </span>
                </span>
              ))}
            </div>

            <p className="px-1 text-[10px] text-gray-400">
              {t("networkDappUsage.customJsonOnlyNote")}
            </p>
          </>
        )}
      </div>

      <NetworkDappUsageFullChartDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default NetworkDappUsageCard;
