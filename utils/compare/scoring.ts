import { CompareRow, CompareSection, Winner } from "./types";

// Values equal within this tolerance count as a tie (guards float noise).
const EPS = 1e-9;

const hasValue = (v: number | null): v is number => v !== null && isFinite(v);

const comparable = (row: CompareRow): boolean => {
  if (!row.scored || row.unavailable) return false;
  if (row.nullMeansWorst) return hasValue(row.aValue) || hasValue(row.bValue);
  return hasValue(row.aValue) && hasValue(row.bValue);
};

// Winner of a single row, honoring scored / lowerWins / ties / missing data.
export const winnerOf = (row: CompareRow): Winner => {
  if (!comparable(row)) return null;
  const aHas = hasValue(row.aValue);
  const bHas = hasValue(row.bValue);
  if (!aHas || !bHas) return aHas ? "a" : "b";
  const a = row.aValue as number;
  const b = row.bValue as number;
  if (Math.abs(a - b) <= EPS) return "tie";
  const aWins = row.lowerWins ? a < b : a > b;
  return aWins ? "a" : "b";
};

// Delta as a "larger ÷ smaller" ratio, e.g. "2.4×"; "tie" when equal; null when
// not comparable or when one side is ≤ 0 (a ratio would be undefined/misleading).
export const deltaRatio = (row: CompareRow): string | null => {
  if (row.aValue === null || row.bValue === null) return null;
  const a = row.aValue;
  const b = row.bValue;
  if (!isFinite(a) || !isFinite(b)) return null;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (hi - lo <= EPS) return "tie";
  if (lo <= 0) return null;
  const r = hi / lo;
  if (r >= 10) return `${Math.round(r)}×`;
  const rounded = r.toFixed(1);
  // "1.0×" would claim parity next to a winner caret (reputation 80 vs 79).
  return rounded === "1.0" ? null : `${rounded}×`;
};

// Twin sparkbar widths (0..1). The bar encodes "better", not "bigger", so on a
// lowerWins row it inverts and never contradicts the winner caret.
export const sparkScale = (row: CompareRow): { a: number; b: number } => {
  const av = row.aValue;
  const bv = row.bValue;
  if (!hasValue(av) || !hasValue(bv)) {
    // Otherwise no bars: coercing a missing side to 0 would, on a lowerWins row,
    // draw a full "winner" bar under the side that has no value at all.
    if (row.nullMeansWorst && (hasValue(av) || hasValue(bv)))
      return { a: hasValue(av) ? 1 : 0, b: hasValue(bv) ? 1 : 0 };
    return { a: 0, b: 0 };
  }
  const a = Math.abs(av);
  const b = Math.abs(bv);
  if (row.lowerWins) {
    const min = Math.min(a, b);
    if (min <= 0) return { a: a <= 0 ? 1 : 0, b: b <= 0 ? 1 : 0 };
    return { a: min / a, b: min / b };
  }
  const max = Math.max(a, b);
  if (max <= 0) return { a: 0, b: 0 };
  return { a: a / max, b: b / max };
};

// Rows won per section (ties and unscored rows count for neither side).
export const sectionWins = (
  section: CompareSection
): { a: number; b: number } => {
  let a = 0;
  let b = 0;
  for (const row of section.rows) {
    const w = winnerOf(row);
    if (w === "a") a += 1;
    else if (w === "b") b += 1;
  }
  return { a, b };
};

// Overall row-race across every section.
export const overallWins = (
  sections: CompareSection[]
): { a: number; b: number } =>
  sections.reduce(
    (acc, s) => {
      const { a, b } = sectionWins(s);
      return { a: acc.a + a, b: acc.b + b };
    },
    { a: 0, b: 0 }
  );

// Each account's share of a section's Score — its rows won ÷ decisive rows,
// 0..1 summing to 1. This is the radar/fingerprint axis, so the shape always
// agrees with the section's Score pill. No decisive rows → even (0.5/0.5).
export const sectionStrength = (
  section: CompareSection
): { a: number; b: number } => {
  // No comparable rows (e.g. a node-gated section) is "no data", not a tie — sit
  // at the centre so the radar doesn't paint a confident 50/50 over missing data.
  const decisive = section.rows.filter(comparable).length;
  if (decisive === 0) return { a: 0, b: 0 };
  const { a, b } = sectionWins(section);
  const total = a + b;
  if (total === 0) return { a: 0.5, b: 0.5 }; // all ties → genuinely even
  return { a: a / total, b: b / total };
};

export interface CompareVerdict {
  leader: "a" | "b" | null; // null = overall tie
  aWins: number;
  bWins: number;
  // Section the leader dominates most / the strongest section for each side.
  leaderBestSectionId: string | null;
  challengerBestSectionId: string | null;
}

// A one-line story from the tallies: who leads overall, and each side's best
// section (biggest row-win margin).
export const buildVerdict = (sections: CompareSection[]): CompareVerdict => {
  const overall = overallWins(sections);
  const leader =
    overall.a > overall.b ? "a" : overall.b > overall.a ? "b" : null;
  const other = leader === "a" ? "b" : leader === "b" ? "a" : null;

  const bestFor = (side: "a" | "b"): string | null => {
    let bestId: string | null = null;
    let bestMargin = 0;
    for (const s of sections) {
      const w = sectionWins(s);
      const margin = side === "a" ? w.a - w.b : w.b - w.a;
      if (margin > bestMargin) {
        bestMargin = margin;
        bestId = s.id;
      }
    }
    return bestId;
  };

  return {
    leader,
    aWins: overall.a,
    bWins: overall.b,
    leaderBestSectionId: bestFor(leader ?? "a"),
    challengerBestSectionId: bestFor(other ?? "b"),
  };
};
