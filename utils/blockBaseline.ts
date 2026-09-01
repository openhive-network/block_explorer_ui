// A median against a recent window, not a trend: computeTrendPct measures
// direction over a series, whereas this asks whether a page is busier than usual.

interface DailyRow {
  value: number;
  last_block_num: number;
}

export interface PerBlockBaseline {
  median: number;
  days: number;
}

export const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Blocks per day comes from consecutive day-end block numbers, so missed slots
// are counted out; assuming 28,800 slots a day overstates it.
export const computePerBlockBaseline = (
  rows: DailyRow[] | undefined
): PerBlockBaseline | null => {
  if (!rows || rows.length < 2) return null;

  const ordered = [...rows].sort((a, b) => a.last_block_num - b.last_block_num);
  const perDay: number[] = [];

  for (let i = 1; i < ordered.length; i++) {
    const blocks = ordered[i].last_block_num - ordered[i - 1].last_block_num;
    const value = ordered[i].value;
    if (blocks <= 0 || !Number.isFinite(value)) continue;
    perDay.push(value / blocks);
  }

  const value = median(perDay);
  if (value === null) return null;

  return { median: Math.round(value * 10) / 10, days: perDay.length };
};

export const baselineDeltaPct = (
  value: number,
  baseline: number | null | undefined
): number | null => {
  if (!baseline || !Number.isFinite(baseline) || !Number.isFinite(value)) {
    return null;
  }
  return Math.round(((value - baseline) / baseline) * 1000) / 10;
};
