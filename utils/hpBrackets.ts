// Canonical HP-distribution brackets shared by the HP Distribution card and the
// Top Holders quick-range chips. Keep in sync with the API's bucketing.
export interface HpBracket {
  bucket: string; // matches NetworkHpDistributionResponse.bucket
  chip: string; // compact chip label
  min: number; // HP lower bound (inclusive)
  max: number | null; // HP upper bound (exclusive); null = open-ended top
}

export const HP_BRACKETS: HpBracket[] = [
  { bucket: "0-1 HP", chip: "0–1", min: 0, max: 1 },
  { bucket: "1-10 HP", chip: "1–10", min: 1, max: 10 },
  { bucket: "10-100 HP", chip: "10–100", min: 10, max: 100 },
  { bucket: "100-1K HP", chip: "100–1K", min: 100, max: 1_000 },
  { bucket: "1K-10K HP", chip: "1K–10K", min: 1_000, max: 10_000 },
  { bucket: "10K-100K HP", chip: "10K–100K", min: 10_000, max: 100_000 },
  { bucket: "100K-1M HP", chip: "100K–1M", min: 100_000, max: 1_000_000 },
  { bucket: "1M+ HP", chip: "1M+", min: 1_000_000, max: null },
];

export const HP_BRACKET_BY_BUCKET: Record<string, HpBracket> =
  HP_BRACKETS.reduce<Record<string, HpBracket>>((acc, b) => {
    acc[b.bucket] = b;
    return acc;
  }, {});

// Bucket label for a given HP amount (mirrors the API's bucketing).
export const hpToBucket = (hp: number): string => {
  const found = HP_BRACKETS.find(
    (b) => hp >= b.min && (b.max === null || hp < b.max)
  );
  return found ? found.bucket : HP_BRACKETS[HP_BRACKETS.length - 1].bucket;
};
