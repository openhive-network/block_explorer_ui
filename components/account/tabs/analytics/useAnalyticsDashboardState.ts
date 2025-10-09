import { useState, useEffect, useCallback } from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import { getLocalStorage, setLocalStorage } from '@/utils/LocalStorage';

// The default size for a new widget.
const DEFAULT_WIDGET_LAYOUT: Omit<Layout, 'i' | 'x' | 'y'> = {
  w: 8,
  h: 6,
  minW: 4,
  minH: 3,
};

// Define a type for the context passed when drilling down
export interface WidgetContext {
  id: string;      // A unique identifier, e.g., an account name or address
  label: string;   // A user-friendly label for display
}

/**
 * A "safety net" function to clean up layout data loaded from localStorage.
 * It finds any items with `y: null` and replaces it with a safe numeric value.
 */
const sanitizeLayouts = (layouts: Layouts): Layouts => {
  if (!layouts || typeof layouts !== 'object') return {};

  const sanitized: Layouts = {};
  for (const breakpoint in layouts) {
    if (Object.prototype.hasOwnProperty.call(layouts, breakpoint)) {
      const layoutArray = layouts[breakpoint];
      if (Array.isArray(layoutArray)) {
        sanitized[breakpoint] = layoutArray.map(item =>
          item && item.y === null ? { ...item, y: 0 } : item
        ).filter(Boolean); // Also remove any potential null items in the array
      }
    }
  }
  return sanitized;
};

export const useAnalyticsDashboardState = () => {
  const layoutStorageKey = `analytics_layout`;
  const widgetsStorageKey = `analytics_widgets`;

  const [layouts, setLayouts] = useState<Layouts>(() => {
    const savedData = getLocalStorage(layoutStorageKey);
    try {
      const parsed = savedData ? JSON.parse(savedData) : {};
      const validLayouts = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {};
      return sanitizeLayouts(validLayouts);
    } catch (error) {
      return {};
    }
  });

  const [widgets, setWidgets] = useState<Layout[]>(() => {
    const savedData = getLocalStorage(widgetsStorageKey);
    try {
      const parsed = savedData ? JSON.parse(savedData) : [];
      const validWidgets = Array.isArray(parsed) ? parsed : [];
      return validWidgets.map(item =>
        item && item.y === null ? { ...item, y: 0 } : item
      ).filter(Boolean);
    } catch (error) {
      return [];
    }
  });

  const onLayoutChange = useCallback((currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    setLocalStorage(layoutStorageKey, allLayouts);
  }, [layoutStorageKey]);

  const onAddWidget = useCallback((widgetType: string, context?: WidgetContext) => {
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
    Object.keys(newLayouts).forEach(breakpoint => {
      newLayouts[breakpoint] = [...(newLayouts[breakpoint] || []), newWidget];
    });
    if (!newLayouts.lg) {
      newLayouts.lg = [newWidget];
    }
    setLayouts(newLayouts);

  }, [widgets, layouts, widgetsStorageKey]);

  const onRemoveWidget = useCallback((widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.i !== widgetId);
    setWidgets(updatedWidgets);
    setLocalStorage(widgetsStorageKey, updatedWidgets);

    const newLayouts = { ...layouts };
    for (const breakpoint in newLayouts) {
      newLayouts[breakpoint] = newLayouts[breakpoint].filter(l => l.i !== widgetId);
    }
    setLayouts(newLayouts);
    setLocalStorage(layoutStorageKey, newLayouts);

  }, [widgets, layouts, widgetsStorageKey, layoutStorageKey]);

  return {
    layouts,
    widgets,
    onLayoutChange,
    onAddWidget,
    onRemoveWidget,
  };
};