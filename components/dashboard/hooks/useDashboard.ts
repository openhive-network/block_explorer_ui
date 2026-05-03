import { useState, useEffect, useCallback } from "react";
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

  // Process master layout for initial collapsed states
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

  // Use the generator function to ensure mobile/tablet get the custom heights on first load.
  const initialLayouts = generateDerivedLayouts(masterLayout);

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
 
      const parsedLayouts = JSON.parse(savedLayoutsStr);
      initialLayouts = generateDerivedLayouts(parsedLayouts.lg || DEFAULT_MASTER_LAYOUT);
      
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
    
    // Only update and save if we are on Desktop
    if (EDITABLE_BREAKPOINTS.includes(currentBreakpoint)) {
      // Regenerate all mobile layouts based on the new Desktop changes
      const updatedLayouts = generateDerivedLayouts(currentLayout);
      setLayouts(updatedLayouts);
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updatedLayouts));
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
    
    const newLayouts = generateDerivedLayouts([...masterLayout, newLayoutItem]);
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
          newItem.h = item.originalH || (config.defaultLayout.h || 5);
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

  const setRuntimeWidgetHeight = useCallback((widgetId: string, newH: number) => {
    setLayouts(prev => {
      const updated: Layouts = {};
      for (const bp of Object.keys(prev)) {
        updated[bp] = (prev[bp] || []).map(item =>
          item.i === widgetId ? { ...item, h: newH } : item
        );
      }
      return updated;
    });
  }, []);

  const isEditableBreakpoint = EDITABLE_BREAKPOINTS.includes(currentBreakpoint);
  const finalIsEditMode = isEditMode && isEditableBreakpoint;

  return {
    widgets, layouts, widgetStates, isEditMode, isLibraryOpen,
    finalIsEditMode, isLargeScreen: isEditableBreakpoint,
    setIsEditMode, setIsLibraryOpen, onBreakpointChange,
    onLayoutChange, onAddWidget, onRemoveWidget, handleResetLayout,
    handleWidgetStateChange, handleToggleCollapse, setRuntimeWidgetHeight,
  };
}