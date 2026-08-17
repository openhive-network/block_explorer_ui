import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  onClick?: () => void;
  tooltipContent?: React.ReactNode;
}

const StatCard = ({
  icon,
  label,
  value,
  onClick,
  tooltipContent,
}: StatCardProps) => {
  const cardDiv = (
    <div
      className={cn(
        "bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl flex flex-col items-center justify-center text-center",
        {
          "hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors cursor-pointer":
            !!onClick,
          "cursor-help": !!tooltipContent,
        }
      )}
      onClick={onClick}
      role={onClick ? "button" : "figure"}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="text-explorer-orange mb-1">{icon}</div>
      <div className="mb-1 text-base font-bold text-explorer-dark-gray dark:text-white min-h-[1.5rem] flex items-center justify-center">
        {value}
      </div>
      <p className="text-[10px] text-explorer-light-gray dark:text-white uppercase font-semibold tracking-wider">
        {label}
      </p>
    </div>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardDiv}</TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardDiv;
};

export default StatCard;
