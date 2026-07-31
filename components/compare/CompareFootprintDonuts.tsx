import React from "react";
import { PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareAccountData } from "@/utils/compare/rowModel";
import { Side } from "@/utils/compare/types";
import RcFootprintCategoryDonut from "@/components/account/tabs/rcFootprint/RcFootprintCategoryDonut";
import CompareChartPanel from "./CompareChartPanel";

const SIDE_TEXT: Record<Side, string> = {
  a: "text-red-600 dark:text-red-400",
  b: "text-blue-600 dark:text-blue-400",
};

const noop = () => {};

// One account's category donut (ops share). Reuses the account-page donut so the
// category colors match everywhere; selection is disabled in the compare view.
const FootprintCell: React.FC<{
  d: CompareAccountData;
  side: Side;
  t: (k: string) => string;
}> = ({ d, side, t }) => {
  const cats = d.dappCategories;
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-800/30">
      <div
        className={cn(
          "mb-1 truncate text-center text-[13px] font-bold",
          SIDE_TEXT[side]
        )}
      >
        @{d.account}
      </div>
      <div className="h-[190px] w-full">
        {cats && cats.length > 0 ? (
          <RcFootprintCategoryDonut
            categories={cats}
            metric="ops"
            selectedCategory={null}
            onSelectCategory={noop}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs italic text-slate-400 dark:text-slate-500">
            {t("compare.unavailable")}
          </div>
        )}
      </div>
    </div>
  );
};

interface CompareFootprintDonutsProps {
  a: CompareAccountData;
  b: CompareAccountData;
  t: (k: string) => string;
}

const CompareFootprintDonuts: React.FC<CompareFootprintDonutsProps> = ({
  a,
  b,
  t,
}) => {
  const hasData =
    (a.dappCategories && a.dappCategories.length > 0) ||
    (b.dappCategories && b.dappCategories.length > 0);
  if (!hasData) return null;

  return (
    <CompareChartPanel
      title={t("compare.footprint.title")}
      subtitle={t("compare.footprint.subtitle")}
      icon={PieChart}
      iconColor="text-emerald-500"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FootprintCell d={a} side="a" t={t} />
        <FootprintCell d={b} side="b" t={t} />
      </div>
    </CompareChartPanel>
  );
};

export default CompareFootprintDonuts;
