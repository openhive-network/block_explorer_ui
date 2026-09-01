export type OpBucket =
  | "other"
  | "virtual"
  | "comment"
  | "custom"
  | "vote"
  | "transfer";

// Bottom-to-top stacking order; changing it reorders every bucket bar.
export const OP_BUCKET_ORDER: readonly OpBucket[] = [
  "other",
  "virtual",
  "comment",
  "custom",
  "vote",
  "transfer",
] as const;

// Mirrors the theme's --color-operation-* variables. A product decision:
// do not re-pick these values.
export const OP_BUCKET_COLORS: Record<OpBucket, string> = {
  vote: "#fb5607", // --color-operation-curation
  comment: "#ffbe0b", // --color-operation-posting
  custom: "#e63946", // --color-operation-custom
  other: "#3a86ff", // --color-operation-other
  transfer: "#8338ec", // --color-operation-transfer
  virtual: "#b010bf", // --color-operation-account-management
};

// Virtual ops have their own column; composition bars show protocol ops only.
export const NON_VIRTUAL_BUCKET_ORDER: readonly OpBucket[] =
  OP_BUCKET_ORDER.filter((bucket) => bucket !== "virtual");

export const VIRTUAL_OP_ID_FLOOR = 50;

const BUCKET_BY_OP_ID: Record<number, OpBucket> = {
  0: "vote",
  1: "comment",
  2: "transfer",
  18: "custom",
};

interface OperationCount {
  op_type_id: number;
  op_count: number;
}

export const emptyBuckets = (): Record<OpBucket, number> => ({
  other: 0,
  virtual: 0,
  comment: 0,
  custom: 0,
  vote: 0,
  transfer: 0,
});

export const opTypeBucket = (
  opTypeId: number,
  isVirtual?: boolean
): OpBucket => {
  if (isVirtual ?? opTypeId >= VIRTUAL_OP_ID_FLOOR) return "virtual";
  return BUCKET_BY_OP_ID[opTypeId] ?? "other";
};

export const bucketOperations = (
  operations: OperationCount[] | undefined,
  isVirtual?: (opTypeId: number) => boolean | undefined
): Record<OpBucket, number> => {
  const buckets = emptyBuckets();
  if (!operations) return buckets;

  for (const op of operations) {
    const bucket = opTypeBucket(op.op_type_id, isVirtual?.(op.op_type_id));
    buckets[bucket] += op.op_count ?? 0;
  }
  return buckets;
};

export const totalBucketed = (
  buckets: Record<OpBucket, number>,
  order: readonly OpBucket[] = OP_BUCKET_ORDER
): number => order.reduce((sum, bucket) => sum + (buckets[bucket] ?? 0), 0);

// Largest remainder, so the shares sum to exactly 100 rather than 99 or 101.
export const bucketSharePercentages = (
  buckets: Record<OpBucket, number>,
  order: readonly OpBucket[] = OP_BUCKET_ORDER
): Partial<Record<OpBucket, number>> => {
  const shares: Partial<Record<OpBucket, number>> = {};
  const total = order.reduce((sum, bucket) => sum + (buckets[bucket] ?? 0), 0);
  if (!total) return shares;

  const exact = order.map((bucket) => ({
    bucket,
    value: ((buckets[bucket] ?? 0) / total) * 100,
  }));

  let assigned = 0;
  for (const entry of exact) {
    const floored = Math.floor(entry.value);
    shares[entry.bucket] = floored;
    assigned += floored;
  }

  const byRemainder = [...exact].sort((a, b) => (b.value % 1) - (a.value % 1));
  for (let i = 0; i < 100 - assigned; i += 1) {
    const { bucket } = byRemainder[i % byRemainder.length];
    shares[bucket] = (shares[bucket] ?? 0) + 1;
  }

  return shares;
};

// Biggest share first, except "other": a residual catch-all, never a peer,
// so it always trails the named buckets.
export const orderBucketsByShare = (
  buckets: Record<OpBucket, number>,
  order: readonly OpBucket[] = OP_BUCKET_ORDER
): OpBucket[] =>
  order
    .filter((bucket) => buckets[bucket] > 0)
    .sort((a, b) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return buckets[b] - buckets[a];
    });
