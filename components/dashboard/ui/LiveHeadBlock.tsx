import React from "react";
import { Box, Clock } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import LiveDataToggle from "./LiveDataToggle";
import { cn } from "@/lib/utils";
import { formatBlockchainTime } from "@/utils/TimeUtils";

interface LiveHeadBlockProps {
  headBlock?: number;
  dotClass: string;
  /** Tints the block and clock glyphs with the board's accent. */
  glyphClass?: string;
  showLiveData?: boolean;
  showBlockNumber?: boolean;
  blockTime?: string;
  // Guests move the switch up beside the title on a phone.
  hideToggleOnMobile?: boolean;
}

const LiveHeadBlock: React.FC<LiveHeadBlockProps> = ({
  headBlock,
  dotClass,
  glyphClass,
  showLiveData = true,
  showBlockNumber = true,
  blockTime,
  hideToggleOnMobile = false,
}) => {
  const { locale } = useI18n();
  const { settings } = useSettings();

  if (typeof headBlock !== "number" || headBlock <= 0) return null;

  const clock = formatBlockchainTime(blockTime);
  if (!showBlockNumber && !clock && !showLiveData) return null;

  const glyph = cn(
    "shrink-0",
    glyphClass || "text-gray-400 dark:text-gray-500"
  );
  const row = "flex items-center gap-1.5 tabular-nums leading-none";

  // On a phone this is one strip across the width, block number and clock at
  // either end; on desktop it stacks in the corner.
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1 sm:w-auto sm:flex-col sm:items-end sm:gap-1.5 sm:py-0">
      {showBlockNumber && (
        <span
          className={cn(
            row,
            "text-sm font-semibold text-gray-800 dark:text-gray-100"
          )}
        >
          <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
            <Box size={14} className={glyph} aria-hidden="true" />
            <span
              className={cn(
                "absolute -end-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-theme",
                settings.liveData
                  ? cn("animate-pulse motion-reduce:animate-none", dotClass)
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              aria-hidden="true"
            />
          </span>
          {headBlock.toLocaleString(locale)}
        </span>
      )}

      {clock && (
        <span
          className={cn(
            row,
            "text-[11px] font-medium text-gray-500 dark:text-gray-400"
          )}
        >
          <Clock size={14} className={glyph} aria-hidden="true" />
          {clock}
        </span>
      )}

      {showLiveData && (
        <LiveDataToggle
          className={cn(
            "ms-auto sm:ms-0",
            hideToggleOnMobile && "hidden sm:flex"
          )}
        />
      )}
    </div>
  );
};

export default LiveHeadBlock;
