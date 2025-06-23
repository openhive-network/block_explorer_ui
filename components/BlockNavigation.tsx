import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/hybrid-tooltip";
import { useI18n } from "@/i18n/i18n";

interface BlockNavigationProps {
  fromBlock?: number;
  toBlock?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  loadPreviousBlocks?: () => void;
  loadNextBlocks?: () => void;
  urlParams?: any;
  className?: string;
}

const BlockNavigation: React.FC<BlockNavigationProps> = ({
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
  const { t } = useI18n();

  if (!fromBlock || !toBlock) {
    return null;
  }

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
                    aria-label={t("blockNavigation.loadPreviousBlocks")}
                  >
                    {`<<`}
                  </Link>
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  {t("blockNavigation.previousBlockRange")}
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
                  {t("blockNavigation.noPreviousBlockRange")}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={centralLinkClasses}>
                {`[${toBlock.toLocaleString()} - ${fromBlock.toLocaleString()}]`}
              </span>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                {t("blockNavigation.currentBlockRange")}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>

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
                    aria-label={t("blockNavigation.loadNextBlocks")}
                  >
                    {`>>`}
                  </Link>
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                  {t("blockNavigation.nextBlockRange")}
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
                  {t("blockNavigation.noUpcomingBlockRange")}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default BlockNavigation;