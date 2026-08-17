import React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompareAccountData } from "@/utils/compare/rowModel";
import { Side } from "@/utils/compare/types";
import { formatCompareValue } from "@/utils/compare/format";
import CompareChartPanel from "./CompareChartPanel";

const SIDE_TEXT: Record<Side, string> = {
  a: "text-red-600 dark:text-red-400",
  b: "text-blue-600 dark:text-blue-400",
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));

// A single directional bar (powered up = emerald, powered down = rose), scaled to
// the largest flow across both accounts so the two accounts are comparable.
const FlowBar: React.FC<{
  label: string;
  value: number | null;
  max: number;
  color: string;
  locale: string;
}> = ({ label, value, max, color, locale }) => (
  <div className="flex items-center gap-2">
    <span className="w-24 flex-shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${max > 0 ? clamp((value ?? 0) / max) * 100 : 0}%` }}
      />
    </div>
    <span className="w-20 flex-shrink-0 text-end text-[11px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
      {formatCompareValue(value, "hp", locale)}
    </span>
  </div>
);

const FlowGroup: React.FC<{
  d: CompareAccountData;
  side: Side;
  max: number;
  locale: string;
  t: (k: string) => string;
}> = ({ d, side, max, locale, t }) => {
  const net = d.netHpFlow;
  const netColor =
    net == null
      ? "text-slate-400 dark:text-slate-500"
      : net >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("truncate text-[13px] font-bold", SIDE_TEXT[side])}>
          @{d.account}
        </span>
        {net != null && (
          <span className="text-[11px] tabular-nums">
            <span className="text-slate-400 dark:text-slate-500">
              {t("compare.rows.netHpFlow")}{" "}
            </span>
            <span className={cn("font-bold", netColor)}>
              {net >= 0 ? "+" : ""}
              {formatCompareValue(net, "hp", locale)}
            </span>
          </span>
        )}
      </div>
      {d.vestingUnavailable ? (
        <div className="py-2 text-center text-xs italic text-slate-400 dark:text-slate-500">
          {t("compare.unavailable")}
        </div>
      ) : (
        <>
          <FlowBar
            label={t("compare.rows.poweredUp")}
            value={d.poweredUpHp}
            max={max}
            color="bg-emerald-500"
            locale={locale}
          />
          <FlowBar
            label={t("compare.rows.powerDown")}
            value={d.powerDownHp}
            max={max}
            color="bg-rose-500"
            locale={locale}
          />
        </>
      )}
    </div>
  );
};

interface ComparePowerFlowProps {
  a: CompareAccountData;
  b: CompareAccountData;
  locale: string;
  t: (k: string) => string;
}

const ComparePowerFlow: React.FC<ComparePowerFlowProps> = ({
  a,
  b,
  locale,
  t,
}) => {
  const vals = [
    a.poweredUpHp,
    a.powerDownHp,
    b.poweredUpHp,
    b.powerDownHp,
  ].filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  const max = Math.max(0, ...vals);

  return (
    <CompareChartPanel
      title={t("compare.flow.title")}
      subtitle={t("compare.flow.subtitle")}
      icon={Zap}
      iconColor="text-violet-500"
    >
      <div className="space-y-4">
        <FlowGroup d={a} side="a" max={max} locale={locale} t={t} />
        <FlowGroup d={b} side="b" max={max} locale={locale} t={t} />
      </div>
    </CompareChartPanel>
  );
};

export default ComparePowerFlow;
