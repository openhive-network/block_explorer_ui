import React, { useEffect, useMemo, useState } from "react";
import { Loader2, PieChart } from "lucide-react";
import moment from "moment";
import { useI18n } from "@/i18n/i18n";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import useAccountDappFootprint from "@/hooks/api/accountPage/useAccountDappFootprint";
import {
  FootprintMetric,
  dappsForCategory,
} from "../rcFootprint/rcFootprintUtils";
import RcFootprintControls, {
  RangeKey,
} from "../rcFootprint/RcFootprintControls";
import RcFootprintKpiStrip from "../rcFootprint/RcFootprintKpiStrip";
import RcFootprintCategoryDonut from "../rcFootprint/RcFootprintCategoryDonut";
import RcFootprintDappBar from "../rcFootprint/RcFootprintDappBar";
import RcFootprintDrilldown from "../rcFootprint/RcFootprintDrilldown";
import { BaseReportProps } from "./reportRegistry";
import { useRegisterReportExport } from "./reportExports";

const fmt = (d: Date) => moment.utc(d).format("YYYY-MM-DD");

// Reflow by the widget's OWN width (resizable cell / mobile) using native CSS
// container queries — no JS measuring, so it can't loop against the scrollbar.
// container-type sits on the non-scrolling outer wrapper; the inner div scrolls.
const CQ_CSS = `
.rcfp-cq { container-type: inline-size; container-name: rcfp; }
.rcfp-grid { display: grid; gap: 0.75rem; grid-template-columns: minmax(0,1fr); }
.rcfp-kpi { grid-template-columns: repeat(2, minmax(0,1fr)); }
@container rcfp (min-width: 400px) { .rcfp-kpi { grid-template-columns: repeat(4, minmax(0,1fr)); } }
@container rcfp (min-width: 680px) { .rcfp-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
`;

const RcFootprintReport: React.FC<
  BaseReportProps & { fillHeight?: boolean }
> = ({ accountName, widgetId, fillHeight = true }) => {
  const { t } = useI18n();

  const [metric, setMetric] = useState<FootprintMetric>("ops");
  const [rangeKey, setRangeKey] = useState<RangeKey>("30");

  const todayKey = useMemo(() => moment.utc().format("YYYY-MM-DD"), []);
  const [customFrom, setCustomFrom] = useState<Date>(
    moment.utc(todayKey).subtract(30, "days").toDate()
  );
  const [customTo, setCustomTo] = useState<Date>(moment.utc(todayKey).toDate());

  const { fromDate, toDate } = useMemo(() => {
    if (rangeKey === "custom") {
      return { fromDate: fmt(customFrom), toDate: fmt(customTo) };
    }
    const days = Number(rangeKey);
    return {
      fromDate: moment
        .utc(todayKey)
        .subtract(days, "days")
        .format("YYYY-MM-DD"),
      toDate: todayKey,
    };
  }, [rangeKey, customFrom, customTo, todayKey]);

  const { dappFootprint, isDappFootprintLoading, isDappFootprintError } =
    useAccountDappFootprint(accountName, fromDate, toDate);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDapp, setSelectedDapp] = useState<string | null>(null);

  // Keep the selected category valid as the window/data changes: default to the
  // account's top category (matches the ticket's Step 1 initial view).
  useEffect(() => {
    if (!dappFootprint) return;
    const exists =
      selectedCategory &&
      dappFootprint.categories.some((c) => c.category === selectedCategory);
    if (!exists) {
      setSelectedCategory(dappFootprint.top_category ?? null);
      setSelectedDapp(null);
    }
  }, [dappFootprint, selectedCategory]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedDapp(null);
  };

  const dapps = useMemo(
    () => dappsForCategory(dappFootprint, selectedCategory),
    [dappFootprint, selectedCategory]
  );

  const isEmpty =
    !!dappFootprint &&
    (dappFootprint.total_ops === 0 || dappFootprint.categories.length === 0);

  // Publish CSV datasets to the widget header (translated column headers).
  const exportDatasets = useMemo(() => {
    if (!dappFootprint) return [];
    const cats = dappFootprint.categories.map((c) => ({
      [t("rcFootprint.expCategory")]: c.category,
      [t("rcFootprint.expOps")]: c.op_count,
      [t("rcFootprint.expOpsPct")]: c.pct,
      [t("rcFootprint.expRc")]: c.rc_estimated,
      [t("rcFootprint.expRcPct")]: c.rc_pct,
    }));
    const dps = dappFootprint.dapps.map((d) => ({
      [t("rcFootprint.expDapp")]: d.app_name,
      [t("rcFootprint.expCategory")]: d.category,
      [t("rcFootprint.expOps")]: d.op_count,
      [t("rcFootprint.expOpsPct")]: d.pct,
      [t("rcFootprint.expRc")]: d.rc_estimated,
      [t("rcFootprint.expRcPct")]: d.rc_pct,
    }));
    const base = `rc-footprint_${accountName}_${fromDate}_${toDate}`;
    return [
      {
        name: t("rcFootprint.exportCategories"),
        filename: `${base}_categories`,
        rows: cats,
      },
      {
        name: t("rcFootprint.exportDapps"),
        filename: `${base}_dapps`,
        rows: dps,
      },
    ];
  }, [dappFootprint, accountName, fromDate, toDate, t]);

  useRegisterReportExport(widgetId, exportDatasets);

  return (
    <div className={fillHeight ? "rcfp-cq h-full flex flex-col" : "rcfp-cq"}>
      <style>{CQ_CSS}</style>
      <div
        className={
          fillHeight
            ? "flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5"
            : "space-y-3"
        }
      >
        <RcFootprintControls
          metric={metric}
          onMetricChange={setMetric}
          rangeKey={rangeKey}
          onRangeKeyChange={setRangeKey}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        {isDappFootprintLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : isDappFootprintError ? (
          <p className="text-red-500 text-sm py-8 text-center">
            {t("common.errorLoadingData")}
          </p>
        ) : !dappFootprint || isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-500">
            <PieChart className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t("rcFootprint.emptyState")}</p>
          </div>
        ) : (
          <>
            <RcFootprintKpiStrip
              data={dappFootprint}
              gridClassName="rcfp-kpi"
            />

            <div className="rcfp-grid">
              <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme">
                <CardHeaderWithLink
                  title={t("rcFootprint.categoryBreakdown")}
                />
                <div className="h-[320px] p-2">
                  <RcFootprintCategoryDonut
                    categories={dappFootprint.categories}
                    metric={metric}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                  />
                </div>
              </div>

              <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-theme">
                <CardHeaderWithLink
                  title={
                    selectedCategory
                      ? t("rcFootprint.dappsInCategory", {
                          category: selectedCategory,
                        })
                      : t("rcFootprint.dappBreakdown")
                  }
                />
                <div className="p-2 min-h-[120px] max-h-[320px] overflow-y-auto">
                  {dapps.length ? (
                    <RcFootprintDappBar
                      dapps={dapps}
                      category={selectedCategory as string}
                      metric={metric}
                      selectedDapp={selectedDapp}
                      onSelectDapp={setSelectedDapp}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm p-4">
                      {t("common.noDataAvailable")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedDapp && selectedCategory && (
              <RcFootprintDrilldown
                accountName={accountName}
                dapp={selectedDapp}
                category={selectedCategory}
                fromDate={fromDate}
                toDate={toDate}
                onClose={() => setSelectedDapp(null)}
              />
            )}

            <p className="text-[11px] text-gray-400">
              {t("rcFootprint.footprintEstimateNote")}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default RcFootprintReport;
