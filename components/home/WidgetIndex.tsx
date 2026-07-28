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

import { useDashboard } from "@/components/dashboard/hooks/useDashboard";
import { useI18n } from "@/i18n/i18n";
import { useDashboardData } from "@/components/dashboard/hooks/useDashboardData";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import { DEFAULT_WIDGETS } from "@/components/dashboard/lib/dashboard.config";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WidgetIndex = () => {
  const { t, dir } = useI18n();
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
  const { username } = useAuth();

  // One-time seed of the Network Growth widget (#723) for users with a saved
  // dashboard; the seeded flag lets them remove it for good afterwards.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_growth_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    localStorage.setItem(seededKey, "true");
    if (widgets.some((w) => w.type === "network-growth")) return;
    const masterLayout = layouts.lg || [];
    const mainColBottom = masterLayout
      .filter((item) => item.x >= 3 && item.x < 9)
      .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("network-growth", {
      x: 3,
      y: mainColBottom,
      w: 6,
      h: 3.3,
      minH: 3,
    });
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the HP Momentum widget (#721) for users with a saved
  // dashboard; the seeded flag lets them remove it for good afterwards.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_hp_momentum_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    localStorage.setItem(seededKey, "true");
    if (widgets.some((w) => w.type === "hp-momentum")) return;
    const masterLayout = layouts.lg || [];
    const mainColBottom = masterLayout
      .filter((item) => item.x >= 3 && item.x < 9)
      .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("hp-momentum", {
      x: 3,
      y: mainColBottom,
      w: 6,
      h: 9,
      minH: 6,
    });
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Daily Active Users widget for users with a saved
  // dashboard; the seeded flag lets them remove it for good afterwards.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_daily_active_users_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    localStorage.setItem(seededKey, "true");
    if (widgets.some((w) => w.type === "daily-active-users")) return;
    const masterLayout = layouts.lg || [];
    // Place directly below network-growth; fall back to bottom of main column.
    const networkGrowthId = widgets.find((w) => w.type === "network-growth")?.i;
    const networkGrowthItem = networkGrowthId
      ? masterLayout.find((item) => item.i === networkGrowthId)
      : undefined;
    const insertY = networkGrowthItem
      ? networkGrowthItem.y + networkGrowthItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("daily-active-users", {
      x: networkGrowthItem?.x ?? 3,
      y: insertY,
      w: networkGrowthItem?.w ?? 6,
      h: 3.3,
      minH: 3,
    });
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Op Mix widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_op_mix_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "op-mix")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    const dauId = widgets.find((w) => w.type === "daily-active-users")?.i;
    const dauItem = dauId
      ? masterLayout.find((item) => item.i === dauId)
      : undefined;
    const insertY = dauItem
      ? dauItem.y + dauItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("op-mix", {
      x: dauItem?.x ?? 3,
      y: insertY,
      w: dauItem?.w ?? 6,
      h: 3.3,
      minH: 3,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Top Accounts widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_top_accounts_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "top-accounts")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place directly below top-witnesses in the right column; fall back to the
    // bottom of the right column.
    const topWitnessesId = widgets.find((w) => w.type === "top-witnesses")?.i;
    const topWitnessesItem = topWitnessesId
      ? masterLayout.find((item) => item.i === topWitnessesId)
      : undefined;
    const insertY = topWitnessesItem
      ? topWitnessesItem.y + topWitnessesItem.h
      : masterLayout
          .filter((item) => item.x >= 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("top-accounts", {
      x: topWitnessesItem?.x ?? 9,
      y: insertY,
      w: 3,
      h: 11,
      minH: 8,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Voting Activity widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_voting_activity_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "voting-activity")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place directly below blockchain-dates in the left column; fall back to bottom of left column.
    const blockchainDatesId = widgets.find(
      (w) => w.type === "blockchain-dates"
    )?.i;
    const blockchainDatesItem = blockchainDatesId
      ? masterLayout.find((item) => item.i === blockchainDatesId)
      : undefined;
    const insertY = blockchainDatesItem
      ? blockchainDatesItem.y + blockchainDatesItem.h
      : masterLayout
          .filter((item) => item.x < 3)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("voting-activity", {
      x: blockchainDatesItem?.x ?? 0,
      y: insertY,
      w: 3,
      h: 5.8,
      minH: 4,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Network HP Distribution widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_hp_distribution_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "network-hp-distribution")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place below voting-activity if present; otherwise at the bottom of the left column.
    const votingActivityId = widgets.find(
      (w) => w.type === "voting-activity"
    )?.i;
    const anchorItem = votingActivityId
      ? masterLayout.find((item) => item.i === votingActivityId)
      : undefined;
    const leftColBottom = masterLayout
      .filter((item) => item.x < 3)
      .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    const insertY = anchorItem ? anchorItem.y + anchorItem.h : leftColBottom;
    onAddWidget("network-hp-distribution", {
      x: anchorItem?.x ?? 0,
      y: insertY,
      w: 3,
      h: 7,
      minH: 5,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Account Retention Funnel widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_account_retention_funnel_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "account-retention-funnel")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    const dauId = widgets.find((w) => w.type === "daily-active-users")?.i;
    const dauItem = dauId
      ? masterLayout.find((item) => item.i === dauId)
      : undefined;
    const insertY = dauItem
      ? dauItem.y + dauItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("account-retention-funnel", {
      x: dauItem?.x ?? 3,
      y: insertY,
      w: dauItem?.w ?? 6,
      h: 3.3,
      minH: 3,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Content Volume widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_content_volume_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "network-content-volume")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place directly below hp-momentum; fall back to bottom of main column.
    const hpMomentumId = widgets.find((w) => w.type === "hp-momentum")?.i;
    const anchorItem = hpMomentumId
      ? masterLayout.find((item) => item.i === hpMomentumId)
      : undefined;
    const insertY = anchorItem
      ? anchorItem.y + anchorItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("network-content-volume", {
      x: anchorItem?.x ?? 3,
      y: insertY,
      w: anchorItem?.w ?? 6,
      h: 5,
      minH: 4,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Engagement Quality widget for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_engagement_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "network-engagement")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place directly below op-mix; fall back to bottom of the main column.
    const opMixId = widgets.find((w) => w.type === "op-mix")?.i;
    const opMixItem = opMixId
      ? masterLayout.find((item) => item.i === opMixId)
      : undefined;
    const insertY = opMixItem
      ? opMixItem.y + opMixItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("network-engagement", {
      x: opMixItem?.x ?? 3,
      y: insertY,
      w: opMixItem?.w ?? 6,
      h: 5,
      minH: 4,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Network RC Utilization widget (#752) for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_rc_utilization_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "network-rc-utilization")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    const opMixId = widgets.find((w) => w.type === "op-mix")?.i;
    const opMixItem = opMixId
      ? masterLayout.find((item) => item.i === opMixId)
      : undefined;
    const insertY = opMixItem
      ? opMixItem.y + opMixItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("network-rc-utilization", {
      x: opMixItem?.x ?? 3,
      y: insertY,
      w: opMixItem?.w ?? 6,
      h: 3.3,
      minH: 3,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // One-time seed of the Network DApp Usage widget (#757) for users with a saved dashboard.
  useEffect(() => {
    if (!isLoaded || !username) return;
    const seededKey = `hivescan_dashboard_network_dapp_usage_seeded_${username}`;
    if (localStorage.getItem(seededKey)) return;
    if (widgets.some((w) => w.type === "network-dapp-usage")) {
      localStorage.setItem(seededKey, "true");
      return;
    }
    const masterLayout = layouts.lg || [];
    // Place directly below network-content-volume; fall back to bottom of main column.
    const contentVolumeId = widgets.find(
      (w) => w.type === "network-content-volume"
    )?.i;
    const anchorItem = contentVolumeId
      ? masterLayout.find((item) => item.i === contentVolumeId)
      : undefined;
    const insertY = anchorItem
      ? anchorItem.y + anchorItem.h
      : masterLayout
          .filter((item) => item.x >= 3 && item.x < 9)
          .reduce((max, item) => Math.max(max, item.y + item.h), 0);
    onAddWidget("network-dapp-usage", {
      x: anchorItem?.x ?? 3,
      y: insertY,
      w: anchorItem?.w ?? 6,
      h: 7,
      minH: 5,
    });
    localStorage.setItem(seededKey, "true");
  }, [isLoaded, username, widgets, layouts, onAddWidget]);

  // Watched Proposals auto-appears the first time you watch a proposal (unless
  // X-dismissed). A manual add is respected — it's never auto-removed when the
  // watchlist is empty.
  const watchedProposalsCount = getWatched("proposals").size;
  useEffect(() => {
    if (!isLoaded || !username) return;
    const dismissedKey = `hivescan_dashboard_watched_proposals_dismissed_${username}`;
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
  }, [isLoaded, username, watchedProposalsCount, widgets, onAddWidget]);

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
        localStorage.setItem(
          `hivescan_dashboard_watched_proposals_dismissed_${username}`,
          "true"
        );
      }
      onRemoveWidget(widgetId);
    },
    [widgets, onRemoveWidget, username]
  );

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
        widgetConfig.collapsible &&
          "[&_.data-box]:mt-0 [&_.data-box-chart]:mt-0",
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
            onClick={() => handleRemoveWidget(widget.i)}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center bg-slate-300 dark:bg-slate-700 text-white rounded-full shadow-lg hover:bg-slate-400 dark:hover:bg-slate-800 transition-all"
            aria-label={`Remove ${widget.type} widget`}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </>
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
              <NodeSupportGate widgetId={widget.type}>
                <WidgetRenderer type={widget.type} props={finalProps} />
              </NodeSupportGate>
            </div>
          ) : (
            <NodeSupportGate widgetId={widget.type}>
              <WidgetRenderer type={widget.type} props={finalProps} />
            </NodeSupportGate>
          )}
        </div>
      );
    });
  }, [
    dir,
    widgets,
    widgetStates,
    finalIsEditMode,
    isEditMode,
    dashboardData,
    handleRemoveWidget,
    handleToggleCollapse,
    handleWidgetStateChange,
  ]);

  if (!isLoaded) return null;

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
        style={{ direction: "ltr" }}
        layouts={layouts}
        breakpoints={{ lg: 1024, md: 768, sm: 640, xs: 0 }}
        cols={{ xl: 12, lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={50}
        margin={[8, 2]}
        containerPadding={[2, 2]}
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
