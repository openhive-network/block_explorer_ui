import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { cn } from "@/lib/utils";
import { isContiguousRange, type SlotDelta } from "@/utils/slotGaps";
import { useI18n } from "@/i18n/i18n";

interface SlotHealthStripProps {
  deltas: SlotDelta[];
  className?: string;
}

// Status states, not categorical series; the tooltip carries an icon and label
// so the state never rests on colour alone.
const cellClass = (delta: SlotDelta): string => {
  if (delta.deltaSeconds === null) return "bg-slate-300 dark:bg-slate-600";
  if (delta.missedSlots === 0) return "bg-emerald-500";
  if (delta.missedSlots === 1) return "bg-amber-500";
  return "bg-red-500";
};

const SlotHealthStrip: React.FC<SlotHealthStripProps> = ({
  deltas,
  className,
}) => {
  const { t, locale } = useI18n();
  const router = useRouter();

  const contiguous = isContiguousRange(deltas);

  // Reversed to read oldest to newest. Unmeasurable intervals are dropped: the
  // oldest block's predecessor is on the next page, and a permanent grey cell
  // reads as a broken bar rather than as missing information.
  const timeline = useMemo(
    () => [...deltas].reverse().filter((delta) => delta.deltaSeconds !== null),
    [deltas]
  );

  const missedTotal = useMemo(
    () => deltas.reduce((sum, delta) => sum + delta.missedSlots, 0),
    [deltas]
  );

  if (!contiguous) return null;

  return (
    <div className={cn(className)} data-testid="slot-health-strip">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-explorer-light-gray dark:text-gray-300">
          {t("blocksPage.slotHealth.title")}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-explorer-light-gray dark:text-gray-300">
          {missedTotal ? (
            <>
              <AlertTriangle size={12} className="text-amber-500" />
              {t("blocksPage.slotHealth.missedSummary", {
                count: missedTotal.toLocaleString(locale),
              })}
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className="text-emerald-500" />
              {t("blocksPage.slotHealth.noMisses")}
            </>
          )}
        </span>
      </div>
      <TooltipProvider>
        {/* Transparent y-borders keep the 10px bar but give a 20px tap target. */}
        <div className="flex h-5 w-full gap-[1px] overflow-hidden rounded">
          {timeline.map((delta) => (
            <Tooltip key={delta.blockNum}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-testid="slot-health-cell"
                  aria-label={`${t("common.block")} ${delta.blockNum}`}
                  onClick={() => router.push(`/block/${delta.blockNum}`)}
                  className={cn(
                    "block h-full min-w-[2px] flex-1 border-y-[5px] border-transparent bg-clip-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500",
                    cellClass(delta)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-theme text-text p-2 text-xs">
                <div className="font-medium">
                  {t("common.block")} {delta.blockNum.toLocaleString(locale)}
                </div>
                {/* Unmeasurable is not on-time, and must not claim a green tick. */}
                <div className="flex items-center gap-1.5">
                  {delta.deltaSeconds === null ? (
                    <HelpCircle size={12} className="text-slate-400" />
                  ) : delta.missedSlots ? (
                    <AlertTriangle size={12} className="text-amber-500" />
                  ) : (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  )}
                  {delta.deltaSeconds === null
                    ? t(
                        `blocksPage.slotHealth.unknown.${delta.reason ?? "no-predecessor"}`
                      )
                    : delta.missedSlots
                      ? t("blocksPage.slotHealth.missedBefore", {
                          count: delta.missedSlots,
                        })
                      : t("blocksPage.slotHealth.onTime")}
                </div>
                {delta.deltaSeconds !== null ? (
                  <div className="text-explorer-light-gray">
                    {t("blocksPage.slotHealth.gap", {
                      seconds: delta.deltaSeconds,
                    })}
                  </div>
                ) : null}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default SlotHealthStrip;
