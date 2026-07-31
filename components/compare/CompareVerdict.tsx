import React from "react";
import { Trophy } from "lucide-react";
import { CompareSection, Side } from "@/utils/compare/types";
import { buildVerdict } from "@/utils/compare/scoring";

const SIDE: Record<Side, string> = {
  a: "text-red-600 dark:text-red-400",
  b: "text-blue-600 dark:text-blue-400",
};

interface CompareVerdictProps {
  a: string;
  b: string;
  sections: CompareSection[];
  t: (k: string) => string;
}

// One-line story under the value duel: who leads overall, plus each side's
// strongest section — all derived from the same tallies behind the Score.
const CompareVerdict: React.FC<CompareVerdictProps> = ({
  a,
  b,
  sections,
  t,
}) => {
  const v = buildVerdict(sections);
  const sectionName = (id: string | null): string | null => {
    const s = id ? sections.find((x) => x.id === id) : null;
    return s ? t(s.titleKey) : null;
  };
  const leaderBest = sectionName(v.leaderBestSectionId);
  const challengerBest = sectionName(v.challengerBestSectionId);
  const otherSide: Side = v.leader === "a" ? "b" : "a";

  const score = (
    <>
      <b className={SIDE.a}>{v.aWins}</b>
      <span className="mx-0.5 text-slate-300 dark:text-slate-600">–</span>
      <b className={SIDE.b}>{v.bWins}</b>
    </>
  );

  const takes = (side: Side, name: string, section: string) => (
    <span className="text-slate-400 dark:text-slate-500">
      {" · "}
      <b className={SIDE[side]}>@{name}</b> {t("compare.verdict.takes")}{" "}
      <b className="text-slate-600 dark:text-slate-300">{section}</b>
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-slate-100 bg-gradient-to-r from-amber-50/70 to-transparent px-3 py-2.5 text-[13px] dark:border-slate-800 dark:from-amber-950/20 sm:px-5">
      <Trophy className="h-4 w-4 flex-shrink-0 text-amber-500" />
      {v.leader ? (
        <>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            <b className={SIDE[v.leader]}>@{v.leader === "a" ? a : b}</b>{" "}
            {t("compare.verdict.leads")} {score}
          </span>
          {leaderBest && (
            <span className="text-slate-400 dark:text-slate-500">
              {" · "}
              {t("compare.verdict.strongestIn")}{" "}
              <b className="text-slate-600 dark:text-slate-300">{leaderBest}</b>
            </span>
          )}
          {challengerBest &&
            takes(otherSide, otherSide === "a" ? a : b, challengerBest)}
        </>
      ) : (
        <>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {t("compare.verdict.tie")} {score}
          </span>
          {leaderBest && takes("a", a, leaderBest)}
          {challengerBest && takes("b", b, challengerBest)}
        </>
      )}
    </div>
  );
};

export default CompareVerdict;
