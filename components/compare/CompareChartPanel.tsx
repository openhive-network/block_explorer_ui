import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareChartPanelProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

// Collapsible card that hosts a compare chart directly beneath its section. Same
// chrome for every chart (wealth composition, footprint, power flow) so they read
// as one family. Sits flush under the section table (-mt-2).
const CompareChartPanel: React.FC<CompareChartPanelProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="-mt-2 mb-4 overflow-hidden rounded-xl border border-slate-200 bg-theme shadow-sm dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-start hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 dark:hover:bg-slate-800/50"
      >
        <span className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200">
          <Icon className={cn("h-4 w-4", iconColor)} />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3.5 dark:border-slate-800">
          {subtitle && (
            <p className="mb-3 text-[11px] text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export default CompareChartPanel;
