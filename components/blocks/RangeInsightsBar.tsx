import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CircleSlash,
  Flame,
  Layers,
  Loader2,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import StatCard from "@/components/ui/StatCard";
import SegmentedToggle from "@/components/ui/SegmentedToggle";
import { cn } from "@/lib/utils";
import {
  getLocalStorage,
  scopedStorageKey,
  setLocalStorage,
} from "@/utils/LocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import {
  NON_VIRTUAL_BUCKET_ORDER,
  OP_BUCKET_COLORS,
  bucketSharePercentages,
  orderBucketsByShare,
  totalBucketed,
  type OpBucket,
} from "@/utils/operationBuckets";
import {
  computeRangeStats,
  filterSpanSeconds,
  hasRangeEndpointBounds,
  isWideRange,
  type BlockStatsRow,
} from "@/utils/blockRangeStats";
import useBlockRangeEndpointStats from "@/hooks/api/blocks/useBlockRangeEndpointStats";
import useTrxPerBlockBaseline from "@/hooks/api/blocks/useTrxPerBlockBaseline";
import { baselineDeltaPct } from "@/utils/blockBaseline";
import { useI18n } from "@/i18n/i18n";
import OpBucketBar, { bucketLabelKey } from "./OpBucketBar";

type Scope = "page" | "range";

const SCOPE_STORAGE_KEY = "blocks_insights_scope";

interface RangeInsightsBarProps {
  rows: BlockStatsRow[];
  paramsState: any;
  className?: string;
}

const RangeInsightsBar: React.FC<RangeInsightsBarProps> = ({
  rows,
  paramsState,
  className,
}) => {
  const { t, locale } = useI18n();
  const { username } = useAuth();
  const [scope, setScope] = useState<Scope>("page");

  const storageKey = scopedStorageKey(SCOPE_STORAGE_KEY, username);

  // Read after mount so server and first client paint agree.
  useEffect(() => {
    const stored = getLocalStorage(storageKey, true);
    if (stored === "page" || stored === "range") setScope(stored);
  }, [storageKey]);

  const changeScope = (next: Scope) => {
    setScope(next);
    setLocalStorage(storageKey, next);
  };

  const pageStats = useMemo(() => computeRangeStats(rows), [rows]);

  const newestEmptyBlock = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.block_num - a.block_num)
        .find((row) => !row.trx_count)?.block_num ?? null,
    [rows]
  );

  const spanSeconds = useMemo(
    () => filterSpanSeconds(paramsState ?? {}),
    [paramsState]
  );
  const wideRangeActive =
    isWideRange(spanSeconds) && hasRangeEndpointBounds(paramsState ?? {});

  const { endpointStats, isEndpointStatsLoading, isEndpointStatsUnavailable } =
    useBlockRangeEndpointStats(paramsState, wideRangeActive);

  const canShowRange = wideRangeActive && !isEndpointStatsUnavailable;
  const activeScope: Scope = canShowRange ? scope : "page";

  const { baseline, baselineDays } = useTrxPerBlockBaseline();
  const pageTrxPerBlock = pageStats.blockCount
    ? pageStats.totalTransactions / pageStats.blockCount
    : 0;
  const trxDelta = baselineDeltaPct(pageTrxPerBlock, baseline?.median);

  const num = (value: number) => value.toLocaleString(locale);

  const buckets: Record<OpBucket, number> =
    activeScope === "range" && endpointStats
      ? endpointStats.buckets
      : pageStats.buckets;

  // Non-virtual only, matching the per-row bar in the Operations column.
  const compositionTotal = totalBucketed(buckets, NON_VIRTUAL_BUCKET_ORDER);
  const legend = orderBucketsByShare(buckets, NON_VIRTUAL_BUCKET_ORDER);
  const legendShares = bucketSharePercentages(buckets, legend);

  const rangeDays = Math.max(1, Math.round((spanSeconds ?? 0) / 86400));
  const spanLabel =
    activeScope === "range"
      ? rangeDays === 1
        ? t("blocksPage.insights.rangeSpanOne")
        : t("blocksPage.insights.rangeSpan", { days: rangeDays })
      : t("blocksPage.insights.pageSpan", { blocks: pageStats.blockCount });

  if (!rows.length) return null;

  const tiles =
    activeScope === "range" && endpointStats
      ? [
          {
            key: "transactions",
            icon: <Receipt size={16} />,
            label: t("blocksPage.insights.transactions"),
            value: num(endpointStats.totalTransactions),
          },
          {
            key: "operations",
            icon: <Layers size={16} />,
            label: t("blocksPage.insights.operations"),
            value: num(endpointStats.totalOperations),
          },
          {
            key: "virtual",
            icon: <Sparkles size={16} />,
            label: t("blocksPage.insights.virtualOperations"),
            value: num(endpointStats.virtualOperations),
          },
        ]
      : [
          {
            key: "transactions",
            icon: <Receipt size={16} />,
            label: t("blocksPage.insights.transactions"),
            value: (
              <span className="flex items-baseline gap-1.5">
                {num(pageStats.totalTransactions)}
                {trxDelta !== null ? (
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      trxDelta > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-explorer-light-gray"
                    )}
                    data-testid="trx-baseline-delta"
                  >
                    {trxDelta > 0 ? "↑" : trxDelta < 0 ? "↓" : ""}
                    {Math.abs(trxDelta)}%
                  </span>
                ) : null}
              </span>
            ),
            tooltip:
              trxDelta !== null && baseline
                ? t("blocksPage.insights.trxBaseline", {
                    rate: pageTrxPerBlock.toFixed(1),
                    median: baseline.median.toLocaleString(locale),
                    days: baselineDays,
                  })
                : undefined,
          },
          {
            key: "operations",
            icon: <Layers size={16} />,
            label: t("blocksPage.insights.operations"),
            value: num(pageStats.totalOperations),
          },
          {
            key: "virtual",
            icon: <Sparkles size={16} />,
            label: t("blocksPage.insights.virtualOperations"),
            value: num(pageStats.virtualOperations),
          },
          {
            key: "producers",
            icon: <Users size={16} />,
            label: t("blocksPage.insights.producers"),
            value: num(pageStats.uniqueProducers),
          },
          {
            key: "avg",
            icon: <Activity size={16} />,
            label: t("blocksPage.insights.avgOpsPerBlock"),
            value: pageStats.avgOpsPerBlock.toLocaleString(locale),
          },
          {
            key: "busiest",
            icon: <Flame size={16} />,
            label: t("blocksPage.insights.busiestBlock"),
            value: pageStats.busiestBlock ? (
              <Link
                href={`/block/${pageStats.busiestBlock.blockNum}`}
                className="text-link"
              >
                {num(pageStats.busiestBlock.blockNum)}
              </Link>
            ) : (
              "-"
            ),
            tooltip: pageStats.busiestBlock
              ? t("blocksPage.insights.busiestBlockTooltip", {
                  count: num(pageStats.busiestBlock.operationCount),
                })
              : undefined,
          },
          {
            key: "empty",
            icon: <CircleSlash size={16} />,
            label: t("blocksPage.insights.emptyBlocks"),
            value: newestEmptyBlock ? (
              <Link href={`/block/${newestEmptyBlock}`} className="text-link">
                {num(pageStats.emptyBlocks)}
              </Link>
            ) : (
              num(pageStats.emptyBlocks)
            ),
            tooltip: newestEmptyBlock
              ? t("blocksPage.insights.emptyBlocksLinkTooltip", {
                  block: num(newestEmptyBlock),
                })
              : t("blocksPage.insights.emptyBlocksTooltip"),
          },
        ];

  return (
    <div className={cn(className)} data-testid="range-insights">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span
          className="text-xs font-medium text-explorer-light-gray dark:text-gray-300"
          data-testid="range-insights-span"
        >
          {spanLabel}
        </span>
        {canShowRange ? (
          <SegmentedToggle<Scope>
            options={[
              { value: "page", label: t("blocksPage.insights.scopePage") },
              { value: "range", label: t("blocksPage.insights.scopeRange") },
            ]}
            value={activeScope}
            onChange={changeScope}
            ariaLabel={t("blocksPage.insights.scopeLabel")}
          />
        ) : null}
      </div>

      {activeScope === "range" && isEndpointStatsLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-explorer-light-gray" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
            {tiles.map((tile) => (
              <StatCard
                key={tile.key}
                icon={tile.icon}
                label={tile.label}
                value={tile.value}
                tooltipContent={(tile as any).tooltip}
              />
            ))}
          </div>
          {compositionTotal > 0 && legend.length > 1 ? (
            <div className="mt-3">
              <OpBucketBar buckets={buckets} order={legend} className="h-2" />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {legend.map((bucket) => (
                  <span
                    key={bucket}
                    className="flex items-center gap-1.5 text-[11px] text-explorer-light-gray dark:text-gray-300"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-[2px]"
                      style={{ backgroundColor: OP_BUCKET_COLORS[bucket] }}
                    />
                    {t(bucketLabelKey(bucket))}
                    <span className="font-medium text-explorer-dark-gray dark:text-white">
                      {legendShares[bucket] ?? 0}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default RangeInsightsBar;
