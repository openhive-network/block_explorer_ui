import React from "react";
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import ReportLibrary from "./ReportLibrary";
import { Move } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { reportRegistry } from "./reportRegistry";
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
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm truncate">
                    {t(reportConfig.titleKey)}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveWidget(widget.i);
                  }}
                  className="no-drag text-muted-foreground hover:text-foreground text-lg leading-none p-1"
                >
                  ×
                </button>
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
  );
};

export default AnalyticsDashboard;
