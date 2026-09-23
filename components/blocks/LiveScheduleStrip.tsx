import React from "react";
import Link from "next/link";
import { Radio } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import LiveBeacon from "@/components/ui/LiveBeacon";
import useNextScheduledWitness from "@/hooks/api/blocks/useNextScheduledWitness";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { isFollowingHead } from "@/utils/nextScheduledWitness";
import {
  JUST_ARRIVED_ACCENT,
  JUST_ARRIVED_SURFACE,
} from "@/utils/liveHighlight";
import { useI18n } from "@/i18n/i18n";

interface LiveScheduleStripProps {
  // The newest row the table is showing.
  latestBlockNumber?: number;
  latestProducer?: string;
  isLive: boolean;
  className?: string;
}

// Styled as the top row of the panel the block navigation heads, not as a card
// of its own: two separately rounded boxes left a notch where they met.
const LiveScheduleStrip: React.FC<LiveScheduleStripProps> = ({
  latestBlockNumber,
  latestProducer,
  isLive,
  className,
}) => {
  const { t, locale } = useI18n();
  const { headBlockNumberData } = useHeadBlockNumber();

  // While the table sits at the head it is the anchor, so the strip and the rows
  // beneath it always agree. Paged back into history it cannot be, so the strip
  // falls back to the live head rather than naming a block from last week.
  const followingHead = isFollowingHead(headBlockNumberData, latestBlockNumber);
  const { headBlockData } = useHeadBlock(
    isLive && !followingHead ? headBlockNumberData : undefined
  );

  const blockNumber = followingHead
    ? latestBlockNumber
    : headBlockData?.block_num;
  const producer = followingHead
    ? latestProducer
    : headBlockData?.producer_account;

  const { nextWitness } = useNextScheduledWitness(
    isLive,
    producer,
    blockNumber
  );

  if (!isLive) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 text-xs",
        "bg-white dark:bg-slate-800",
        "border-b border-slate-200 dark:border-slate-700",
        className
      )}
      data-testid="live-schedule-strip"
    >
      <span className="flex items-center gap-1.5 text-explorer-light-gray dark:text-gray-300">
        <Radio size={13} className="animate-pulse text-emerald-500" />
        {t("blocksPage.liveSchedule.nextScheduled")}
        {nextWitness ? (
          <Link
            href={`/@${nextWitness}`}
            className="font-medium text-link"
            data-testid="next-scheduled-witness"
          >
            {nextWitness}
          </Link>
        ) : (
          <span className="text-explorer-light-gray">-</span>
        )}
      </span>

      <span className="flex items-center gap-1.5 text-explorer-light-gray dark:text-gray-300">
        {t("blocksPage.liveSchedule.lastProducedBlock")}
        {blockNumber ? (
          // The same object as a row that just landed, shrunk to inline size:
          // seeing it here and in the table is what explains the colour.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/block/${blockNumber}`}
                  className={cn(
                    "flex items-center gap-1.5 rounded-sm border-s-2 px-1.5 py-0.5",
                    "font-medium tabular-nums text-link",
                    JUST_ARRIVED_SURFACE,
                    JUST_ARRIVED_ACCENT
                  )}
                  data-testid="last-produced-block"
                >
                  <LiveBeacon
                    label={t("blocksPage.liveSchedule.justArrived")}
                  />
                  {blockNumber.toLocaleString(locale)}
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-theme text-text max-w-xs p-2 text-xs font-normal">
                {t("blocksPage.liveSchedule.arrivalHint")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-explorer-light-gray">-</span>
        )}
      </span>
    </div>
  );
};

export default LiveScheduleStrip;
