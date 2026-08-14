import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Search, Plus, Check, ChevronDown } from "lucide-react";
import {
  ALL_WIDGETS,
  WIDGET_CATEGORY_META,
  WidgetCategory,
  WidgetConfig,
} from "@/components/dashboard/lib/widgetRegistry";
import { getWidgetNodeSupport } from "@/components/dashboard/lib/widgetNodeSupport";
import { useNodeSupport } from "@/contexts/NodeSupportContext";
import { useI18n } from "@/i18n/i18n";
import { cn } from "@/lib/utils";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  /** False when the board refused it — a singleton already placed. */
  onAddWidget: (widgetType: string) => boolean | void;
  existingWidgets: Array<{ type: string }>;
}

// Long enough to register, short enough not to linger while adding a run of
// widgets one after another.
const ADDED_FLASH_MS = 1600;

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({
  isOpen,
  onClose,
  onAddWidget,
  existingWidgets,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  const flashTimer = useRef<number | null>(null);
  const { t } = useI18n();
  const { isSupported, isEndpointUnsupported } = useNodeSupport();

  useEffect(
    () => () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    },
    []
  );

  // Fresh tally each time it opens, so the footer counts this visit only.
  useEffect(() => {
    if (isOpen) return;
    setAddedCount(0);
    setJustAdded(null);
  }, [isOpen]);

  const handleAdd = (widgetType: string) => {
    if (onAddWidget(widgetType) === false) return;
    setAddedCount((n) => n + 1);
    setJustAdded(widgetType);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(
      () => setJustAdded(null),
      ADDED_FLASH_MS
    );
  };

  const isSearching = searchTerm.trim().length > 0;

  // Description key is explicit on the widget, or derived by convention from the
  // name key ("...Name" -> "...NameDescription"). Empty string when it doesn't
  // resolve to real text.
  const getDescription = (widget: WidgetConfig): string => {
    const key = widget.description ?? `${widget.name}Description`;
    const text = t(key);
    return !text || text === key ? "" : text;
  };

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

  const filteredWidgets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return ALL_WIDGETS;
    return ALL_WIDGETS.filter(
      (w) =>
        t(w.name).toLowerCase().includes(q) ||
        getDescription(w).toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, t]);

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
    const alreadyAdded =
      !widget.allowMultiple && existingWidgetTypes.has(widget.id);
    // Active node is confirmed to lack this widget's required app or endpoint.
    const cap = getWidgetNodeSupport(widget.id);
    const isUnavailable =
      !!cap &&
      (isSupported(cap.app) === false || isEndpointUnsupported(cap.endpoint));
    const isDisabled = alreadyAdded || isUnavailable;
    const description = getDescription(widget);
    // Repeatable widgets never gain the permanent tick, so they get a flash.
    const flashing = justAdded === widget.id;

    return (
      <button
        key={widget.id}
        onClick={() => handleAdd(widget.id)}
        data-testid={`widget-library-add-${widget.id}`}
        disabled={isDisabled}
        title={
          isUnavailable ? t("widgetUnavailable.libraryTooltip") : undefined
        }
        className={cn(
          "group flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-all",
          isDisabled
            ? "cursor-not-allowed border-gray-100 bg-gray-50/50 opacity-70 dark:border-gray-800 dark:bg-gray-800/30"
            : "border-gray-200 bg-theme hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md dark:border-gray-700 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            {t(widget.name)}
            {flashing && (
              <span
                aria-live="polite"
                className="rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              >
                {t("widgetLibrary.added")}
              </span>
            )}
          </div>
          {isUnavailable && (
            <p className="mt-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
              {t("widgetUnavailable.libraryBadge")}
            </p>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors",
            alreadyAdded
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-gray-100 text-gray-400 group-hover:bg-indigo-500 group-hover:text-white dark:bg-gray-800"
          )}
        >
          {alreadyAdded ? <Check size={14} /> : <Plus size={14} />}
        </span>
      </button>
    );
  };

  const getCategoryLabel = (key: WidgetCategory | "other") => {
    if (key === "other") return t("widgetLibrary.applicationWidgets");
    return t(WIDGET_CATEGORY_META[key].nameKey);
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="widget-library"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-theme shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
          <h2 className="text-lg font-bold">{t("widgetLibrary.addWidget")}</h2>
          <button
            onClick={onClose}
            aria-label={t("widgetLibrary.addWidget")}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              data-testid="widget-library-search"
              placeholder={t("widgetLibrary.searchWidget")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pe-3 ps-9 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/40 dark:border-gray-700 dark:bg-gray-800/50"
              autoFocus
            />
          </div>
        </div>

        {/* Category groups */}
        <div className="flex-1 space-y-1 overflow-y-auto px-5 py-3">
          {grouped.length === 0 && (
            <div className="py-10 text-center text-sm text-explorer-slate-text">
              {t("widgetLibrary.noWidgetsFound")}
            </div>
          )}

          {grouped.map(({ key, widgets }) => {
            const open = isSearching || openCategories.has(key);
            return (
              <div key={key} className="pb-1">
                <button
                  onClick={() => toggleCategory(key)}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-explorer-slate-text transition-colors hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <span className="flex items-center gap-1.5">
                    {getCategoryLabel(key)}
                    <span className="rounded-full bg-gray-100 px-1.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      {widgets.length}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      open ? "" : "-rotate-90"
                    )}
                  />
                </button>

                {open && (
                  <div className="mb-2 space-y-2">
                    {widgets.map(renderWidget)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* The panel no longer closes itself, so say so and offer the exit. */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <p className="min-w-0 text-xs text-gray-500 dark:text-gray-400">
            {addedCount > 0
              ? t("widgetLibrary.addedCount").replace(
                  "{count}",
                  String(addedCount)
                )
              : t("widgetLibrary.keepAdding")}
          </p>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            {t("widgetLibrary.done")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;
