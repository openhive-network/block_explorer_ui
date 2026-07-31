import React from "react";
import { Coins, Network, PenLine, Banknote, Zap } from "lucide-react";
import { CompareSection as Section } from "@/utils/compare/types";
import { sectionWins } from "@/utils/compare/scoring";
import CompareRowView from "./CompareRow";

const SECTION_ICON: Record<string, { Icon: React.ElementType; color: string }> =
  {
    wealth: { Icon: Coins, color: "text-amber-500" },
    influence: { Icon: Network, color: "text-blue-500" },
    activity: { Icon: PenLine, color: "text-emerald-500" },
    earnings: { Icon: Banknote, color: "text-rose-500" },
    resources: { Icon: Zap, color: "text-violet-500" },
  };

interface CompareSectionProps {
  section: Section;
  aAccount: string;
  bAccount: string;
  locale: string;
  t: (k: string) => string;
  rangeLabel?: string;
}

const CompareSectionView: React.FC<CompareSectionProps> = ({
  section,
  aAccount,
  bAccount,
  locale,
  t,
  rangeLabel,
}) => {
  const wins = sectionWins(section);
  const icon = SECTION_ICON[section.id];
  // Say "Unavailable" once instead of repeating it down every row.
  const allGated = section.rows.every((row) => row.unavailable);

  return (
    // scroll-mt clears BOTH the fixed navbar and the sticky who's-who bar that
    // sits under it, so the "jump to" links land on the section title, not below it.
    <section id={`compare-${section.id}`} className="mb-4 scroll-mt-[150px]">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1.5 text-[13px] font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {icon && <icon.Icon className={`h-4 w-4 ${icon.color}`} />}
          {t(section.titleKey)}
          {section.windowed && rangeLabel && (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              {rangeLabel}
            </span>
          )}
        </h3>
        {!allGated && (
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 dark:bg-slate-800">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {t("compare.score")}
            </span>
            <b className="text-sm font-extrabold text-red-600 dark:text-red-400">
              {wins.a}
            </b>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <b className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              {wins.b}
            </b>
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-theme shadow-sm dark:border-slate-700">
        {allGated ? (
          <p className="px-4 py-5 text-center text-xs italic text-slate-400 dark:text-slate-500">
            {t("compare.unavailable")}
          </p>
        ) : (
          section.rows.map((row) => (
            <CompareRowView
              key={row.id}
              row={row}
              aAccount={aAccount}
              bAccount={bAccount}
              locale={locale}
              t={t}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default CompareSectionView;
