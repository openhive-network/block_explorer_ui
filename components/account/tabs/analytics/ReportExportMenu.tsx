import React, { useState } from "react";
import { Download } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DataExport from "@/components/DataExport";
import { ReportExportDataset } from "./reportExports";

interface ReportExportMenuProps {
  datasets: ReportExportDataset[];
}

// Generic export affordance rendered in a report widget's header. Each dataset
// downloads directly as CSV via the shared DataExport (translated headers).
const ReportExportMenu: React.FC<ReportExportMenuProps> = ({ datasets }) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const usable = datasets.filter((d) => d.rows.length > 0);
  if (usable.length === 0) return null;

  if (usable.length === 1) {
    const ds = usable[0];
    return (
      <DataExport
        data={ds.rows}
        filename={`${ds.filename}.csv`}
        skipColumnSelection
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t("common.export")}
                className="no-drag shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
              >
                <Download className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[11px]">
              {t("common.export")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DataExport>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                aria-label={t("common.export")}
                onClick={(e) => e.stopPropagation()}
                className="no-drag shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
              >
                <Download className="h-4 w-4" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {t("common.export")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="end"
        className="w-56 p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {usable.map((ds) => (
            <DataExport
              key={ds.name}
              data={ds.rows}
              filename={`${ds.filename}.csv`}
              skipColumnSelection
            >
              <div
                role="button"
                tabIndex={0}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <span className="truncate">{ds.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {ds.rows.length}
                </span>
              </div>
            </DataExport>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReportExportMenu;
