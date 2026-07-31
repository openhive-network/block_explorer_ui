import React from "react";
import { ArrowLeftRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompareSelectToggleProps {
  account: string;
  selected: boolean;
  onToggle: (account: string) => void;
  t: (k: string) => string;
}

// Small per-row affordance that adds/removes an account from the compare pair.
const CompareSelectToggle: React.FC<CompareSelectToggleProps> = ({
  account,
  selected,
  onToggle,
  t,
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(account);
          }}
          aria-label={t("compare.select.toggle")}
          aria-pressed={selected}
          className={cn(
            "inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-indigo-500 bg-indigo-500 text-white"
              : "border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 dark:border-slate-600 dark:text-slate-500"
          )}
        >
          {selected ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <ArrowLeftRight className="h-3 w-3" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[11px]">
        {selected ? t("compare.select.remove") : t("compare.select.add")}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default CompareSelectToggle;
