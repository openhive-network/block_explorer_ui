import React, { useState } from "react";
import { X } from "lucide-react";
import {
  ALL_WIDGETS,
  WidgetConfig,
} from "@/components/dashboard/lib/widgetRegistry";
import { useI18n } from "@/i18n/i18n";

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string) => void;
  existingWidgets: Array<{ type: string }>;
}

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  existingWidgets,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useI18n();

  if (!isOpen) {
    return null;
  }

  const existingWidgetTypes = new Set(existingWidgets.map((w) => w.type));

  const filteredWidgets = ALL_WIDGETS.filter((widget) =>
    t(widget.name).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applicationWidgets = filteredWidgets.filter(
    (widget) => !widget.isLayoutWidget
  );
  const layoutWidgets = filteredWidgets.filter(
    (widget) => widget.isLayoutWidget
  );

  const renderWidgetList = (widgets: WidgetConfig[]) => {
    return widgets.map((widget) => {
      const isDisabled =
        !widget.allowMultiple && existingWidgetTypes.has(widget.id);
      if (!widget.description) {
        return (
          <button
            key={widget.id}
            onClick={() => onAddWidget(widget.id)}
            disabled={isDisabled}
            className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(widget.name)}
          </button>
        );
      }

      return (
        <TooltipProvider key={widget.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onAddWidget(widget.id)}
                disabled={isDisabled}
                className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t(widget.name)}
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>{t(widget.description)}</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-theme rounded-[5px] p-6 w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t("widgetLibrary.addWidget")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
        <input
          type="text"
          placeholder={t("widgetLibrary.searchWidget")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          autoFocus
        />
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {applicationWidgets.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-explorer-slate-text uppercase tracking-wider mb-2">
                {t("widgetLibrary.applicationWidgets")}
              </h3>
              <div className="space-y-2">
                {renderWidgetList(applicationWidgets)}
              </div>
            </div>
          )}
          {layoutWidgets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-explorer-slate-text uppercase tracking-wider mb-2">
                {t("widgetLibrary.layoutWidgets")}
              </h3>
              <div className="space-y-2">{renderWidgetList(layoutWidgets)}</div>
            </div>
          )}
          {applicationWidgets.length === 0 && layoutWidgets.length === 0 && (
            <div className="text-center py-4 text-explorer-slate-text">
              {t("widgetLibrary.noWidgetsFound")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;
