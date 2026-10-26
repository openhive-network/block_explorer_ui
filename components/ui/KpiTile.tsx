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
}

const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  sub,
  icon,
  infoText,
  valueClassName,
  className,
}) => (
  <div
    className={cn(
      "rounded-md border border-gray-200 dark:border-gray-700 bg-theme px-3 py-2 shadow-sm",
      className
    )}
  >
    <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1 uppercase tracking-wide">
      {icon}
      <span className="min-w-0 break-words">{label}</span>
      {infoText && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={infoText}
                className="text-gray-400 hover:text-gray-500 cursor-help flex-shrink-0"
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
