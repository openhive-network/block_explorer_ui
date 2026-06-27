/**
 * Least-squares linear regression trend over a value series.
 * Returns % change of the fitted line from first to last point.
 * Robust to single-period outliers; returns null when underdetermined.
 */
export const computeTrend = (values: number[]): number | null => {
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
  if (denom === 0) return 0;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  if (intercept <= 0) return null;
  return ((slope * (n - 1)) / intercept) * 100;
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
