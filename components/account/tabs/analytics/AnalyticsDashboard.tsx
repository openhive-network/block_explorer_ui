import React from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import ReportLibrary from "./ReportLibrary";
import { Move, X } from "lucide-react";
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

interface AnalyticsDashboardProps {
  accountName: string;
  dataSources: { [key: string]: any };
  widgets: Layout[];
  layouts: Layouts;
  onAddWidget: (widgetType: string) => void;
  onRemoveWidget: (widgetId: string) => void;
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
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
  liveDataEnabled,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();

  if (!accountName) {
    return <ErrorMessage message={t("AnalyticsDashboard.error")} />;
  }

  return (
    <ReportExportsProvider>
      <div className="px-4 sm:px-6">
        <ReportLibrary onAddWidget={onAddWidget} widgets={widgets} />
        <ResponsiveGridLayout
          layouts={layouts}
          onLayoutChange={onLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          draggableHandle=".drag-handle"
          draggableCancel=".no-drag"
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

// Renders the export affordance for a widget when its report has published
// datasets (consumes the context, so it must live inside the provider).
const WidgetExportSlot: React.FC<{ widgetId: string }> = ({ widgetId }) => {
  const ctx = useReportExports();
  const datasets = ctx?.exportsByWidget[widgetId];
  if (!datasets || datasets.length === 0) return null;
  return <ReportExportMenu datasets={datasets} />;
};

export default AnalyticsDashboard;
