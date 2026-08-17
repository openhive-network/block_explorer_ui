import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Head from "next/head";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Move, X } from "lucide-react";

import WidgetRenderer from "@/components/dashboard/ui/WidgetRenderer";
import WidgetLibrary from "@/components/dashboard/ui/WidgetLibrary";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";
import dynamic from "next/dynamic";
const HiveFullChartDialog = dynamic(
  () => import("@/components/home/HiveFullChartDialog"),
  { ssr: false }
);
import DashboardControls from "@/components/dashboard/ui/DashboardControls";
import BoardTabs from "@/components/dashboard/ui/BoardTabs";

import { useDashboard } from "@/components/dashboard/hooks/useDashboard";
import {
  MY_BOARD_KEY,
  getBoardTemplate,
} from "@/components/dashboard/templates";
import TemplatePreviewBar from "@/components/dashboard/ui/TemplatePreviewBar";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { resolveSeeds } from "@/components/dashboard/lib/boardSlots";
import { useI18n } from "@/i18n/i18n";
import { useDashboardData } from "@/components/dashboard/hooks/useDashboardData";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import {
  COLUMN_W,
  COLUMN_X,
  WIDGET_SEEDS,
  inColumn,
  seedStorageKey,
  watchedProposalsDismissedKey,
} from "@/components/dashboard/lib/widgetSeeds";
import { DEFAULT_WIDGETS } from "@/components/dashboard/lib/dashboard.config";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  applyBundle,
  clearRestoreUndo,
  readRestoreUndo,
} from "@/utils/workspaceSync";
import { cn } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetIndex = () => {
  const { t, dir } = useI18n();
  const [isFullHiveChartVisible, setIsFullHiveChartVisible] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const {
    widgets,
    layouts,
    widgetStates,
    isLoaded,
    isEditMode,
    isLibraryOpen,
    activeBoardKey,
    isTemplateView,
    hasBoardUndo,
    myBoardWidgetCount,
    finalIsEditMode,
    isLargeScreen,
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
  } = useDashboard();

  const isOwnBoard = activeBoardKey === MY_BOARD_KEY;

  const { getWatched } = useWatchlist();
  const { username } = useAuth();

  // Read once: a restore reloads the page, so the snapshot is either already
  // there on mount or not coming. Undoing reloads again, which clears it.
  const [hasRestoreUndo, setHasRestoreUndo] = useState(false);
  useEffect(() => {
    setHasRestoreUndo(!!username && !!readRestoreUndo(username));
  }, [username]);

  // Resetting replaces the board the snapshot was taken against, so undoing
  // afterwards would resurrect something the user has already thrown away.
  const handleResetLayoutAndUndo = useCallback(() => {
    if (username) clearRestoreUndo(username);
    setHasRestoreUndo(false);
    handleResetLayout();
  }, [username, handleResetLayout]);

  const handleUndoRestore = useCallback(() => {
    if (!username) return;
    const snapshot = readRestoreUndo(username);
    if (!snapshot) {
      setHasRestoreUndo(false);
      return;
    }
    // The saved workspace itself has not changed, so the sync fingerprint stays
    // put — undoing must not start the restore prompt asking again.
    applyBundle(username, snapshot);
    clearRestoreUndo(username);
    window.location.reload();
  }, [username]);

  // Read by the seeding pass, deliberately not depended on: every ResizeObserver
  // tick replaces `layouts` and onAddWidget's identity, which would re-run the
  // whole localStorage scan. `widgets` changing is the real trigger.
  const seedInputsRef = useRef({ layouts, onAddWidget });
  useEffect(() => {
    seedInputsRef.current = { layouts, onAddWidget };
  }, [layouts, onAddWidget]);

  // Seeds each new widget once into an existing saved dashboard. One per pass:
  // onAddWidget re-renders, and the next seed needs the previous one placed
  // before it can anchor to it.
  useEffect(() => {
    if (!isLoaded || !username || !isOwnBoard) return;
    const { layouts: currentLayouts, onAddWidget: addWidget } =
      seedInputsRef.current;
    const masterLayout = currentLayouts.lg || [];

    for (const seed of WIDGET_SEEDS) {
      const seededKey = seedStorageKey(seed.flag, username);
      if (localStorage.getItem(seededKey)) continue;

      // Marked done only once the widget is actually on the board, so a
      // refused add cannot leave the seed flagged and never retried.
      if (widgets.some((w) => w.type === seed.type)) {
        localStorage.setItem(seededKey, "true");
        continue;
      }

      const anchorId = seed.anchor
        ? widgets.find((w) => w.type === seed.anchor)?.i
        : undefined;
      const anchor = anchorId
        ? masterLayout.find((item) => item.i === anchorId)
        : undefined;

      const layout = seed.masthead
        ? { x: 0, y: 0, w: 12, h: seed.h, minH: seed.minH }
        : {
            x: anchor?.x ?? COLUMN_X[seed.column],
            y: anchor
              ? anchor.y + anchor.h
              : masterLayout
                  .filter((item) => inColumn(seed.column, item.x))
                  .reduce((max, item) => Math.max(max, item.y + item.h), 0),
            w: seed.w ?? anchor?.w ?? COLUMN_W[seed.column],
            h: seed.h,
            minH: seed.minH,
          };

      // A refusal is flagged here instead, or the loop would retry every render.
      if (!addWidget(seed.type, layout, seed.state)) {
        localStorage.setItem(seededKey, "true");
        continue;
      }
      return;
    }
  }, [isLoaded, username, isOwnBoard, widgets]);

  // Watched Proposals auto-appears the first time you watch a proposal (unless
  // X-dismissed). A manual add is respected — it's never auto-removed when the
  // watchlist is empty.
  const watchedProposalsCount = getWatched("proposals").size;
  useEffect(() => {
    if (!isLoaded || !username || !isOwnBoard) return;
    const dismissedKey = watchedProposalsDismissedKey(username);
    // handleResetLayout sets widgets to the DEFAULT_WIDGETS reference.
    if (widgets === DEFAULT_WIDGETS) localStorage.removeItem(dismissedKey);
    // Empty watchlist clears the dismiss flag, so watching again re-adds the widget.
    if (watchedProposalsCount === 0) {
      localStorage.removeItem(dismissedKey);
      return;
    }
    const present = widgets.find((w) => w.type === "watched-proposals");
    if (present || localStorage.getItem(dismissedKey)) return;
    onAddWidget("watched-proposals", { x: 9, y: 0, w: 3 });
  }, [
    isLoaded,
    username,
    isOwnBoard,
    watchedProposalsCount,
    widgets,
    onAddWidget,
  ]);

  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const widgetStatesRef = useRef(widgetStates);
  useEffect(() => {
    widgetStatesRef.current = widgetStates;
  }, [widgetStates]);

  useEffect(() => {
    const ROW_HEIGHT = 50;
    const MARGIN_Y = 2;
    const observers: ResizeObserver[] = [];

    widgets.forEach((widget) => {
      const config = WIDGET_REGISTRY[widget.type];
      if (!config?.dynamicHeight) return;

      const el = contentRefs.current.get(widget.i);
      if (!el) return;

      const floor = config.defaultLayout.minH ?? config.defaultLayout.h;

      const observer = new ResizeObserver(([entry]) => {
        if (finalIsEditMode) return;
        if (widgetStatesRef.current[widget.i]?.isCollapsed) return;
        const contentPx = entry.contentRect.height;
        const contentH = (contentPx + MARGIN_Y) / (ROW_HEIGHT + MARGIN_Y);
        const targetH = Math.max(contentH, floor);
        setRuntimeWidgetHeight(widget.i, Math.ceil(targetH * 10) / 10);
      });

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [widgets, finalIsEditMode, setRuntimeWidgetHeight]);

  const dashboardData = useDashboardData(widgets);

  // Removing Watched Proposals via X persists a dismiss flag so the effect
  // above doesn't re-add it on navigation/refresh.
  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      const removed = widgets.find((w) => w.i === widgetId);
      if (removed?.type === "watched-proposals" && username) {
        localStorage.setItem(watchedProposalsDismissedKey(username), "true");
      }
      onRemoveWidget(widgetId);
    },
    [widgets, onRemoveWidget, username]
  );

  // Memoised because resolveSeeds rebuilds every array it walks: a widget that
  // mirrors an array prop into local state (Quick Links) would reset on every
  // head-block tick, discarding whatever the user was typing.
  const resolvedStates = useMemo(
    () =>
      resolveSeeds(widgetStates, {
        t,
        username: username ?? undefined,
      }) as Record<string, any>,
    [widgetStates, t, username]
  );

  const widgetElements = useMemo(() => {
    return (widgets || []).map((widget) => {
      const widgetConfig = WIDGET_REGISTRY[widget.type];
      if (!widgetConfig) return null;

      const widgetState = resolvedStates[widget.i];

      const actions = {
        setIsFullHiveChartVisible,
        handleToggleCollapse: () => handleToggleCollapse(widget.i),
        handleWidgetStateChange: (newState: object) =>
          handleWidgetStateChange(widget.i, newState),
      };

      const widgetSpecificProps = widgetConfig.getProps
        ? widgetConfig.getProps(dashboardData, widgetState, actions)
        : {};

      const finalProps = {
        ...widgetSpecificProps,
        isEditMode: finalIsEditMode,
      };

      const isLayout = widgetConfig?.isLayoutWidget;
      const wrapperClasses = cn(
        "h-full relative",
        widgetConfig.dynamicHeight
          ? "instant-height"
          : "transition-all duration-200",
        widgetConfig.collapsible &&
          "[&_.data-box]:mt-0 [&_.data-box-chart]:mt-0",
        finalIsEditMode
          ? "border-2 border-dashed border-slate-400 rounded-lg overflow-hidden cursor-move"
          : "border-2 border-transparent",
        !isEditMode && (isLayout ? "z-0" : "z-10")
      );

      const editControls = finalIsEditMode && (
        <>
          <div className="absolute top-2 start-2 z-20 text-white/50 pointer-events-none">
            <Move size={20} />
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => handleRemoveWidget(widget.i)}
            className="absolute top-2 end-2 z-20 w-7 h-7 flex items-center justify-center bg-slate-300 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-400 dark:hover:bg-slate-800 transition-all"
            aria-label={`Remove ${widget.type} widget`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </>
      );

      const rendered = (
        <NodeSupportGate widgetId={widget.type}>
          <WidgetRenderer type={widget.type} props={finalProps} />
        </NodeSupportGate>
      );

      return (
        <div key={widget.i} className={wrapperClasses} dir={dir}>
          {editControls}
          {widgetConfig.dynamicHeight ? (
            <div
              ref={(el) => {
                if (el) contentRefs.current.set(widget.i, el);
                else contentRefs.current.delete(widget.i);
              }}
              className="w-full overflow-hidden"
            >
              {rendered}
            </div>
          ) : (
            rendered
          )}
        </div>
      );
    });
  }, [
    dir,
    // Seeded copy is resolved into this, so a language change re-renders it.
    resolvedStates,
    widgets,
    finalIsEditMode,
    isEditMode,
    dashboardData,
    handleRemoveWidget,
    handleToggleCollapse,
    handleWidgetStateChange,
  ]);

  const handleRestorePreviousBoard = () => {
    if (!restorePreviousBoard()) toast.error(t("dashbord.boardSwitchFailed"));
  };

  const handleAdoptTemplate = () => {
    const template = getBoardTemplate(activeBoardKey);
    if (!template) return;
    if (!adoptTemplate(activeBoardKey)) {
      toast.error(t("dashbord.boardSwitchFailed"));
      return;
    }
    toast.success(
      t("boards.adopt.done").replace("{board}", t(template.nameKey)),
      {
        action: {
          label: t("boards.adopt.undo"),
          onClick: handleRestorePreviousBoard,
        },
      }
    );
  };

  if (!isLoaded) return null;

  return (
    <>
      <Head>
        <title>{t("home.title")}</title>
      </Head>

      <BoardTabs activeBoardKey={activeBoardKey} onApplyBoard={viewBoard} />

      {isTemplateView && (
        <TemplatePreviewBar
          boardKey={activeBoardKey}
          replacedWidgetCount={myBoardWidgetCount}
          onConfirm={handleAdoptTemplate}
        />
      )}

      {/* Adopting and restoring work on any screen, so either pending undo
          shows the cluster even where editing is unavailable. */}
      {!isTemplateView && (isLargeScreen || hasBoardUndo || hasRestoreUndo) && (
        <DashboardControls
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onAddWidget={() => setIsLibraryOpen(true)}
          onResetLayout={() => setIsResetConfirmOpen(true)}
          hasBoardUndo={hasBoardUndo}
          onRestorePreviousBoard={handleRestorePreviousBoard}
          hasRestoreUndo={hasRestoreUndo}
          onUndoRestore={handleUndoRestore}
          showEditControls={isLargeScreen}
          t={t}
        />
      )}

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title={t("dashbord.restoreTitle")}
        description={t("dashbord.restoreWarning")}
        confirmLabel={t("dashbord.restoreConfirm")}
        cancelLabel={t("boards.adopt.cancel")}
        isDestructive
        onConfirm={handleResetLayoutAndUndo}
      />

      <ResponsiveGridLayout
        className="layout page-container"
        style={{ direction: "ltr" }}
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0 }}
        cols={{ xl: 12, lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={50}
        margin={[8, 2]}
        containerPadding={[2, 0]}
        onLayoutChange={onLayoutChange}
        onBreakpointChange={onBreakpointChange}
        compactType="vertical"
        isDraggable={finalIsEditMode}
        isResizable={finalIsEditMode}
        resizeHandles={
          finalIsEditMode ? ["s", "w", "e", "n", "sw", "nw", "se", "ne"] : []
        }
      >
        {widgetElements}
      </ResponsiveGridLayout>

      <WidgetLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddWidget={onAddWidget}
        existingWidgets={widgets}
      />
      <HiveFullChartDialog
        isOpen={isFullHiveChartVisible}
        handleHiveFullChartVisibility={() => setIsFullHiveChartVisible(false)}
      />
    </>
  );
};

export default WidgetIndex;
