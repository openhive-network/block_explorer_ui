import React from "react";

import { cn } from "@/lib/utils";
import {
  OP_BUCKET_COLORS,
  OP_BUCKET_ORDER,
  type OpBucket,
} from "@/utils/operationBuckets";
import { useI18n } from "@/i18n/i18n";

interface OpBucketBarProps {
  buckets: Record<OpBucket, number>;
  order?: readonly OpBucket[];
  className?: string;
  barClassName?: string;
}

export const bucketLabelKey = (bucket: OpBucket) =>
  `blocksPage.opBucket.${bucket}`;

const OpBucketBar: React.FC<OpBucketBarProps> = ({
  buckets,
  order = OP_BUCKET_ORDER,
  className,
  barClassName,
}) => {
  const { t } = useI18n();

  const shown = order.filter((bucket) => buckets[bucket] > 0);
  // Over the requested order only: the Operations cell passes the non-virtual
  // buckets, so summing all six would not match the number beside it.
  const total = order.reduce((sum, bucket) => sum + (buckets[bucket] ?? 0), 0);

  if (!total) {
    return (
      <span
        className={cn("block h-1.5 w-full rounded-full bg-rowOdd", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className={cn("flex h-1.5 w-full gap-[2px]", className)}
      role="img"
      aria-label={shown
        .map((bucket) => `${t(bucketLabelKey(bucket))} ${buckets[bucket]}`)
        .join(", ")}
    >
      {shown.map((bucket, index) => (
        <span
          key={bucket}
          className={cn(
            "block h-full",
            index === 0 && "rounded-s-full",
            index === shown.length - 1 && "rounded-e-full",
            barClassName
          )}
          style={{
            width: `${(buckets[bucket] / total) * 100}%`,
            backgroundColor: OP_BUCKET_COLORS[bucket],
          }}
        />
      ))}
    </span>
  );
};

export default OpBucketBar;
