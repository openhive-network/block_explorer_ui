import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KpiTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  infoText?: string;
  valueClassName?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  sub,
  icon,
  infoText,
  valueClassName,
  className,
  onClick,
  isActive,
}) => (
  <div
    className={cn(
      "rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-xs",
      onClick &&
        "cursor-pointer transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-indigo-500",
      isActive &&
        "border-indigo-500 ring-1 ring-indigo-500 dark:border-indigo-500",
      className
    )}
    {...(onClick && {
      role: "button",
      tabIndex: 0,
      "aria-pressed": !!isActive,
      onClick,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      },
    })}
  >
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1 uppercase tracking-wide">
      {icon}
      <span className="min-w-0 wrap-break-word">{label}</span>
      {infoText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={infoText}
                className="text-gray-400 hover:text-gray-500 cursor-help shrink-0"
              >
                <Info size={10} />
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                side="top"
                className="max-w-[240px] text-[11px] text-center normal-case"
              >
                {infoText}
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div
      className={cn(
        "text-sm font-semibold leading-tight whitespace-nowrap",
        valueClassName
      )}
    >
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
  </div>
);

export default KpiTile;
