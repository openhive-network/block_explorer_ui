import React from "react";
import Link from "next/link";
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
  const { t, locale } = useI18n();

  if (!fromBlock || !toBlock) {
    return null;
  }

  const wrapperClasses = cn(
    "flex items-center justify-between",
    "bg-gradient-to-b from-white to-slate-50",
    "dark:from-slate-800 dark:to-slate-800/90",
    "px-5 py-2",
    "border-b border-slate-200 dark:border-slate-700",
    "rounded-t-lg",
    className
  );

  const navLinkClasses = cn(
    "text-2xl font-bold text-link",
    "transition-colors duration-200"
  );

  const navDisabledClasses = cn(
    "text-2xl font-bold text-slate-400 dark:text-slate-600",
    "cursor-default"
  );

  const centralTextClasses = cn(
    "text-sm font-sans font-medium text-slate-700 dark:text-slate-200",
    "tracking-tight"
  );

  return (
    <div className={wrapperClasses}>
      {hasPrevious && loadPreviousBlocks ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  loadPreviousBlocks();
                }}
                className={navLinkClasses}
                aria-label={t("blockNavigation.loadPreviousBlocks")}
              >
                {"«"}
              </Link>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                {t("blockNavigation.previousBlockRange")}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className={navDisabledClasses} aria-hidden="true">
          {"«"}
        </span>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-baseline">
              <span className="text-slate-400 dark:text-slate-500">[</span>
              <span className={centralTextClasses}>
                {`${toBlock.toLocaleString(locale)} - ${fromBlock.toLocaleString(locale)}`}
              </span>
              <span className="text-slate-400 dark:text-slate-500">]</span>
            </div>
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
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  loadNextBlocks();
                }}
                className={navLinkClasses}
                aria-label={t("blockNavigation.loadNextBlocks")}
              >
                {"»"}
              </Link>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="bg-white text-black dark:bg-theme dark:text-white">
                {t("blockNavigation.nextBlockRange")}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className={navDisabledClasses} aria-hidden="true">
          {"»"}
        </span>
      )}
    </div>
  );
};

export default BlockNavigation;
