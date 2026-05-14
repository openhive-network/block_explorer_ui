// src/components/dashboard/WidgetIndex.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import Head from "next/head";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Move, X } from "lucide-react";

import WidgetRenderer from "@/components/dashboard/ui/WidgetRenderer";
import WidgetLibrary from "@/components/dashboard/ui/WidgetLibrary";
import dynamic from "next/dynamic";
const HiveFullChartDialog = dynamic(
  () => import("@/components/home/HiveFullChartDialog"),
  { ssr: false }
);
import DashboardControls from "@/components/dashboard/ui/DashboardControls";

import { useDashboard } from "@/components/dashboard/hooks/useDashboard";
import { useI18n } from "@/i18n/i18n";
import { useDashboardData } from "@/components/dashboard/hooks/useDashboardData";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { cn } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetIndex = () => {
  // Renamed from Home
  const { t } = useI18n();
  const [isFullHiveChartVisible, setIsFullHiveChartVisible] = useState(false);

  const {
    widgets,
    layouts,
    widgetStates,
    isLoaded,
    isEditMode,
    isLibraryOpen,
    finalIsEditMode,
    isLargeScreen,
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
  } = useDashboard();

  const { getWatched } = useWatchlist();

  useEffect(() => {
    if (!isLoaded) return;
    const watchedCount = getWatched("proposals").size;
    if (watchedCount === 0) return;
    const alreadyAdded = widgets.some((w) => w.type === "watched-proposals");
    if (!alreadyAdded) {
      const masterLayout = layouts.lg || [];
      const rightColBottom = masterLayout
        .filter((item) => item.x >= 9)
        .reduce((max, item) => Math.max(max, item.y + item.h), 0);
      onAddWidget("watched-proposals", { x: 9, y: rightColBottom, w: 2.95 });
    }
  }, [isLoaded, getWatched, widgets, onAddWidget, layouts]);

  const contentRefs = useRef(new Map<string, HTMLDivElement>());
  const widgetStatesRef = useRef(widgetStates);
  useEffect(() => { widgetStatesRef.current = widgetStates; }, [widgetStates]);

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

  const widgetElements = useMemo(() => {
    return (widgets || []).map((widget) => {
      const widgetConfig = WIDGET_REGISTRY[widget.type];
      if (!widgetConfig) return null;

      const widgetState = widgetStates[widget.i];

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
        finalIsEditMode
          ? "border-2 border-dashed border-slate-400 rounded-lg overflow-hidden cursor-move"
          : "border-2 border-transparent",
        !isEditMode && (isLayout ? "z-0" : "z-10")
      );

      const editControls = finalIsEditMode && (
        <>
          <div className="absolute top-2 left-2 z-20 text-white/50 pointer-events-none">
            <Move size={20} />
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onRemoveWidget(widget.i)}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center bg-slate-300 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-400 dark:hover:bg-slate-800 transition-all"
            aria-label={`Remove ${widget.type} widget`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </>
      );

      return (
        <div key={widget.i} className={wrapperClasses}>
          {editControls}
          {widgetConfig.dynamicHeight ? (
            <div
              ref={(el) => {
                if (el) contentRefs.current.set(widget.i, el);
                else contentRefs.current.delete(widget.i);
              }}
              className="w-full overflow-hidden"
            >
              <WidgetRenderer type={widget.type} props={finalProps} />
            </div>
          ) : (
            <WidgetRenderer type={widget.type} props={finalProps} />
          )}
        </div>
      );
    });
  }, [
    widgets,
    widgetStates,
    finalIsEditMode,
    isEditMode,
    dashboardData,
    onRemoveWidget,
    handleToggleCollapse,
    handleWidgetStateChange,
  ]);

  return (
    <>
      <Head>
        <title>{t("home.title")}</title>
      </Head>

      {isLargeScreen && (
        <DashboardControls
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onAddWidget={() => setIsLibraryOpen(true)}
          onResetLayout={handleResetLayout}
          t={t}
        />
      )}

      <ResponsiveGridLayout
        className="layout page-container"
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0 }}
        cols={{ xl: 12, lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={50}
        margin={[2, 2]}
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
