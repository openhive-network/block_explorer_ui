import { useState, useEffect } from "react";
import { Layouts, Layout } from "react-grid-layout";
import {
  LAYOUT_STORAGE_KEY,
  WIDGETS_STORAGE_KEY,
  WIDGET_STATES_STORAGE_KEY,
  DEFAULT_WIDGETS,
  DEFAULT_MASTER_LAYOUT,
  generateDerivedLayouts,
  COLLAPSED_WIDGET_HEIGHT,
  EDITABLE_BREAKPOINTS,
  DEFAULT_MOBILE_WIDGET_ORDER,
} from "../lib/dashboard.config";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import { useI18n } from "@/i18n/i18n";

interface ExtendedLayout extends Layout {
  originalH?: number;
}

/**
 * A private helper function to create the perfect initial layout for a first-time user.
 * It now also reads the WIDGET_REGISTRY to apply the initial collapsed state.
 */
const createInitialLayoutsAndStates = () => {
  const masterLayout: ExtendedLayout[] = JSON.parse(JSON.stringify(DEFAULT_MASTER_LAYOUT));
  const initialWidgetStates: Record<string, any> = {};

  // First, process the master layout to apply any initial collapsed states
  DEFAULT_WIDGETS.forEach(widget => {
    const config = WIDGET_REGISTRY[widget.type];
    if (config?.initialCollapsed) {
      const layoutItem = masterLayout.find(item => item.i === widget.i);
      if (layoutItem) {
        initialWidgetStates[widget.i] = { isCollapsed: true };
        layoutItem.originalH = layoutItem.h;
        layoutItem.h = COLLAPSED_WIDGET_HEIGHT; 
      }
    }
  });

  // Now, use this MODIFIED masterLayout to build the final layouts object,
  // respecting the custom mobile order.
  const initialLayouts: Layouts = { lg: masterLayout };
  const defaultLayoutMap = new Map(masterLayout.map(item => [item.i, item]));
  const colsMap: { [key: string]: number } = { md: 10, sm: 6, xs: 4 };

  Object.keys(colsMap).forEach(bp => {
    let currentY = 0;
    const mobileLayout: Layout[] = [];
    DEFAULT_MOBILE_WIDGET_ORDER.forEach(widgetId => {
      const defaultItem = defaultLayoutMap.get(widgetId);
      if (defaultItem) {
        const { minW, minH, originalH, ...rest } = defaultItem;
        mobileLayout.push({ ...rest, x: 0, y: currentY, w: colsMap[bp] });
        currentY += defaultItem.h;
      }
    });
    initialLayouts[bp] = mobileLayout;
  });

  return { layouts: initialLayouts, widgetStates: initialWidgetStates };
};

export function useDashboard() {
  const [widgets, setWidgets] = useState<Array<{ i: string; type: string }>>([]);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [widgetStates, setWidgetStates] = useState<Record<string, any>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const { t } = useI18n();

  useEffect(() => {
    const savedWidgetsStr = localStorage.getItem(WIDGETS_STORAGE_KEY);
    const savedLayoutsStr = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const savedStatesStr = localStorage.getItem(WIDGET_STATES_STORAGE_KEY);

    let initialWidgets = [...DEFAULT_WIDGETS];
    let initialLayouts: Layouts;
    let initialWidgetStates: Record<string, any> = {};

    if (savedLayoutsStr) {
      initialLayouts = JSON.parse(savedLayoutsStr);
      if (savedWidgetsStr) initialWidgets = JSON.parse(savedWidgetsStr);
      if (savedStatesStr) initialWidgetStates = JSON.parse(savedStatesStr);
    } else {
      const initialState = createInitialLayoutsAndStates();
      initialLayouts = initialState.layouts;
      initialWidgetStates = initialState.widgetStates;
    }
    
    setWidgets(initialWidgets);
    setLayouts(initialLayouts);
    setWidgetStates(initialWidgetStates);
  }, []);

  const onBreakpointChange = (newBreakpoint: string) => setCurrentBreakpoint(newBreakpoint);

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    if (!isEditMode) return;
    setLayouts(allLayouts);
    if (EDITABLE_BREAKPOINTS.includes(currentBreakpoint)) {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
    }
  };

  const onAddWidget = (widgetType: string) => {
    const widgetConfig = WIDGET_REGISTRY[widgetType];
    const newWidgetId = `${widgetType}-${Date.now()}`;
    const newWidgets = [...widgets, { i: newWidgetId, type: widgetType }];
    setWidgets(newWidgets);
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(newWidgets));
    const masterLayout = layouts.lg || [];
    const newY = masterLayout.reduce((maxY, item) => Math.max(maxY, item.y + item.h), 0);
    const newLayoutItem: Layout = { ...widgetConfig.defaultLayout, i: newWidgetId, x: 0, y: newY };
    const newMasterLayout = [...masterLayout, newLayoutItem];
    const newLayouts = generateDerivedLayouts(newMasterLayout);
    setLayouts(newLayouts);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
    setIsLibraryOpen(false);
  };

  const onRemoveWidget = (widgetId: string) => {
    const newWidgets = widgets.filter((w) => w.i !== widgetId);
    setWidgets(newWidgets);
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(newWidgets));
    const masterLayout = (layouts.lg || []).filter((l) => l.i !== widgetId);
    const newLayouts = generateDerivedLayouts(masterLayout);
    setLayouts(newLayouts);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
  };

  const handleResetLayout = () => {
    if (!window.confirm(t("dashbord.restoreWarning"))) return;
    
    localStorage.removeItem(WIDGETS_STORAGE_KEY);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(WIDGET_STATES_STORAGE_KEY);
    
    const { layouts, widgetStates } = createInitialLayoutsAndStates();
    setWidgets(DEFAULT_WIDGETS);
    setLayouts(layouts);
    setWidgetStates(widgetStates);
    setIsEditMode(false);
  };

  const handleWidgetStateChange = (widgetId: string, newState: any) => {
    const newWidgetStates = { ...widgetStates, [widgetId]: { ...widgetStates[widgetId], ...newState } };
    setWidgetStates(newWidgetStates);
    localStorage.setItem(WIDGET_STATES_STORAGE_KEY, JSON.stringify(newWidgetStates));
  };

  /**
   * NOTE: Toggles Widget Collapse State
   * Manages the collapsing and expanding of a widget. It adjusts the widget's height in the layout
   * and saves its original height to restore it upon expansion.
   * @param widgetId The unique identifier of the widget to toggle.
   */
  const handleToggleCollapse = (widgetId: string) => {
    const widgetType = widgets.find((w) => w.i === widgetId)?.type;
    const config = widgetType ? WIDGET_REGISTRY[widgetType] : undefined;
    if (!config?.collapsible) return;
    
    const currentState = widgetStates[widgetId] || {};
    const newIsCollapsed = !currentState.isCollapsed;

    const newMasterLayout = (layouts.lg || []).map((item: ExtendedLayout) => {
      if (item.i === widgetId) {
        const newItem = { ...item };
        if (newIsCollapsed) {
          newItem.originalH = item.h;
          newItem.h = COLLAPSED_WIDGET_HEIGHT;
        } else {
          const fallbackHeight = config.defaultLayout.h || 5;
          newItem.h = item.originalH || fallbackHeight;
        }
        return newItem;
      }
      return item;
    });

    const newLayouts = generateDerivedLayouts(newMasterLayout);
    setLayouts(newLayouts);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
    
    handleWidgetStateChange(widgetId, { isCollapsed: newIsCollapsed });
  };

  const isEditableBreakpoint = EDITABLE_BREAKPOINTS.includes(currentBreakpoint);
  const finalIsEditMode = isEditMode && isEditableBreakpoint;

  return {
    widgets, layouts, widgetStates, isEditMode, isLibraryOpen,
    finalIsEditMode, isLargeScreen: isEditableBreakpoint,
    setIsEditMode, setIsLibraryOpen, onBreakpointChange,
    onLayoutChange, onAddWidget, onRemoveWidget, handleResetLayout,
    handleWidgetStateChange, handleToggleCollapse,
  };
}