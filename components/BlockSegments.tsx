import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils"; // Assuming you use this utility for classnames
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from  "@/components/ui/hybrid-tooltip";

interface BlockSegmentsProps {
  fromBlock?: number;
  toBlock?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  loadPreviousBlocks?: () => void;
  loadNextBlocks?: () => void;
  urlParams?: any;
  className?: string;
}

const BlockSegments: React.FC<BlockSegmentsProps> = ({
  fromBlock,
  toBlock,
  hasPrevious,
  hasNext,
  loadPreviousBlocks,
  loadNextBlocks,
  urlParams,
  className,
}) => {
  const router = useRouter();

  if (!fromBlock || !toBlock) {
    return null;
  }

  // Main wrapper for positioning the entire component
  const wrapperClasses = cn(
    "flex items-center justify-center rounded",
    className
  );

  const segmentContainerClasses = cn(
    "inline-flex items-center gap-3",
    "bg-white dark:bg-gray-800",
    "shadow-md dark:shadow-lg dark:shadow-black/30",
    "rounded",
    "px-3 py-2 mt-1",
    "border border-gray-200 dark:border-gray-700"
  );

  const navLinkClasses = cn("text-link text-sm font-medium");
  const navDisabledClasses = cn(
    "text-gray-400 dark:text-gray-500",
    "text-sm font-medium cursor-default"
  );

  const centralLinkClasses = cn(
    "text-gray-700 dark:text-gray-200",
    "text-sm font-medium"
  );

  return (
    <div className={wrapperClasses}>
      <div className={segmentContainerClasses}>
        {/* Previous Button */}
        {hasPrevious && loadPreviousBlocks ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={centralLinkClasses}>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      loadPreviousBlocks();
                    }}
                    className={navLinkClasses}
                    aria-label="Load previous blocks"
                  >
                    {`<<`}
                  </Link>
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  Previous Block Range
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={navDisabledClasses} aria-hidden="true">
                  {`<<`}
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  No Previous Block Range
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Central Block Range Link */}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={centralLinkClasses}>
                {`[${toBlock.toLocaleString()} - ${fromBlock.toLocaleString()}]`}
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                Current Block Range
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>

        {/* Next Button */}
        {hasNext && loadNextBlocks ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={centralLinkClasses}>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      loadNextBlocks();
                    }}
                    className={navLinkClasses}
                    aria-label="Load next blocks"
                  >
                    {`>>`}
                  </Link>
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  Next Block Range
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={navDisabledClasses} aria-hidden="true">
                  {`>>`}
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  No Upcoming Block Range
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default BlockSegments;
