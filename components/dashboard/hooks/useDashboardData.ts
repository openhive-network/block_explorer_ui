import { useMemo } from "react";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { config } from "@/Config";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import useCommunities from "@/hooks/api/communities/useCommunities";
import { useTheme } from "@/contexts/ThemeContext";

type ActiveWidgetList = Array<{ type: string }>;

export type DashboardData = ReturnType<typeof useDashboardData>;

/**
 * The shape of the actions object passed to the widgetRegistry's getProps function.
 * These are functions that live in the main page component.
 */
export interface DashboardActions {
  setIsFullHiveChartVisible: (visible: boolean) => void;
  handleToggleCollapse: () => void;
  handleWidgetStateChange: (newState: object) => void;
}

/**
 * A centralized hook to fetch and prepare all data required by any widget on the dashboard.
 * It intelligently fetches data only for widgets that are currently active in the user's layout.
 * @param widgets - The array of currently active widgets on the dashboard.
 * @returns An object containing all fetched data and derived state.
 */
export function useDashboardData(widgets: ActiveWidgetList) {
  const { theme } = useTheme();
  const headBlockNum = useHeadBlockNumber().headBlockNumberData;

  const activeWidgetTypes = useMemo(
    () => new Set(widgets.map((w) => w.type)),
    [widgets]
  );

  // Create boolean flags to enable/disable the data-fetching hooks below.
  const isWitnessesActive = activeWidgetTypes.has("top-witnesses");
  const isCommunitiesActive = activeWidgetTypes.has("top-communities");

  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.home,
    "rank",
    "asc",
    isWitnessesActive
  );

  const {
    communities: popularCommunitiesData,
    isLoading: isCommunitiesLoading,
  } = useCommunities(
    "",
    "rank",
    config.popularCommunitiesCount,
    isCommunitiesActive
  );

  const { dynamicGlobalData } = useDynamicGlobal(headBlockNum);
  const { headBlockData } = useHeadBlock(headBlockNum);
  const { blockOperations } = useBlockOperations(headBlockNum || 0);
  const { opcount, trxOpsLength } = useMemo(() => {
    const total_operations = blockOperations?.total_operations || 0;
    const trx_in_block = blockOperations?.operations_result.reduce(
      (max, op) =>
        typeof op?.trx_in_block === "number"
          ? Math.max(max, op.trx_in_block)
          : max,
      0
    );
    return {
      opcount: total_operations,
      trxOpsLength: trx_in_block ? trx_in_block + 1 : 0,
    };
  }, [blockOperations]);

  const strokeColor = theme === "dark" ? "#FFF" : "#000";
  const hasLiveInfo = activeWidgetTypes.has("live-info");

  // Memoised: this object is a dependency of the dashboard's widget list, so a
  // fresh identity on every render rebuilds every widget element.
  return useMemo(
    () => ({
      witnessesData,
      isWitnessDataLoading,
      popularCommunitiesData,
      isCommunitiesLoading,
      dynamicGlobalQueryData: dynamicGlobalData,
      headBlockData,
      headBlockNum,
      strokeColor,
      opcount,
      trxOpsLength,
      hasLiveInfo,
    }),
    [
      witnessesData,
      isWitnessDataLoading,
      popularCommunitiesData,
      isCommunitiesLoading,
      dynamicGlobalData,
      headBlockData,
      headBlockNum,
      strokeColor,
      opcount,
      trxOpsLength,
      hasLiveInfo,
    ]
  );
}
