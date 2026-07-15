import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { Layout } from "react-grid-layout";
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
import { reportRegistry } from "./reportRegistry";

interface ReportLibraryProps {
  onAddWidget: (widgetType: string) => void;
  widgets: Layout[];
}

const ReportLibrary: React.FC<ReportLibraryProps> = ({
  onAddWidget,
  widgets,
}) => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const existingWidgetTypes = new Set(
    widgets.map((widget) => widget.i.split("-")[0])
  );

  const handleAdd = (widgetType: string) => {
    onAddWidget(widgetType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                aria-label={t("analyticsDashboard.addReport")}
                className="group flex items-center justify-center rounded-full bg-gray-600 p-3 text-white shadow-lg transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <Plus
                  size={20}
                  className="transition-transform group-data-[state=open]:rotate-45"
                />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {t("analyticsDashboard.addReport")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" className="w-64 p-1">
        <div className="flex flex-col gap-0.5">
          {Object.entries(reportRegistry).map(([widgetType, config]) => {
            const Icon = config.icon;
            const added = existingWidgetTypes.has(widgetType);
            return (
              <button
                key={widgetType}
                type="button"
                onClick={() => !added && handleAdd(widgetType)}
                disabled={added}
                title={
                  config.descriptionKey ? t(config.descriptionKey) : undefined
                }
                className="flex items-center gap-2 rounded px-2 py-1.5 text-start transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {t(config.titleKey)}
                </span>
                {added && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-explorer-light-green" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReportLibrary;
