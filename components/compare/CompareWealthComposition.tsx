import React from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareAccountData } from "@/utils/compare/rowModel";
import { Side } from "@/utils/compare/types";
import { formatCompareValue } from "@/utils/compare/format";
import {
  WEALTH_SEGMENTS as SEGMENTS,
  wealthTotal as total,
} from "@/utils/compare/wealth";
import CompareChartPanel from "./CompareChartPanel";

const SIDE_TEXT: Record<Side, string> = {
  a: "text-red-600 dark:text-red-400",
  b: "text-blue-600 dark:text-blue-400",
};

// One account's composition, normalized to its own total (shows the mix). The
// absolute USD total is labelled alongside so magnitude stays explicit.
const CompositionBar: React.FC<{
  d: CompareAccountData;
  side: Side;
  locale: string;
}> = ({ d, side, locale }) => {
  const c = d.wealthComposition;
  const sum = c ? total(c) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className={cn("truncate text-[13px] font-bold", SIDE_TEXT[side])}>
          @{d.account}
        </span>
        <span className="flex-shrink-0 text-[13px] font-extrabold tabular-nums text-slate-700 dark:text-slate-200">
          {formatCompareValue(d.totalValueUsd, "usd", locale)}
        </span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
        {c &&
          sum > 0 &&
          SEGMENTS.map((seg) => {
            const v = Math.max(0, c[seg.key]);
            if (v <= 0) return null;
            return (
              <div
                key={seg.key}
                style={{
                  width: `${(v / sum) * 100}%`,
                  backgroundColor: seg.color,
                }}
              />
            );
          })}
      </div>
    </div>
  );
};

interface CompareWealthCompositionProps {
  a: CompareAccountData;
  b: CompareAccountData;
  locale: string;
  t: (k: string) => string;
}

const CompareWealthComposition: React.FC<CompareWealthCompositionProps> = ({
  a,
  b,
  locale,
  t,
}) => {
  const hasData =
    (a.wealthComposition && total(a.wealthComposition) > 0) ||
    (b.wealthComposition && total(b.wealthComposition) > 0);
  if (!hasData) return null;

  return (
    <CompareChartPanel
      title={t("compare.composition.title")}
      subtitle={t("compare.composition.subtitle")}
      icon={Coins}
      iconColor="text-amber-500"
    >
      <div className="space-y-3">
        <CompositionBar d={a} side="a" locale={locale} />
        <CompositionBar d={b} side="b" locale={locale} />
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
          {SEGMENTS.map((seg) => (
            <span
              key={seg.key}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              {t(seg.labelKey)}
            </span>
          ))}
        </div>
      </div>
    </CompareChartPanel>
  );
};

export default CompareWealthComposition;
