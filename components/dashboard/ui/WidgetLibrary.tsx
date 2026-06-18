import React, { useState, useMemo } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import {
  ALL_WIDGETS,
  WIDGET_CATEGORY_META,
  WidgetCategory,
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
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const { t } = useI18n();

  const isSearching = searchTerm.trim().length > 0;

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const existingWidgetTypes = useMemo(
    () => new Set(existingWidgets.map((w) => w.type)),
    [existingWidgets]
  );

  const filteredWidgets = useMemo(
    () =>
      ALL_WIDGETS.filter((w) =>
        t(w.name).toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, t]
  );

  // Group by category, preserving the defined order
  const grouped = useMemo(() => {
    const map = new Map<WidgetCategory | "other", WidgetConfig[]>();
    const order: (WidgetCategory | "other")[] = [
      ...(Object.keys(WIDGET_CATEGORY_META) as WidgetCategory[]),
      "other",
    ];
    order.forEach((c) => map.set(c, []));
    for (const w of filteredWidgets) {
      const key = w.category ?? "other";
      map.get(key)!.push(w);
    }
    return order
      .map((key) => ({ key, widgets: map.get(key)! }))
      .filter(({ widgets }) => widgets.length > 0);
  }, [filteredWidgets]);

  const renderWidget = (widget: WidgetConfig) => {
    const isDisabled =
      !widget.allowMultiple && existingWidgetTypes.has(widget.id);
    const btn = (
      <button
        key={widget.id}
        onClick={() => onAddWidget(widget.id)}
        disabled={isDisabled}
        className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t(widget.name)}
      </button>
    );

    if (!widget.description) return btn;

    return (
      <TooltipProvider key={widget.id}>
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>{t(widget.description)}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getCategoryLabel = (key: WidgetCategory | "other") => {
    if (key === "other") return t("widgetLibrary.applicationWidgets");
    return t(WIDGET_CATEGORY_META[key].nameKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-theme rounded-[5px] p-6 w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t("widgetLibrary.addWidget")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder={t("widgetLibrary.searchWidget")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 mb-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          autoFocus
        />

        {/* Category groups */}
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
          {grouped.length === 0 && (
            <div className="text-center py-4 text-explorer-slate-text">
              {t("widgetLibrary.noWidgetsFound")}
            </div>
          )}

          {grouped.map(({ key, widgets }) => {
            const isOpen = isSearching || openCategories.has(key);
            return (
              <div key={key}>
                <button
                  onClick={() => toggleCategory(key)}
                  className="w-full flex items-center justify-between py-2 px-1 text-sm font-semibold text-explorer-slate-text uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <span>{getCategoryLabel(key)}</span>
                  {isOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>

                {isOpen && (
                  <div className="space-y-2 mb-2">
                    {widgets.map(renderWidget)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;
