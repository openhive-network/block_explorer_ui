import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import {
  WIDGET_SEEDS,
  seedStorageKey,
  watchedProposalsDismissedKey,
} from "@/components/dashboard/lib/widgetSeeds";
import { MY_BOARD_KEY } from "@/components/dashboard/templates";
import {
  BoardSlot,
  captureBoard,
  clearBoardOrigin,
  clearBoardUndo,
  getBoardOriginStorageKey,
  getBoardUndoStorageKey,
  isUntouchedAdoption,
  readActiveBoardKey,
  readBoardUndo,
  resolveBoard,
  writeActiveBoardKey,
  writeAllOrNothing,
} from "../lib/boardSlots";
import { useAuth } from "@/contexts/AuthContext";

// Measured content heights, per breakpoint, per widget id.
type RuntimeHeights = Record<string, Record<string, number>>;

// generateDerivedLayouts rebuilds md/sm/xs from the lg master, so without this
// a phone-measured height is lost on the next board change.
const withRuntimeHeights = (
  next: Layouts,
  measured: RuntimeHeights
): Layouts => {
  const merged: Layouts = {};
  for (const bp of Object.keys(next)) {
    const heights = measured[bp];
    merged[bp] = heights
      ? (next[bp] || []).map((item) =>
          heights[item.i] !== undefined ? { ...item, h: heights[item.i] } : item
        )
      : next[bp];
  }
  return merged;
};

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
  const [activeBoardKey, setActiveBoardKey] = useState<string>(MY_BOARD_KEY);
  // Previewed template, in memory only: never written to storage or the bundle.
  const [templateView, setTemplateView] = useState<BoardSlot | null>(null);
  const [hasBoardUndo, setHasBoardUndo] = useState(false);
  const templateViewRef = useRef<BoardSlot | null>(null);
  const currentBreakpointRef = useRef<string>("lg");
  // Never persisted: measurements of rendered content, not authored layout.
  const runtimeHeightsRef = useRef<RuntimeHeights>({});

  // Template ids are deterministic, so a stale height would land on the new
  // board's same-id widget.
  const forgetRuntimeHeights = () => {
    runtimeHeightsRef.current = {};
  };

  const forgetWidgetHeight = (widgetId: string) => {
    for (const bp of Object.keys(runtimeHeightsRef.current)) {
      delete runtimeHeightsRef.current[bp][widgetId];
    }
  };
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("lg");
  const { username } = useAuth();

  useEffect(() => {
    // Another account is another set of widgets.
    forgetRuntimeHeights();
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

    const savedBoardKey = readActiveBoardKey(username);
    setActiveBoardKey(savedBoardKey);
    setTemplateView(
      savedBoardKey === MY_BOARD_KEY ? null : resolveBoard(savedBoardKey)
    );
    setHasBoardUndo(!!readBoardUndo(username));
    setIsLoaded(true);
  }, [username]);

  // Switching tabs never touches stored data; My board sits behind the preview.
  const viewBoard = useCallback(
    (boardKey: string) => {
      if (!username || boardKey === activeBoardKey) return;

      const next = boardKey === MY_BOARD_KEY ? null : resolveBoard(boardKey);
      if (boardKey !== MY_BOARD_KEY && !next) return;

      setTemplateView(next);
      setActiveBoardKey(boardKey);
      setIsEditMode(false);
      writeActiveBoardKey(username, boardKey);
    },
    [username, activeBoardKey]
  );

  // Copies a template onto My board, parking the replaced board in a snapshot.
  const adoptTemplate = useCallback(
    (boardKey: string) => {
      if (!username) return false;
      const slot = resolveBoard(boardKey);
      if (!slot) return false;

      const nextLayouts = generateDerivedLayouts(slot.masterLayout);

      // Both auto-add effects place widgets at y:0, colliding with the masthead,
      // so adopting settles them all. Their prior values ride in the undo
      // snapshot, or undo would restore the board without its seeding history.
      const autoAddKeys = [
        ...WIDGET_SEEDS.map((seed) => seedStorageKey(seed.flag, username)),
        watchedProposalsDismissedKey(username),
      ];
      const previous: BoardSlot = {
        ...captureBoard(widgets, layouts, widgetStates),
        autoAddFlags: Object.fromEntries(
          autoAddKeys.map((key) => [key, localStorage.getItem(key)])
        ),
      };

      // An untouched adoption must not overwrite the user's own snapshot.
      const keepExistingUndo =
        isUntouchedAdoption(username) && !!readBoardUndo(username);

      const settleAutoAdds = autoAddKeys.map(
        (key) => [key, "true"] as [string, string]
      );

      const committed = writeAllOrNothing([
        ...(keepExistingUndo
          ? []
          : ([
              [getBoardUndoStorageKey(username), JSON.stringify(previous)],
            ] as Array<[string, string]>)),
        [getBoardOriginStorageKey(username), boardKey],
        [getWidgetsStorageKey(username), JSON.stringify(slot.widgets)],
        [getLayoutStorageKey(username), JSON.stringify(nextLayouts)],
        [
          getWidgetStatesStorageKey(username),
          JSON.stringify(slot.widgetStates),
        ],
        ...settleAutoAdds,
      ]);
      // The caller surfaces the failure: a hook should not own UI.
      if (!committed) return false;

      forgetRuntimeHeights();
      setWidgets(slot.widgets);
      setLayouts(nextLayouts);
      setWidgetStates(slot.widgetStates);
      setTemplateView(null);
      setActiveBoardKey(MY_BOARD_KEY);
      setHasBoardUndo(true);
      writeActiveBoardKey(username, MY_BOARD_KEY);
      return true;
    },
    [username, widgets, layouts, widgetStates]
  );

  const restorePreviousBoard = useCallback(() => {
    if (!username) return false;
    const previous = readBoardUndo(username);
    if (!previous) return false;

    const nextLayouts = generateDerivedLayouts(previous.masterLayout);
    // Adopting forced every auto-add flag on; undo puts back what was there.
    const restoredFlags = Object.entries(previous.autoAddFlags ?? {});
    const committed = writeAllOrNothing([
      [getWidgetsStorageKey(username), JSON.stringify(previous.widgets)],
      [getLayoutStorageKey(username), JSON.stringify(nextLayouts)],
      [
        getWidgetStatesStorageKey(username),
        JSON.stringify(previous.widgetStates),
      ],
      ...restoredFlags.filter(
        (entry): entry is [string, string] => entry[1] !== null
      ),
    ]);
    if (!committed) return false;

    // Cleared outside the atomic write: a stale flag only delays a re-seed,
    // while a half-written board is unrecoverable.
    restoredFlags.forEach(([key, value]) => {
      if (value !== null) return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Best effort.
      }
    });

    clearBoardUndo(username);
    // The restored board is the user's own again, not an adoption.
    clearBoardOrigin(username);
    forgetRuntimeHeights();
    setWidgets(previous.widgets);
    setLayouts(nextLayouts);
    setWidgetStates(previous.widgetStates);
    setTemplateView(null);
    setActiveBoardKey(MY_BOARD_KEY);
    setHasBoardUndo(false);
    writeActiveBoardKey(username, MY_BOARD_KEY);
    return true;
  }, [username]);

  useEffect(() => {
    templateViewRef.current = templateView;
  }, [templateView]);

  useEffect(() => {
    currentBreakpointRef.current = currentBreakpoint;
  }, [currentBreakpoint]);

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
      clearBoardOrigin(username);
    }
  };

  const onAddWidget = useCallback(
    (
      widgetType: string,
      layoutOverride?: Partial<Layout>,
      initialState?: Record<string, unknown>
    ) => {
      if (!username) return false;
      const widgetConfig = WIDGET_REGISTRY[widgetType];
      // Enforced here too: a board can arrive already carrying a singleton.
      if (
        widgetConfig?.allowMultiple === false &&
        widgets.some((w) => w.type === widgetType)
      ) {
        return false;
      }
      const newWidgetId = `${widgetType}-${Date.now()}`;
      const newWidgets = [...widgets, { i: newWidgetId, type: widgetType }];
      setWidgets(newWidgets);
      localStorage.setItem(
        getWidgetsStorageKey(username),
        JSON.stringify(newWidgets)
      );
      clearBoardOrigin(username);

      const masterLayout = layouts.lg || [];
      const newY = masterLayout.reduce(
        (maxY, item) => Math.max(maxY, item.y + item.h),
        0
      );
      // Mastheads go above the board rather than at the end.
      const placement =
        widgetConfig.placement === "masthead"
          ? { x: 0, y: 0, w: 12 }
          : undefined;
      const override = layoutOverride ?? placement;
      const newLayoutItem: Layout = {
        ...widgetConfig.defaultLayout,
        i: newWidgetId,
        x: 0,
        y: newY,
        ...override,
      };

      // For an explicit top placement (e.g. Watched Proposals at y:0), push the
      // overlapping column down by the new item's height so it lands above the
      // existing widgets, not after them.
      const nw = newLayoutItem.w ?? 0;
      const nh = newLayoutItem.h ?? 0;
      const baseLayout =
        override?.y !== undefined
          ? masterLayout.map((item) =>
              item.x < newLayoutItem.x + nw &&
              item.x + item.w > newLayoutItem.x &&
              item.y >= newLayoutItem.y
                ? { ...item, y: item.y + nh }
                : item
            )
          : masterLayout;

      const newLayouts = generateDerivedLayouts([...baseLayout, newLayoutItem]);
      setLayouts(withRuntimeHeights(newLayouts, runtimeHeightsRef.current));
      localStorage.setItem(
        getLayoutStorageKey(username),
        JSON.stringify(newLayouts)
      );
      if (initialState) {
        const nextStates = { ...widgetStates, [newWidgetId]: initialState };
        setWidgetStates(nextStates);
        localStorage.setItem(
          getWidgetStatesStorageKey(username),
          JSON.stringify(nextStates)
        );
      }

      // The library stays open: building a board means adding several widgets,
      // and it is where the "already added" state is shown. The user closes it.
      return true;
    },
    [widgets, layouts, widgetStates, username]
  );

  const onRemoveWidget = (widgetId: string) => {
    if (!username) return;
    const newWidgets = widgets.filter((w) => w.i !== widgetId);
    setWidgets(newWidgets);
    localStorage.setItem(
      getWidgetsStorageKey(username),
      JSON.stringify(newWidgets)
    );
    clearBoardOrigin(username);

    // Its measurements go with it, or a later widget reusing the id inherits them.
    forgetWidgetHeight(widgetId);

    const masterLayout = (layouts.lg || []).filter((l) => l.i !== widgetId);
    const newLayouts = generateDerivedLayouts(masterLayout);
    setLayouts(withRuntimeHeights(newLayouts, runtimeHeightsRef.current));
    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(newLayouts)
    );
  };

  // Only ever resets My board; the caller owns the confirmation dialog.
  const handleResetLayout = () => {
    if (!username || templateView) return;

    const initial = createInitialLayoutsAndStates();
    const nextWidgets = DEFAULT_WIDGETS;
    const nextLayouts = initial.layouts;
    const nextStates = initial.widgetStates;
    WIDGET_SEEDS.forEach((seed) =>
      localStorage.removeItem(seedStorageKey(seed.flag, username))
    );
    localStorage.removeItem(watchedProposalsDismissedKey(username));

    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(nextLayouts)
    );
    localStorage.setItem(
      getWidgetsStorageKey(username),
      JSON.stringify(nextWidgets)
    );
    localStorage.setItem(
      getWidgetStatesStorageKey(username),
      JSON.stringify(nextStates)
    );

    // The replaced board is gone, so its undo snapshot must not outlive it.
    clearBoardOrigin(username);
    clearBoardUndo(username);
    setHasBoardUndo(false);
    forgetRuntimeHeights();
    setWidgets(nextWidgets);
    setLayouts(nextLayouts);
    setWidgetStates(nextStates);
    setIsEditMode(false);
  };

  const handleWidgetStateChange = (widgetId: string, newState: any) => {
    if (!username) return;
    // A preview keeps its state in memory, never in the user's board storage.
    if (templateView) {
      setTemplateView({
        ...templateView,
        widgetStates: {
          ...templateView.widgetStates,
          [widgetId]: { ...templateView.widgetStates[widgetId], ...newState },
        },
      });
      return;
    }
    const newWidgetStates = {
      ...widgetStates,
      [widgetId]: { ...widgetStates[widgetId], ...newState },
    };
    setWidgetStates(newWidgetStates);
    localStorage.setItem(
      getWidgetStatesStorageKey(username),
      JSON.stringify(newWidgetStates)
    );
    // Collapsing is UI state, not authorship, so it must not count as an edit.
    if (Object.keys(newState).some((key) => key !== "isCollapsed")) {
      clearBoardOrigin(username);
    }
  };

  const handleToggleCollapse = (widgetId: string) => {
    if (!username) return;
    const sourceWidgets = templateView ? templateView.widgets : widgets;
    const sourceStates = templateView
      ? templateView.widgetStates
      : widgetStates;
    const sourceMaster = templateView
      ? templateView.masterLayout
      : layouts.lg || [];

    const widgetType = sourceWidgets.find((w) => w.i === widgetId)?.type;
    const config = widgetType ? WIDGET_REGISTRY[widgetType] : undefined;
    if (!config?.collapsible) return;

    const currentState = sourceStates[widgetId] || {};
    const newIsCollapsed = !currentState.isCollapsed;

    const newMasterLayout = sourceMaster.map((item: ExtendedLayout) => {
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

    if (templateView) {
      setTemplateView({
        ...templateView,
        masterLayout: newMasterLayout,
        widgetStates: {
          ...templateView.widgetStates,
          [widgetId]: {
            ...templateView.widgetStates[widgetId],
            isCollapsed: newIsCollapsed,
          },
        },
      });
      return;
    }

    // Collapsing overrides the measurement; expanding re-measures.
    forgetWidgetHeight(widgetId);

    const newLayouts = generateDerivedLayouts(newMasterLayout);
    setLayouts(withRuntimeHeights(newLayouts, runtimeHeightsRef.current));
    localStorage.setItem(
      getLayoutStorageKey(username),
      JSON.stringify(newLayouts)
    );
    handleWidgetStateChange(widgetId, { isCollapsed: newIsCollapsed });
  };

  const setRuntimeWidgetHeight = useCallback(
    (widgetId: string, newH: number) => {
      // Template ids are deterministic, so an adopted board shares them. Writing
      // a preview's measurement into My board would resize the real widget.
      if (templateViewRef.current) {
        setTemplateView((prev) =>
          prev
            ? {
                ...prev,
                masterLayout: prev.masterLayout.map((item) =>
                  item.i === widgetId ? { ...item, h: newH } : item
                ),
              }
            : prev
        );
        return;
      }
      // Only the breakpoint that was measured: a masthead is a stacked card on a
      // phone and a single row on desktop, so one height cannot serve both.
      const bp = currentBreakpointRef.current;
      runtimeHeightsRef.current = {
        ...runtimeHeightsRef.current,
        [bp]: { ...runtimeHeightsRef.current[bp], [widgetId]: newH },
      };
      setLayouts((prev) => ({
        ...prev,
        [bp]: (prev[bp] || []).map((item) =>
          item.i === widgetId ? { ...item, h: newH } : item
        ),
      }));
    },
    []
  );

  const isTemplateView = !!templateView;
  const displayedLayouts = useMemo(
    () =>
      templateView
        ? generateDerivedLayouts(templateView.masterLayout)
        : layouts,
    [templateView, layouts]
  );

  const isEditableBreakpoint = EDITABLE_BREAKPOINTS.includes(currentBreakpoint);
  // A template is never editable, at any breakpoint.
  const finalIsEditMode = isEditMode && isEditableBreakpoint && !isTemplateView;

  return {
    widgets: templateView ? templateView.widgets : widgets,
    layouts: displayedLayouts,
    widgetStates: templateView ? templateView.widgetStates : widgetStates,
    isLoaded,
    isEditMode,
    isLibraryOpen,
    activeBoardKey,
    isTemplateView,
    hasBoardUndo,
    // Always My board: the board an adoption would replace.
    myBoardWidgetCount: widgets.length,
    finalIsEditMode,
    isLargeScreen: isEditableBreakpoint,
    setIsEditMode,
    setIsLibraryOpen,
    viewBoard,
    adoptTemplate,
    restorePreviousBoard,
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
