import React, { useEffect, useMemo, useState } from "react";
import { Loader2, PieChart } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { useI18n } from "../../i18n/i18n";
import useNetworkDappUsage from "@/hooks/api/homePage/useNetworkDappUsage";
import NetworkDappUsageDonut from "./NetworkDappUsageDonut";
import NetworkDappUsageBar from "./NetworkDappUsageBar";
import {
  DappMetric,
  dappsForCategory,
  hasUniqueAccounts,
} from "./networkDappUsageUtils";

const NetworkDappUsageFullChartDialog = dynamic(
  () => import("./NetworkDappUsageFullChartDialog"),
  { ssr: false }
);

const WINDOWS = [30, 90, 180] as const;
type WindowDays = (typeof WINDOWS)[number];

const NetworkDappUsageCard: React.FC = () => {
  const { t, dir } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [windowDays, setWindowDays] = useState<WindowDays>(30);
  const [metric, setMetric] = useState<DappMetric>("ops");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // UTC (chain time) so day boundaries match the endpoint's aggregation.
  const fromDate = useMemo(
    () => moment.utc().subtract(windowDays, "days").toDate(),
    [windowDays]
  );

  const { dappUsage, isDappUsageLoading, isDappUsageError } =
    useNetworkDappUsage(fromDate, undefined);

  const usersAvailable = hasUniqueAccounts(dappUsage);
  // Fall back off the Users metric if the endpoint doesn't carry unique accounts.
  const effectiveMetric: DappMetric =
    metric === "users" && !usersAvailable ? "ops" : metric;

  // Keep the selected category valid as the window/data changes: default to the
  // network's top category.
  useEffect(() => {
    if (!dappUsage) return;
    const exists =
      selectedCategory &&
      dappUsage.categories.some((c) => c.category === selectedCategory);
    if (!exists) setSelectedCategory(dappUsage.top_category ?? null);
  }, [dappUsage, selectedCategory]);

  const dapps = useMemo(
    () => dappsForCategory(dappUsage, selectedCategory, effectiveMetric),
    [dappUsage, selectedCategory, effectiveMetric]
  );

  const isEmpty =
    !!dappUsage &&
    (dappUsage.total_ops === 0 || dappUsage.categories.length === 0);

  const metricOptions: { value: DappMetric; label: string }[] = [
    { value: "ops", label: t("networkDappUsage.metricOps") },
    { value: "rc", label: t("networkDappUsage.metricRc") },
    ...(usersAvailable
      ? [{ value: "users" as const, label: t("networkDappUsage.metricUsers") }]
      : []),
  ];

  const windowOptions = WINDOWS.map((w) => ({
    value: String(w),
    label: t(`networkDappUsage.d${w}`),
  }));

  return (
    <div className="bg-theme rounded mb-2 shadow-md overflow-hidden" dir={dir}>
      <CardHeaderWithLink
        title={t("widgets.networkDappUsageName")}
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            {t("common.fullChart")}
          </button>
        }
      />
      <div className="p-2 space-y-2">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SegmentedToggle
            options={windowOptions}
            value={String(windowDays)}
            onChange={(v) => setWindowDays(Number(v) as WindowDays)}
            ariaLabel={t("networkDappUsage.windowLabel")}
          />
          <SegmentedToggle<DappMetric>
            options={metricOptions}
            value={effectiveMetric}
            onChange={setMetric}
            ariaLabel={t("networkDappUsage.metricLabel")}
          />
        </div>

        {isDappUsageLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isDappUsageError ? (
          <p className="py-8 text-center text-sm text-red-500">
            {t("common.errorLoadingData")}
          </p>
        ) : !dappUsage || isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-500">
            <PieChart className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("networkDappUsage.emptyState")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-lg bg-explorer-extra-light-gray p-2 shadow-md">
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {t("networkDappUsage.categoryBreakdown")}
              </h3>
              <div className="h-[240px]">
                <NetworkDappUsageDonut
                  categories={dappUsage.categories}
                  metric={effectiveMetric}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </div>
            <div className="rounded-lg bg-explorer-extra-light-gray p-2 shadow-md">
              <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {selectedCategory
                  ? t("networkDappUsage.dappsInCategory", {
                      category: selectedCategory,
                    })
                  : t("networkDappUsage.dappBreakdown")}
              </h3>
              <div className="max-h-[240px] overflow-y-auto">
                {dapps.length ? (
                  <NetworkDappUsageBar
                    dapps={dapps}
                    category={selectedCategory as string}
                    metric={effectiveMetric}
                  />
                ) : (
                  <p className="p-4 text-sm text-gray-500">
                    {t("common.noDataAvailable")}
                  </p>
                )}
              </div>
            </div>
          </div>
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
