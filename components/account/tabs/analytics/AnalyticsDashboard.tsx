import React, { useMemo } from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import ReportLibrary from "./ReportLibrary";
import { Move, X, RotateCcw } from "lucide-react";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import { useI18n } from "@/i18n/i18n";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { reportRegistry } from "./reportRegistry";
import { ReportExportsProvider, useReportExports } from "./reportExports";
import ReportExportMenu from "./ReportExportMenu";
import ErrorMessage from "@/components/ErrorMessage";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Small-screen fallback: a fixed single-column stack sized per report type
// (the responsive grid squeezes/overflows otherwise).
const MOBILE_TILE_HEIGHTS: Record<string, number> = {
  financialSummary: 6,
  influenceMap: 6,
  rcConsumption: 8,
  rcFootprint: 10,
  contentActivity: 10,
};
const MOBILE_TILE_H_FALLBACK = 8;

const mobileStackFor = (widgets: Layout[], cols: number): Layout[] => {
  let y = 0;
  return widgets.map((widget) => {
    const type = widget.i.split("-")[0];
    const h = MOBILE_TILE_HEIGHTS[type] ?? MOBILE_TILE_H_FALLBACK;
    const item: Layout = {
      i: widget.i,
      x: 0,
      y,
      w: cols,
      h,
      minW: cols,
      minH: 3,
    };
    y += h;
    return item;
  });
};

// Visible, grabbable resize grips — RGL's default corner handle is easy to miss
// when sizing reports to sit side by side. Adds a right-edge (width) grip.
const RESIZE_HANDLE_CSS = `
/* Keep the drag-to-resize areas (cursor changes on the edges) but draw no
   visible grip — a stray bar on the edge reads as chart noise. */
.analytics-grid .react-resizable-handle { z-index: 5; background: none; }
.analytics-grid .react-resizable-handle::after { display: none; }
.analytics-grid .react-resizable-handle-e {
  top: 0; bottom: 0; height: auto; right: 0; width: 10px;
  margin: 0; transform: none; cursor: ew-resize;
}
.analytics-grid .react-resizable-handle-s {
  left: 0; right: 0; width: auto; bottom: 0; height: 10px;
  margin: 0; transform: none; cursor: ns-resize;
}
.analytics-grid .react-resizable-handle-se { cursor: nwse-resize; }
.analytics-grid * { scrollbar-width: thin; scrollbar-color: rgba(120,120,140,0.35) transparent; }
.analytics-grid *::-webkit-scrollbar { width: 6px; height: 6px; }
.analytics-grid *::-webkit-scrollbar-track { background: transparent; }
.analytics-grid *::-webkit-scrollbar-thumb {
  background: rgba(120,120,140,0.35); border-radius: 3px;
}
.analytics-grid *::-webkit-scrollbar-thumb:hover { background: rgba(120,120,140,0.6); }
`;

interface AnalyticsDashboardProps {
  accountName: string;
  dataSources: { [key: string]: any };
  widgets: Layout[];
  layouts: Layouts;
  onAddWidget: (widgetType: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
  onResetLayout: () => void;
  liveDataEnabled: boolean;
  dynamicGlobalData: any;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  accountName,
  dataSources,
  widgets,
  layouts,
  onAddWidget,
  onRemoveWidget,
  onLayoutChange,
  onResetLayout,
  liveDataEnabled,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  // Below md: force the single-column stack and lock drag/resize.
  const isSmallScreen = useMediaQuery("(max-width: 995px)");
  const gridLayouts = useMemo<Layouts>(
    () =>
      isSmallScreen
        ? {
            ...layouts,
            sm: mobileStackFor(widgets, 6),
            xs: mobileStackFor(widgets, 4),
            xxs: mobileStackFor(widgets, 2),
          }
        : layouts,
    [layouts, widgets, isSmallScreen]
  );

  if (!accountName) {
    return <ErrorMessage message={t("AnalyticsDashboard.error")} />;
  }

  return (
    <ReportExportsProvider>
      <div className="px-4 sm:px-6">
        <style>{RESIZE_HANDLE_CSS}</style>
        <div className="mb-4 flex items-center justify-end gap-2">
          <ResetLayoutButton onReset={onResetLayout} />
          <ReportLibrary onAddWidget={onAddWidget} widgets={widgets} />
        </div>
        <ResponsiveGridLayout
          className="analytics-grid"
          layouts={gridLayouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          draggableHandle=".drag-handle"
          draggableCancel=".no-drag"
          isDraggable={!isSmallScreen}
          isResizable={!isSmallScreen}
          resizeHandles={["se", "e", "s"]}
        >
          {widgets.map((widget) => {
            const widgetType = widget.i.split("-")[0];
            const reportConfig = reportRegistry[widgetType];
            if (!reportConfig) {
              return (
                <div key={widget.i}>
                  <ErrorMessage message={t("AnalyticsDashboard.error")} />
                </div>
              );
            }

            const reportDataProp = Object.fromEntries(
              Object.entries(reportConfig.dataMap).map(
                ([propName, sourceKey]) => [propName, dataSources[sourceKey]]
              )
            );

            return (
              <div
                key={widget.i}
                className="bg-muted border border-border rounded-md flex flex-col overflow-hidden"
              >
                <div className="drag-handle bg-theme/50 px-2 py-1 flex justify-between items-center cursor-move border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <Move className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {reportConfig.icon && (
                      <reportConfig.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold text-sm truncate">
                      {t(reportConfig.titleKey)}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <WidgetExportSlot widgetId={widget.i} />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            aria-label={t("analyticsDashboard.removeReport")}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveWidget(widget.i);
                            }}
                            className="no-drag shrink-0 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[11px]">
                          {t("analyticsDashboard.removeReport")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div
                  className="p-2 flex-grow relative"
                  style={{ minHeight: "300px" }}
                >
                  <reportConfig.component
                    accountName={accountName}
                    data={reportDataProp}
                    liveDataEnabled={liveDataEnabled}
                    dynamicGlobalData={dynamicGlobalData}
                    widgetId={widget.i}
                    key={`${widget.i}-${accountName}`}
                  />
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
        {widgets.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
            <h3 className="text-lg font-medium text-foreground">
              {t("analyticsDashboard.emptyTitle")}
            </h3>
            <p className=" mt-1">{t("analyticsDashboard.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </ReportExportsProvider>
  );
};

// Red restore-default control (confirm before wiping), matching the home dashboard.
const ResetLayoutButton: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { t } = useI18n();

  const handleClick = () => {
    if (window.confirm(t("analyticsDashboard.resetWarning"))) {
      onReset();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("analyticsDashboard.resetLayout")}
            onClick={handleClick}
            className="flex items-center justify-center rounded-full bg-red-600 p-3 text-white shadow-lg transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <RotateCcw size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[11px]">
          {t("analyticsDashboard.resetLayout")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Renders the export affordance for a widget when its report has published
// datasets (consumes the context, so it must live inside the provider).
const WidgetExportSlot: React.FC<{ widgetId: string }> = ({ widgetId }) => {
  const ctx = useReportExports();
  const datasets = ctx?.exportsByWidget[widgetId];
  if (!datasets || datasets.length === 0) return null;
  return <ReportExportMenu datasets={datasets} />;
};

export default AnalyticsDashboard;
