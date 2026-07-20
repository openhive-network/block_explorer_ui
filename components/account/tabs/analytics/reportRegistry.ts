import React from "react";
import {
  LucideIcon,
  Share2,
  PieChart,
  Newspaper,
  Gauge,
  Coins,
} from "lucide-react";
import InfluenceMapReport from "./InfluenceMapReport";
import ContentActivityReport from "./contentActivity/ContentActivityReport";
import RcFootprintReport from "./RcFootprintReport";
import RcConsumptionReport from "./rcConsumption/RcConsumptionReport";
import FinancialSummaryReport from "./FinancialSummaryReport";
import type { WidgetNodeSupport } from "@/components/dashboard/lib/widgetNodeSupport";
export interface BaseReportProps {
  accountName: string;
  data: { [key: string]: any };
  liveDataEnabled: boolean;
  dynamicGlobalData: any;
  // Widget instance id — reports use it to publish export datasets to the header.
  widgetId?: string;
}

export type ReportConfig = {
  component: React.FC<BaseReportProps & { [key: string]: any }>;
  titleKey: string;
  dataMap: { [key: string]: string };
  icon?: LucideIcon;
  descriptionKey?: string;
  // Node-support requirement — lets the dashboard gate the report to the
  // graceful "Unavailable" card (like the home widgets) on incompatible nodes.
  nodeSupport?: WidgetNodeSupport;
};

/**
 * A registry mapping report types (e.g., 'influenceMap') to their configuration.
 * This allows the dashboard to dynamically render different report widgets.
 */
export type ReportRegistry = {
  [key: string]: ReportConfig;
};

export const reportRegistry: ReportRegistry = {
  influenceMap: {
    component: InfluenceMapReport,
    titleKey: "analyticsDashboard.influenceMapReportTitle",
    descriptionKey: "analyticsDashboard.influenceMapReportDesc",
    icon: Share2,
    dataMap: {
      incoming: "incomingVestingDelegations",
      outgoing: "outgoingVestingDelegations",
    },
  },
  contentActivity: {
    component: ContentActivityReport,
    titleKey: "analyticsDashboard.contentActivityReportTitle",
    descriptionKey: "analyticsDashboard.contentActivityReportDesc",
    icon: Newspaper,
    // This report fetches its own content-stats internally, so it needs no
    // top-level data sources from AnalyticsTabContent.
    dataMap: {},
    nodeSupport: {
      app: "haf-stats-api",
      endpoint: "haf-stats-api:content-stats",
    },
  },
  rcFootprint: {
    component: RcFootprintReport,
    titleKey: "analyticsDashboard.rcFootprintReportTitle",
    descriptionKey: "analyticsDashboard.rcFootprintReportDesc",
    icon: PieChart,
    dataMap: {},
    nodeSupport: {
      app: "haf-stats-api",
      endpoint: "haf-stats-api:dapp-footprint",
    },
  },
  rcConsumption: {
    component: RcConsumptionReport,
    titleKey: "analyticsDashboard.rcConsumptionReportTitle",
    descriptionKey: "analyticsDashboard.rcConsumptionReportDesc",
    icon: Gauge,
    dataMap: {},
    nodeSupport: {
      app: "haf-stats-api",
      endpoint: "haf-stats-api:rc-footprint",
    },
  },
  financialSummary: {
    component: FinancialSummaryReport,
    titleKey: "financialSummary.widgetTitle",
    icon: Coins,
    dataMap: {},
    nodeSupport: {
      app: "haf-stats-api",
      endpoint: "haf-stats-api:financial-summary",
    },
  },
  // Other reports would go here
};
