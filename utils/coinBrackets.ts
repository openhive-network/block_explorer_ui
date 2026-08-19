// Canonical balance brackets shared by the HP Distribution card and the Top
// Holders quick-range chips for every coin. The bucket labels mirror the API's
// HP bucketing, so keep them in sync.
export interface CoinBracket {
  bucket: string; // matches NetworkHpDistributionResponse.bucket
  chip: string; // compact chip label
  min: number; // lower bound (inclusive)
  max: number | null; // upper bound (exclusive); null = open-ended top
}

export const COIN_BRACKETS: CoinBracket[] = [
  { bucket: "0-1 HP", chip: "0–1", min: 0, max: 1 },
  { bucket: "1-10 HP", chip: "1–10", min: 1, max: 10 },
  { bucket: "10-100 HP", chip: "10–100", min: 10, max: 100 },
  { bucket: "100-1K HP", chip: "100–1K", min: 100, max: 1_000 },
  { bucket: "1K-10K HP", chip: "1K–10K", min: 1_000, max: 10_000 },
  { bucket: "10K-100K HP", chip: "10K–100K", min: 10_000, max: 100_000 },
  { bucket: "100K-1M HP", chip: "100K–1M", min: 100_000, max: 1_000_000 },
  { bucket: "1M+ HP", chip: "1M+", min: 1_000_000, max: null },
];

export const COIN_BRACKET_BY_BUCKET: Record<string, CoinBracket> =
  COIN_BRACKETS.reduce<Record<string, CoinBracket>>((acc, b) => {
    acc[b.bucket] = b;
    return acc;
  }, {});

// Bucket label for a given amount (mirrors the API's bucketing).
export const coinToBucket = (amount: number): string => {
  const found = COIN_BRACKETS.find(
    (b) => amount >= b.min && (b.max === null || amount < b.max)
  );
  return found ? found.bucket : COIN_BRACKETS[COIN_BRACKETS.length - 1].bucket;
};
