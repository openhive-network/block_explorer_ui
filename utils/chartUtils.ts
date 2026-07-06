const linearRegression = (
  values: number[]
): { slope: number; intercept: number } | null => {
  const n = values.length;
  if (n < 2) return null;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

/** Returns the fitted regression line as one value per input point (for plotting). */
export const computeTrendLine = (values: number[]): number[] => {
  const reg = linearRegression(values);
  if (!reg) return values.map(() => 0);
  return values.map((_, i) => reg.slope * i + reg.intercept);
};

/** Returns % change of the fitted line across the window (for KPI display). */
export const computeTrendPct = (values: number[]): number | null => {
  const n = values.length;
  const reg = linearRegression(values);
  if (!reg || !Number.isFinite(reg.intercept) || reg.intercept <= 0)
    return null;
  return ((reg.slope * (n - 1)) / reg.intercept) * 100;
};

/** Returns the mean of an array of nullable numbers, or null if no non-null values. */
export const computeAvg = (vals: (number | null)[]): number | null => {
  const nonNull = vals.filter((v): v is number => v !== null);
  return nonNull.length
    ? nonNull.reduce((s, v) => s + v, 0) / nonNull.length
    : null;
};

/**
 * Locale-aware compact number formatter for chart axes and tooltips.
 * Handles negative values; tiers: B ≥ 1B, M ≥ 1M, K ≥ 1K, else raw integer.
 */
export const formatCompact = (n: number, locale: string): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000)
    return (
      sign +
      (abs / 1_000_000_000).toLocaleString(locale, {
        maximumFractionDigits: 2,
      }) +
      "B"
    );
  if (abs >= 1_000_000)
    return (
      sign +
      (abs / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 2 }) +
      "M"
    );
  if (abs >= 1_000)
    return (
      sign +
      (abs / 1_000).toLocaleString(locale, { maximumFractionDigits: 1 }) +
      "K"
    );
  return n.toLocaleString(locale, { maximumFractionDigits: 0 });
};

export const formatLocalePercent = (value: number, locale: string): string =>
  (value / 100).toLocaleString(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
