import { useI18n } from "@/i18n/i18n";
import Explorer from "@/types/Explorer";
import AnalyticsDashboard from "./AnalyticsDashboard";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";
import { reportRegistry } from "./reportRegistry";
import { useMemo } from "react";
import { Layout } from "react-grid-layout";
import { useAnalyticsDashboardState } from "./useAnalyticsDashboardState";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Determines the set of required data source keys based on the currently active widgets.
 */
const getRequiredDataSources = (widgets: Layout[]): Set<string> => {
  const required = new Set<string>();
  widgets.forEach((widget) => {
    const widgetType = widget.i.split("-")[0];
    const reportConfig = reportRegistry[widgetType];
    if (reportConfig?.dataMap) {
      Object.values(reportConfig.dataMap).forEach((sourceKey) => {
        if (typeof sourceKey === "string") {
          required.add(sourceKey);
        }
      });
    }
  });
  return required;
};

interface AnalyticsTabContentProps {
  accountName: string;
  dynamicGlobalData?: Explorer.HeadBlockCardData;
  liveDataEnabled: boolean;
}

const AnalyticsTabContent: React.FC<AnalyticsTabContentProps> = ({
  accountName,
  dynamicGlobalData,
  liveDataEnabled,
}) => {
  const { username } = useAuth();
  const { widgets, layouts, onAddWidget, onRemoveWidget, onLayoutChange } =
    useAnalyticsDashboardState(username);
  const requiredData = useMemo(
    () => getRequiredDataSources(widgets),
    [widgets]
  );

  // These hooks now ONLY fetch data for the initial, top-level account.
  const outgoingVestingDelegations = useConvertedVestingShares(
    "outgoing",
    accountName,
    liveDataEnabled,
    dynamicGlobalData,
    requiredData.has("outgoingVestingDelegations")
  );
  const incomingVestingDelegations = useConvertedVestingShares(
    "incoming",
    accountName,
    liveDataEnabled,
    dynamicGlobalData,
    requiredData.has("incomingVestingDelegations")
  );

  // A centralized object of all available data sources for the dashboard.
  const dataSources = {
    outgoingVestingDelegations,
    incomingVestingDelegations,
  };

  return (
    <AnalyticsDashboard
      accountName={accountName}
      dataSources={dataSources}
      widgets={widgets}
      layouts={layouts}
      onAddWidget={onAddWidget}
      onRemoveWidget={onRemoveWidget}
      onLayoutChange={onLayoutChange}
      // Pass these props down for the report to use for its own internal fetching
      liveDataEnabled={liveDataEnabled}
      dynamicGlobalData={dynamicGlobalData}
    />
  );
};

export default AnalyticsTabContent;
