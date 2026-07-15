import { useState, useEffect, useCallback, useRef } from "react";
import { Layout, Layouts } from "react-grid-layout";
import { getLocalStorage, setLocalStorage } from "@/utils/LocalStorage";

// The default size for a new widget: half-width (6/12) so two reports sit side
// by side, with a small minW so they can be dragged narrower for denser layouts.
// The reports are responsive (KPIs stack, charts shrink) down to this width.
const DEFAULT_WIDGET_LAYOUT: Omit<Layout, "i" | "x" | "y"> = {
  w: 6,
  h: 6,
  minW: 3,
  minH: 3,
};

// Default landing dashboard (only seeded when nothing is stored). Top row is
// half-height, the data-dense reports below full-height.
const DEFAULT_REPORTS: { type: string; h: number }[] = [
  { type: "financialSummary", h: 6 },
  { type: "influenceMap", h: 6 },
  { type: "rcFootprint", h: 8 },
  { type: "rcConsumption", h: 8 },
  { type: "contentActivity", h: 8 },
];

// `perRow` tiles across at `w` cols; y tracks the running sum of row heights.
const defaultLayoutFor = (perRow: number, w: number): Layout[] => {
  const out: Layout[] = [];
  let rowStartY = 0;
  let rowMaxH = 0;
  DEFAULT_REPORTS.forEach((rep, i) => {
    const col = perRow === 1 ? 0 : i % perRow;
    if (col === 0 && i > 0) {
      rowStartY += rowMaxH;
      rowMaxH = 0;
    }
    out.push({
      i: `${rep.type}-default`,
      x: col * w,
      y: rowStartY,
      w,
      h: rep.h,
      minW: Math.min(3, w),
      minH: 3,
    });
    rowMaxH = Math.max(rowMaxH, rep.h);
  });
  return out;
};

const buildDefaultWidgets = (): Layout[] => defaultLayoutFor(2, 6);
const buildDefaultLayouts = (): Layouts => ({
  lg: defaultLayoutFor(2, 6),
  md: defaultLayoutFor(2, 5),
  sm: defaultLayoutFor(1, 6),
  xs: defaultLayoutFor(1, 4),
  xxs: defaultLayoutFor(1, 2),
});

// Storage keys are suffixed with the logged-in username to avoid cross-user
// pollution when several accounts share one browser profile. Falls back to a
// shared "guest" bucket when logged out.
const layoutKeyFor = (user: string) => `analytics_layout_${user}`;
const widgetsKeyFor = (user: string) => `analytics_widgets_${user}`;
// Legacy global keys, migrated once into the per-user bucket on first load.
const LEGACY_LAYOUT_KEY = "analytics_layout";
const LEGACY_WIDGETS_KEY = "analytics_widgets";

// Define a type for the context passed when drilling down
export interface WidgetContext {
  id: string; // A unique identifier, e.g., an account name or address
  label: string; // A user-friendly label for display
}

/**
 * A "safety net" function to clean up layout data loaded from localStorage.
 * It finds any items with `y: null` and replaces it with a safe numeric value.
 */
const sanitizeLayouts = (layouts: Layouts): Layouts => {
  if (!layouts || typeof layouts !== "object") return {};

  const sanitized: Layouts = {};
  for (const breakpoint in layouts) {
    if (Object.prototype.hasOwnProperty.call(layouts, breakpoint)) {
      const layoutArray = layouts[breakpoint];
      if (Array.isArray(layoutArray)) {
        sanitized[breakpoint] = layoutArray
          .map((item) => (item && item.y === null ? { ...item, y: 0 } : item))
          .filter(Boolean); // Also remove any potential null items in the array
      }
    }
  }
  return sanitized;
};

const loadLayouts = (key: string): Layouts => {
  const savedData = getLocalStorage(key) ?? getLocalStorage(LEGACY_LAYOUT_KEY);
  // No stored data at all → first visit: seed the default landing layout.
  if (savedData == null) return buildDefaultLayouts();
  try {
    const parsed = savedData ? JSON.parse(savedData) : {};
    const valid =
      typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : {};
    return sanitizeLayouts(valid);
  } catch (error) {
    return {};
  }
};

const loadWidgets = (key: string): Layout[] => {
  const savedData = getLocalStorage(key) ?? getLocalStorage(LEGACY_WIDGETS_KEY);
  // No stored data at all → first visit: seed the default report set.
  if (savedData == null) return buildDefaultWidgets();
  try {
    const parsed = savedData ? JSON.parse(savedData) : [];
    const valid = Array.isArray(parsed) ? parsed : [];
    return valid
      .map((item) => (item && item.y === null ? { ...item, y: 0 } : item))
      .filter(Boolean);
  } catch (error) {
    return [];
  }
};

export const useAnalyticsDashboardState = (username: string | null) => {
  const user = username ?? "guest";
  const layoutStorageKey = layoutKeyFor(user);
  const widgetsStorageKey = widgetsKeyFor(user);

  const [layouts, setLayouts] = useState<Layouts>(() =>
    loadLayouts(layoutStorageKey)
  );
  const [widgets, setWidgets] = useState<Layout[]>(() =>
    loadWidgets(widgetsStorageKey)
  );

  // Reload persisted state when the logged-in user changes (keys change).
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current !== user) {
      prevUserRef.current = user;
      setLayouts(loadLayouts(layoutStorageKey));
      setWidgets(loadWidgets(widgetsStorageKey));
    }
  }, [user, layoutStorageKey, widgetsStorageKey]);

  const onLayoutChange = useCallback(
    (currentLayout: Layout[], allLayouts: Layouts) => {
      setLayouts(allLayouts);
      setLocalStorage(layoutStorageKey, allLayouts);
    },
    [layoutStorageKey]
  );

  const onAddWidget = useCallback(
    (widgetType: string, context?: WidgetContext) => {
      const newWidgetId = context
        ? `${widgetType}-${context.id}-${Date.now()}`
        : `${widgetType}-${Date.now()}`;

      const newWidget: Layout = {
        ...DEFAULT_WIDGET_LAYOUT,
        i: newWidgetId,
        x: (widgets.length * DEFAULT_WIDGET_LAYOUT.w) % 12,
        y: Infinity,
      };

      const updatedWidgets = [...widgets, newWidget];
      setWidgets(updatedWidgets);
      setLocalStorage(widgetsStorageKey, updatedWidgets);

      const newLayouts = { ...layouts };
      Object.keys(newLayouts).forEach((breakpoint) => {
        newLayouts[breakpoint] = [...(newLayouts[breakpoint] || []), newWidget];
      });
      if (!newLayouts.lg) {
        newLayouts.lg = [newWidget];
      }
      setLayouts(newLayouts);
      setLocalStorage(layoutStorageKey, newLayouts);
    },
    [widgets, layouts, widgetsStorageKey, layoutStorageKey]
  );

  // Restore the default dashboard, wiping the user's current arrangement.
  const onResetLayout = useCallback(() => {
    const defaultWidgets = buildDefaultWidgets();
    const defaultLayouts = buildDefaultLayouts();
    setWidgets(defaultWidgets);
    setLayouts(defaultLayouts);
    setLocalStorage(widgetsStorageKey, defaultWidgets);
    setLocalStorage(layoutStorageKey, defaultLayouts);
  }, [widgetsStorageKey, layoutStorageKey]);

  const onRemoveWidget = useCallback(
    (widgetId: string) => {
      const updatedWidgets = widgets.filter((w) => w.i !== widgetId);
      setWidgets(updatedWidgets);
      setLocalStorage(widgetsStorageKey, updatedWidgets);

      const newLayouts = { ...layouts };
      for (const breakpoint in newLayouts) {
        newLayouts[breakpoint] = newLayouts[breakpoint].filter(
          (l) => l.i !== widgetId
        );
      }
      setLayouts(newLayouts);
      setLocalStorage(layoutStorageKey, newLayouts);
    },
    [widgets, layouts, widgetsStorageKey, layoutStorageKey]
  );

  return {
    layouts,
    widgets,
    onLayoutChange,
    onAddWidget,
    onRemoveWidget,
    onResetLayout,
  };
};
