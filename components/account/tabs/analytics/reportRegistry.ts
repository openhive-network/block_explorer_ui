import React from 'react';
import InfluenceMapReport from "./InfluenceMapReport";
export interface BaseReportProps {
  accountName: string;
  data: { [key: string]: any };
  liveDataEnabled: boolean;
  dynamicGlobalData: any;
}

export type ReportConfig = {
  component: React.FC<BaseReportProps & { [key: string]: any }>;
  titleKey: string;
  dataMap: { [key: string]: string };
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
    titleKey: 'analyticsDashboard.influenceMapReportTitle',
    dataMap: {
      incoming: 'incomingVestingDelegations',
      outgoing: 'outgoingVestingDelegations'
    }
  },
  // Other reports would go here
};