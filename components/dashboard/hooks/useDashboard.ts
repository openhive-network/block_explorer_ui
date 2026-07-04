import { useState, useEffect, useCallback } from "react";
import { Layouts, Layout } from "react-grid-layout";
import {
  getLayoutStorageKey,
  getWidgetsStorageKey,
  getWidgetStatesStorageKey,
  DEFAULT_WIDGETS,
  DEFAULT_MASTER_LAYOUT,
  generateDerivedLayouts,
  COLLAPSED_WIDGET_HEIGHT,
  EDITABLE_BREAKPOINTS,
} from "../lib/dashboard.config";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/contexts/AuthContext";

interface ExtendedLayout extends Layout {
  originalH?: number;
}

/**
 * A private helper function to create the perfect initial layout for a first-time user.
 * It now also reads the WIDGET_REGISTRY to apply the initial collapsed state.
 */
const createInitialLayoutsAndStates = () => {
  const masterLayout: ExtendedLayout[] = JSON.parse(
    JSON.stringify(DEFAULT_MASTER_LAYOUT)
  );
  const initialWidgetStates: Record<string, any> = {};

  // Process master layout for initial collapsed states
  DEFAULT_WIDGETS.forEach((widget) => {
    const config = WIDGET_REGISTRY[widget.type];
    if (config?.initialCollapsed) {
      const layoutItem = masterLayout.find((item) => item.i === widget.i);
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
  const [widgets, setWidgets] = useState<Array<{ i: string; type: string }>>(
    []
  );
  const [layouts, setLayouts] = useState<Layouts>({});
  const [widgetStates, setWidgetStates] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const { t } = useI18n();
  const { username } = useAuth();

  useEffect(() => {
    if (!username) {
      setIsLoaded(false);
      return;
    }

    const savedWidgetsStr = localStorage.getItem(
      getWidgetsStorageKey(username)
    );
    const savedLayoutsStr = localStorage.getItem(getLayoutStorageKey(username));
    const savedStatesStr = localStorage.getItem(
      getWidgetStatesStorageKey(username)
    );

    let initialWidgets = [...DEFAULT_WIDGETS];
    let initialLayouts: Layouts;
    let initialWidgetStates: Record<string, any> = {};

    if (savedLayoutsStr) {
      const parsedLayouts = JSON.parse(savedLayoutsStr);

      if (savedWidgetsStr) initialWidgets = JSON.parse(savedWidgetsStr);
      if (savedStatesStr) initialWidgetStates = JSON.parse(savedStatesStr);

      // Reconcile stale saved layouts against the registry: pull minW/minH from
      // the current widget config so old floors (e.g. a collapsible trapped at
      // minH 5) can't clamp collapsed/compact widgets tall, and force collapsed
      // widgets back to the collapsed height.
      const typeById = new Map(initialWidgets.map((w) => [w.i, w.type]));
      const reconciledMaster: ExtendedLayout[] = (
        parsedLayouts.lg || DEFAULT_MASTER_LAYOUT
      ).map((item: ExtendedLayout) => {
        const type = typeById.get(item.i);
        const cfg = type ? WIDGET_REGISTRY[type] : undefined;
        if (!cfg) return item;
        const next: ExtendedLayout = {
          ...item,
          minW: cfg.defaultLayout.minW ?? item.minW,
          minH: cfg.defaultLayout.minH ?? item.minH,
        };
        if (initialWidgetStates[item.i]?.isCollapsed) {
          next.originalH = item.originalH ?? item.h;
          next.h = COLLAPSED_WIDGET_HEIGHT;
        }
        return next;
      });

      initialLayouts = generateDerivedLayouts(reconciledMaster);
    } else {
      const initialState = createInitialLayoutsAndStates();
      initialLayouts = initialState.layouts;
      initialWidgetStates = initialState.widgetStates;
    }

    setWidgets(initialWidgets);
    setLayouts(initialLayouts);
    setWidgetStates(initialWidgetStates);
    setIsLoaded(true);
  }, [username]);

  const onBreakpointChange = (newBreakpoint: string) =>
    setCurrentBreakpoint(newBreakpoint);

  const onLayoutChange = (_currentLayout: Layout[], allLayouts: Layouts) => {
    if (!isEditMode) return;
    if (!username) return;
    setLayouts(allLayouts);
    if (EDITABLE_BREAKPOINTS.includes(currentBreakpoint)) {
      localStorage.setItem(
        getLayoutStorageKey(username),
        JSON.stringify(allLayouts)
      );
    }
  };

  const onAddWidget = useCallback(
    (widgetType: string, layoutOverride?: Partial<Layout>) => {
      if (!username) return;
      const widgetConfig = WIDGET_REGISTRY[widgetType];
      const newWidgetId = `${widgetType}-${Date.now()}`;
      const newWidgets = [...widgets, { i: newWidgetId, type: widgetType }];
      setWidgets(newWidgets);
      localStorage.setItem(
        getWidgetsStorageKey(username),
        JSON.stringify(newWidgets)
      );

      const masterLayout = layouts.lg || [];
      const newY = masterLayout.reduce(
        (maxY, item) => Math.max(maxY, item.y + item.h),
        0
      );
      const newLayoutItem: Layout = {
        ...widgetConfig.defaultLayout,
        i: newWidgetId,
        x: 0,
        y: newY,
        ...layoutOverride,
      };

      // For an explicit top placement (e.g. Watched Proposals at y:0), push the
      // overlapping column down by the new item's height so it lands above the
      // existing widgets, not after them.
      const nw = newLayoutItem.w ?? 0;
      const nh = newLayoutItem.h ?? 0;
      const baseLayout =
        layoutOverride?.y !== undefined
          ? masterLayout.map((item) =>
              item.x < newLayoutItem.x + nw &&
              item.x + item.w > newLayoutItem.x &&
              item.y >= newLayoutItem.y
                ? { ...item, y: item.y + nh }
                : item
            )
          : masterLayout;

      const newLayouts = generateDerivedLayouts([...baseLayout, newLayoutItem]);
      setLayouts(newLayouts);
      localStorage.setItem(
        getLayoutStorageKey(username),
        JSON.stringify(newLayouts)
      );
      setIsLibraryOpen(false);
    },
    [widgets, layouts, username]
  );

  const onRemoveWidget = (widgetId: string) => {
    if (!username) return;
    const newWidgets = widgets.filter((w) => w.i !== widgetId);
    setWidgets(newWidgets);
    localStorage.setItem(
      getWidgetsStorageKey(username),
      JSON.stringify(newWidgets)
    );

    const masterLayout = (layouts.lg || []).filter((l) => l.i !== widgetId);
    const newLayouts = generateDerivedLayouts(masterLayout);
    setLayouts(newLayouts);
    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(newLayouts)
    );
  };

  const handleResetLayout = () => {
    if (!username) return;
    if (!window.confirm(t("dashbord.restoreWarning"))) return;

    const { layouts, widgetStates } = createInitialLayoutsAndStates();

    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(layouts)
    );
    localStorage.setItem(
      getWidgetsStorageKey(username),
      JSON.stringify(DEFAULT_WIDGETS)
    );
    localStorage.setItem(
      getWidgetStatesStorageKey(username),
      JSON.stringify(widgetStates)
    );

    setWidgets(DEFAULT_WIDGETS);
    setLayouts(layouts);
    setWidgetStates(widgetStates);
    setIsEditMode(false);
  };

  const handleWidgetStateChange = (widgetId: string, newState: any) => {
    if (!username) return;
    const newWidgetStates = {
      ...widgetStates,
      [widgetId]: { ...widgetStates[widgetId], ...newState },
    };
    setWidgetStates(newWidgetStates);
    localStorage.setItem(
      getWidgetStatesStorageKey(username),
      JSON.stringify(newWidgetStates)
    );
  };

  const handleToggleCollapse = (widgetId: string) => {
    if (!username) return;
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
          newItem.h = item.originalH || config.defaultLayout.h || 5;
        }
        return newItem;
      }
      return item;
    });

    const newLayouts = generateDerivedLayouts(newMasterLayout);
    setLayouts(newLayouts);
    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(newLayouts)
    );
    handleWidgetStateChange(widgetId, { isCollapsed: newIsCollapsed });
  };

  const setRuntimeWidgetHeight = useCallback(
    (widgetId: string, newH: number) => {
      setLayouts((prev) => {
        const updated: Layouts = {};
        for (const bp of Object.keys(prev)) {
          updated[bp] = (prev[bp] || []).map((item) =>
            item.i === widgetId ? { ...item, h: newH } : item
          );
        }
        return updated;
      });
    },
    []
  );

  const isEditableBreakpoint = EDITABLE_BREAKPOINTS.includes(currentBreakpoint);
  const finalIsEditMode = isEditMode && isEditableBreakpoint;

  return {
    widgets,
    layouts,
    widgetStates,
    isLoaded,
    isEditMode,
    isLibraryOpen,
    finalIsEditMode,
    isLargeScreen: isEditableBreakpoint,
    setIsEditMode,
    setIsLibraryOpen,
    onBreakpointChange,
    onLayoutChange,
    onAddWidget,
    onRemoveWidget,
    handleResetLayout,
    handleWidgetStateChange,
    handleToggleCollapse,
    setRuntimeWidgetHeight,
  };
}
