import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import {
  OP_BUCKET_COLORS,
  orderBucketsByShare,
  type OpBucket,
} from "@/utils/operationBuckets";
import { useI18n } from "@/i18n/i18n";
import OpBucketBar, { bucketLabelKey } from "./OpBucketBar";

interface BlockOpsCellProps {
  buckets: Record<OpBucket, number>;
  order: readonly OpBucket[];
  total: number;
  showBar?: boolean;
}

const BlockOpsCell: React.FC<BlockOpsCellProps> = ({
  buckets,
  order,
  total,
  showBar = true,
}) => {
  const { t, locale } = useI18n();

  const rows = orderBucketsByShare(buckets, order);

  if (!total) {
    return <span className="text-explorer-light-gray">0</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex min-w-[4.5rem] cursor-pointer flex-col items-end gap-1">
            <span className="tabular-nums">{total.toLocaleString(locale)}</span>
            {showBar ? <OpBucketBar buckets={buckets} order={order} /> : null}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-theme text-text p-3">
          <div className="flex flex-col gap-1">
            {rows.map((bucket) => (
              <div
                key={bucket}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-[2px]"
                    style={{ backgroundColor: OP_BUCKET_COLORS[bucket] }}
                  />
                  {t(bucketLabelKey(bucket))}
                </span>
                <span className="font-medium">
                  {buckets[bucket].toLocaleString(locale)}
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockOpsCell;
