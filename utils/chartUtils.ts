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
