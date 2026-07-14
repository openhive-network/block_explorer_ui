import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import ReactECharts from "echarts-for-react";
import { useI18n } from "@/i18n/i18n";
import Explorer from "@/types/Explorer";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { grabNumericValue } from "@/utils/StringUtils";
import { Loader2 } from "lucide-react";
import useConvertedVestingShares from "@/hooks/common/useConvertedVestingShares";

// --- Graph Configuration Constants ---
const TOP_N = 10; // Number of top delegations to show initially
const EXPAND_ALL_NODE_LIMIT = 50; // Maximum number of nodes to display in the "Expand All" static view
// Defines the range for edge lengths in the static circular layout.
const MIN_EDGE_LENGTH = 200;
const MAX_EDGE_LENGTH = 500;
// Defines the range for node (symbol) sizes.
const MIN_SYMBOL_SIZE = 4;
const MAX_SYMBOL_SIZE = 22;
const TOP_N_TREE = 10; // Number of nodes For new interactive tree view

// --- Scaling Helper Functions --
/**
 * Scales a value from one range to another using linear interpolation.
 */
const scaleValue = (
  value: number,
  from: [number, number],
  to: [number, number]
): number => {
  if (from[1] === from[0]) return to[0];
  const scale = (to[1] - to[0]) / (from[1] - from[0]);
  const result = (value - from[0]) * scale + to[0];
  const tMin = Math.min(to[0], to[1]);
  const tMax = Math.max(to[0], to[1]);
  return Math.max(tMin, Math.min(tMax, result));
};

/**
 * Scales a value from one range to another using logarithmic scaling.
 * This is useful for normalizing data with a wide range, like delegation amounts.
 */
const scaleValueLog = (
  value: number,
  from: [number, number],
  to: [number, number]
): number => {
  if (from[1] <= from[0]) return to[0];
  const logFrom0 = Math.log(from[0] + 1);
  const logFrom1 = Math.log(from[1] + 1);
  const logValue = Math.log(value + 1);
  if (logFrom1 === logFrom0) return to[0];
  const scale = (to[1] - to[0]) / (logFrom1 - logFrom0);
  const result = (logValue - logFrom0) * scale + to[0];
  const tMin = Math.min(to[0], to[1]);
  const tMax = Math.max(to[0], to[1]);
  return Math.max(tMin, Math.min(tMax, result));
};

// --- Type Definitions ---
/**
 * Defines the structure for a node in the ECharts graph.
 */
interface GraphNode {
  id: string;
  name: string;
  symbolSize: number;
  category: number;
  value: string;
  amount?: number;
  x?: number | null;
  y?: number | null;
  fixed?: boolean;
  label?: { show?: boolean };
}

/**
 * Defines the structure for a link (or edge) between nodes in the ECharts graph.
 */
interface GraphLink {
  source: string;
  target: string;
  value: string;
  lineStyle: { width: number };
  amount?: number;
  distance?: number;
}

/**
 * Generates the ECharts option object based on the current graph data and state.
 * This function encapsulates the ECharts-specific configuration.
 */
const getChartOption = (
  nodes: GraphNode[],
  links: GraphLink[],
  isFullyExpanded: boolean,
  allCategories: { name: string }[],
  activeLegendCategories: { name: string }[],
  t: (key: string) => string,
  theme: string | undefined
) => {
  const textColor = theme === "dark" ? "#FFFFFF" : "#1F2937";

  const seriesConfig = {
    type: "graph",
    data: nodes,
    links: links,
    categories: allCategories,
    roam: true,
    label: {
      show: true,
      position: "right",
      formatter: "{b}",
      color: textColor,
    },
    edgeSymbol: ["none", "arrow"],
    edgeSymbolSize: 10,
    lineStyle: {
      color: "source",
      opacity: 0.8,
      curveness: isFullyExpanded ? 0 : 0.1,
    },
    color: ["#ef4444", "#10b981", "#34d399", "#3b82f6", "#60a5fa"],
    ...(isFullyExpanded
      ? { layout: "none" }
      : {
          layout: "force",
          force: { repulsion: 600, edgeLength: 120, gravity: 0.1 },
        }),
  };

  return {
    tooltip: {
      formatter: (params: any) => {
        if (params.dataType === "edge")
          return `${t("influenceMapReport.tooltipDelegationPrefix")}${params.value}`;
        return `<b>${params.data.name}</b><br/>${params.data.value}`;
      },
    },
    legend: [
      {
        data: activeLegendCategories.map((a) => a.name),
        orient: "vertical",
        left: "left",
        top: "50",
        textStyle: { color: textColor },
      },
    ],
    animationDurationUpdate: 1000,
    series: [seriesConfig],
  };
};

// --- Component Definition ---
interface InfluenceMapReportProps {
  accountName: string;
  data: {
    incoming?: Explorer.VestingDelegation[];
    outgoing?: Explorer.VestingDelegation[];
  };
  liveDataEnabled: boolean;
  dynamicGlobalData: any;
}

/**
 * Renders an interactive and static influence map for a given account.
 * It features two modes: an interactive tree that can be expanded node-by-node,
 * and a fully expanded circular view showing the top influencers.
 */
const InfluenceMapReport: React.FC<InfluenceMapReportProps> = ({
  accountName,
  data,
  liveDataEnabled,
  dynamicGlobalData,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State Management ---
  // State for the full, sorted lists of delegations, used for the "Expand All" view.
  const [fullIncoming, setFullIncoming] = useState<
    Explorer.VestingDelegation[]
  >([]);
  const [fullOutgoing, setFullOutgoing] = useState<
    Explorer.VestingDelegation[]
  >([]);

  // State to toggle between interactive tree view and fully expanded circular view.
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);

  // State to store the dimensions of the chart container for responsive layout.
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

  // State holding the processed nodes and links to be rendered by ECharts.
  const [graphData, setGraphData] = useState<{
    nodes: GraphNode[];
    links: GraphLink[];
  }>({ nodes: [], links: [] });

  // State to cache delegation data fetched for expanded nodes, preventing redundant API calls.
  const [dataCache, setDataCache] = useState(
    new Map<
      string,
      {
        incoming: Explorer.VestingDelegation[];
        outgoing: Explorer.VestingDelegation[];
      }
    >()
  );

  // State to track which nodes have been clicked and expanded in the interactive view.
  const [expandedNodes, setExpandedNodes] = useState(
    new Set<string>([accountName])
  );

  // State to manage pagination for nodes with many connections ('Load More' functionality).
  const [nodePages, setNodePages] = useState(
    new Map<string, { incoming: number; outgoing: number }>()
  );

  // State to track which nodes are currently being fetched, used to show a loading state.
  const [loadingNodes, setLoadingNodes] = useState(new Set<string>());

  // State to hold the name of the next account to fetch data for, triggering the data-fetching hook.
  const [accountToFetch, setAccountToFetch] = useState<string | null>(null);

  // State for the legend categories that are currently visible in the chart.
  const [activeLegendCategories, setActiveLegendCategories] = useState<
    { name: string }[]
  >([]);

  // State to cache node positions from the force layout to maintain stability on re-renders.
  const [nodePositions, setNodePositions] = useState(
    new Map<string, { x: number; y: number }>()
  );

  // State for mobile responsiveness adjustments.
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect if the view is mobile-sized.
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const allPossibleCategories = useMemo(
    () => [
      { name: t("influenceMapReport.legendCentralHub") },
      { name: t("influenceMapReport.legendIncoming") },
      { name: t("influenceMapReport.legendOtherIncoming") },
      { name: t("influenceMapReport.legendOutgoing") },
      { name: t("influenceMapReport.legendOtherOutgoing") },
    ],
    [t]
  );

  const fetchedOutgoing = useConvertedVestingShares(
    "outgoing",
    accountToFetch || "",
    liveDataEnabled,
    dynamicGlobalData,
    !!accountToFetch
  );
  const fetchedIncoming = useConvertedVestingShares(
    "incoming",
    accountToFetch || "",
    liveDataEnabled,
    dynamicGlobalData,
    !!accountToFetch
  );

  // Effect to process fetched data: adds it to the cache and removes the node from the loading state.
  useEffect(() => {
    if (accountToFetch && (fetchedIncoming || fetchedOutgoing)) {
      setDataCache((prevCache) =>
        new Map(prevCache).set(accountToFetch, {
          incoming: fetchedIncoming ?? [],
          outgoing: fetchedOutgoing ?? [],
        })
      );
      setLoadingNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(accountToFetch);
        return newSet;
      });
      setAccountToFetch(null);
    }
  }, [accountToFetch, fetchedIncoming, fetchedOutgoing]);

  // Effect to set up a ResizeObserver to keep the chart dimensions updated.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(() => {
      // Just update the state. The re-render will handle the rest.
      setChartDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    });
    resizeObserver.observe(container);
    // Set initial dimensions
    setChartDimensions({
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const sortedIncoming = data.incoming
      ? [...data.incoming].sort(
          (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
        )
      : [];
    const sortedOutgoing = data.outgoing
      ? [...data.outgoing].sort(
          (a, b) => parseFloat(b.amount) - parseFloat(a.amount)
        )
      : [];

    setFullIncoming(sortedIncoming);
    setFullOutgoing(sortedOutgoing);
    setIsFullyExpanded(false);
    setDataCache(
      new Map([
        [accountName, { incoming: sortedIncoming, outgoing: sortedOutgoing }],
      ])
    );
    setExpandedNodes(new Set([accountName]));
    // Set initial page count for the main node to show TOP_N items initially.
    const initialPageCount = Math.max(1, TOP_N / TOP_N_TREE);
    setNodePages(
      new Map([
        [
          accountName,
          { incoming: initialPageCount, outgoing: initialPageCount },
        ],
      ])
    );
    setLoadingNodes(new Set());
    setAccountToFetch(null);
    setNodePositions(new Map());
  }, [data.incoming, data.outgoing, accountName]);

  /**
   * Core logic to generate the nodes and links for the ECharts graph.
   * This function handles both the interactive tree view and the static circular view.
   */
  const generateGraph = useCallback(() => {
    let finalNodes: GraphNode[] = [];
    let finalLinks: GraphLink[] = [];

    const mobileSizeMultipler = isMobile ? 0.7 : 1;

    if (isFullyExpanded) {
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const centralNodeId = "0";
      const allDelegations = [...fullIncoming, ...fullOutgoing];
      const amounts = allDelegations
        .map((d) => parseFloat(d.amount))
        .filter((a) => a > 0);
      const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
      const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;

      nodes.push({
        id: centralNodeId,
        name: `@${accountName}`,
        symbolSize: 60 * mobileSizeMultipler,
        category: 0,
        value: t("analyticsDashboard.centralHub"),
      });
      const centerX = chartDimensions.width / 2;
      const centerY = chartDimensions.height / 2;
      nodes[0] = { ...nodes[0], x: centerX, y: centerY, fixed: true };

      let incomingToShow = fullIncoming;
      let outgoingToShow = fullOutgoing;
      if (fullIncoming.length + fullOutgoing.length > EXPAND_ALL_NODE_LIMIT) {
        const slotsPerSide = Math.floor(EXPAND_ALL_NODE_LIMIT / 2);
        const actualIncomingCount = Math.min(fullIncoming.length, slotsPerSide);
        const actualOutgoingCount = Math.min(fullOutgoing.length, slotsPerSide);
        const finalIncomingLimit = Math.min(
          fullIncoming.length,
          actualIncomingCount + (slotsPerSide - actualOutgoingCount)
        );
        const finalOutgoingLimit = Math.min(
          fullOutgoing.length,
          actualOutgoingCount + (slotsPerSide - actualIncomingCount)
        );
        incomingToShow = fullIncoming.slice(0, finalIncomingLimit);
        outgoingToShow = fullOutgoing.slice(0, finalOutgoingLimit);
      }
      const hasIncomingOthers = fullIncoming.length > incomingToShow.length;
      const hasOutgoingOthers = fullOutgoing.length > outgoingToShow.length;
      let totalNodesToPosition =
        incomingToShow.length +
        outgoingToShow.length +
        (hasIncomingOthers ? 1 : 0) +
        (hasOutgoingOthers ? 1 : 0);
      let currentIndex = 0;

      incomingToShow.forEach((delegation) => {
        const amount = parseFloat(delegation.amount);
        const radius =
          currentIndex % 3 === 0
            ? MAX_EDGE_LENGTH
            : currentIndex % 3 === 1
              ? MIN_EDGE_LENGTH
              : (MIN_EDGE_LENGTH + MAX_EDGE_LENGTH) / 2;
        const angle =
          totalNodesToPosition > 0
            ? (currentIndex / totalNodesToPosition) * 2 * Math.PI
            : 0;
        nodes.push({
          id: `in-${delegation.delegator}`,
          name: `@${delegation.delegator}`,
          symbolSize: scaleValueLog(
            amount,
            [minAmount, maxAmount],
            [
              MIN_SYMBOL_SIZE * mobileSizeMultipler,
              MAX_SYMBOL_SIZE * mobileSizeMultipler,
            ]
          ),
          category: 1,
          value: delegation.vesting_shares,
          amount,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          fixed: true,
        });
        links.push({
          source: `in-${delegation.delegator}`,
          target: centralNodeId,
          value: delegation.vesting_shares,
          amount,
          lineStyle: {
            width: scaleValue(amount, [minAmount, maxAmount], [0.5, 8]),
          },
        });
        currentIndex++;
      });

      if (hasIncomingOthers) {
        const remaining = fullIncoming.slice(incomingToShow.length);
        const sumAmount = remaining.reduce(
          (sum, d) => sum + parseFloat(d.amount),
          0
        );
        const sumHP = remaining.reduce(
          (sum, d) => sum + grabNumericValue(d.vesting_shares),
          0
        );
        const radius =
          currentIndex % 3 === 0
            ? MAX_EDGE_LENGTH
            : currentIndex % 3 === 1
              ? MIN_EDGE_LENGTH
              : (MIN_EDGE_LENGTH + MAX_EDGE_LENGTH) / 2;
        const angle =
          totalNodesToPosition > 0
            ? (currentIndex / totalNodesToPosition) * 2 * Math.PI
            : 0;
        nodes.push({
          id: "in-others-expanded",
          name: `${remaining.length}+ ${t("analyticsDashboard.others")}`,
          symbolSize: scaleValueLog(
            sumAmount,
            [minAmount, maxAmount],
            [
              MIN_SYMBOL_SIZE * mobileSizeMultipler,
              (MAX_SYMBOL_SIZE + 5) * mobileSizeMultipler,
            ]
          ),
          category: 2,
          value: `${remaining.length} ${t("influenceMapReport.moreDelegations")} (${sumHP.toLocaleString()} HP)`,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          fixed: true,
        });
        links.push({
          source: "in-others-expanded",
          target: centralNodeId,
          value: `${sumHP.toLocaleString()} HP`,
          lineStyle: {
            width: scaleValue(sumAmount, [minAmount, maxAmount], [0.5, 8]),
          },
        });
        currentIndex++;
      }

      outgoingToShow.forEach((delegation) => {
        const amount = parseFloat(delegation.amount);
        const radius =
          currentIndex % 3 === 0
            ? MAX_EDGE_LENGTH
            : currentIndex % 3 === 1
              ? MIN_EDGE_LENGTH
              : (MIN_EDGE_LENGTH + MAX_EDGE_LENGTH) / 2;
        const angle =
          totalNodesToPosition > 0
            ? (currentIndex / totalNodesToPosition) * 2 * Math.PI
            : 0;
        nodes.push({
          id: `out-${delegation.delegatee}`,
          name: `@${delegation.delegatee}`,
          symbolSize: scaleValueLog(
            amount,
            [minAmount, maxAmount],
            [
              MIN_SYMBOL_SIZE * mobileSizeMultipler,
              MAX_SYMBOL_SIZE * mobileSizeMultipler,
            ]
          ),
          category: 3,
          value: delegation.vesting_shares,
          amount,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          fixed: true,
        });
        links.push({
          source: centralNodeId,
          target: `out-${delegation.delegatee}`,
          value: delegation.vesting_shares,
          amount,
          lineStyle: {
            width: scaleValue(amount, [minAmount, maxAmount], [0.5, 8]),
          },
        });
        currentIndex++;
      });

      if (hasOutgoingOthers) {
        const remaining = fullOutgoing.slice(outgoingToShow.length);
        const sumAmount = remaining.reduce(
          (sum, d) => sum + parseFloat(d.amount),
          0
        );
        const sumHP = remaining.reduce(
          (sum, d) => sum + grabNumericValue(d.vesting_shares),
          0
        );
        const radius =
          currentIndex % 3 === 0
            ? MAX_EDGE_LENGTH
            : currentIndex % 3 === 1
              ? MIN_EDGE_LENGTH
              : (MIN_EDGE_LENGTH + MAX_EDGE_LENGTH) / 2;
        const angle =
          totalNodesToPosition > 0
            ? (currentIndex / totalNodesToPosition) * 2 * Math.PI
            : 0;
        nodes.push({
          id: "out-others-expanded",
          name: `${remaining.length}+ ${t("analyticsDashboard.others")}`,
          symbolSize: scaleValueLog(
            sumAmount,
            [minAmount, maxAmount],
            [
              MIN_SYMBOL_SIZE * mobileSizeMultipler,
              (MAX_SYMBOL_SIZE + 5) * mobileSizeMultipler,
            ]
          ),
          category: 4,
          value: `${remaining.length} ${t("influenceMapReport.moreDelegations")} (${sumHP.toLocaleString()} HP)`,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          fixed: true,
        });
        links.push({
          source: centralNodeId,
          target: "out-others-expanded",
          value: `${sumHP.toLocaleString()} HP`,
          lineStyle: {
            width: scaleValue(sumAmount, [minAmount, maxAmount], [0.5, 8]),
          },
        });
      }
      finalNodes = nodes;
      finalLinks = links;
    } else {
      // --- INTERACTIVE TREE VIEW ---
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];
      const nodeMap = new Map<string, GraphNode>();
      const allDelegations = Array.from(dataCache.values()).flatMap((d) => [
        ...d.incoming,
        ...d.outgoing,
      ]);
      const amounts = allDelegations
        .map((d) => parseFloat(d.amount))
        .filter((a) => a > 0);
      const minAmount = Math.min(...amounts, 0);
      const maxAmount = Math.max(...amounts, 1);
      const rootNodeSize = 50 * mobileSizeMultipler;
      const childNodeSize = 25 * mobileSizeMultipler;

      const queue: string[] = [accountName];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const parentAccountName = queue.shift()!;
        if (visited.has(parentAccountName)) continue;

        if (!nodeMap.has(parentAccountName)) {
          const isRoot = parentAccountName === accountName;
          const isLoading = loadingNodes.has(parentAccountName);
          const position = nodePositions.get(parentAccountName);

          nodes.push({
            id: parentAccountName,
            name: isLoading
              ? `${t("influenceMapReport.legendLoading")}...`
              : `@${parentAccountName}`,
            symbolSize: isRoot ? rootNodeSize : childNodeSize,
            category: isRoot
              ? 0
              : nodeMap.get(parentAccountName)?.category || 4,
            value: isRoot ? t("analyticsDashboard.centralHub") : "",
            label: { show: isRoot || expandedNodes.has(parentAccountName) },
            ...(isRoot &&
              chartDimensions.width > 0 &&
              chartDimensions.height > 0 && {
                x: chartDimensions.width / 2,
                y: chartDimensions.height / 2,
                fixed: true,
              }),
            ...(position &&
              !isRoot && { x: position.x, y: position.y, fixed: true }),
          });
          nodeMap.set(parentAccountName, nodes[nodes.length - 1]);
        }

        if (
          !expandedNodes.has(parentAccountName) ||
          !dataCache.has(parentAccountName)
        )
          continue;

        visited.add(parentAccountName);
        const { outgoing, incoming } = dataCache.get(parentAccountName)!;
        const pages = nodePages.get(parentAccountName) || {
          incoming: 1,
          outgoing: 1,
        };

        const outgoingToShow = outgoing.slice(0, pages.outgoing * TOP_N_TREE);
        outgoingToShow.forEach((delegation) => {
          const childAccountName = delegation.delegatee;
          if (!nodeMap.has(childAccountName)) {
            const position = nodePositions.get(childAccountName);
            nodes.push({
              id: childAccountName,
              name: `@${childAccountName}`,
              symbolSize: childNodeSize,
              category: 3,
              value: delegation.vesting_shares,
              ...(position && { x: position.x, y: position.y, fixed: true }),
            });
            nodeMap.set(childAccountName, nodes[nodes.length - 1]);
            queue.push(childAccountName);
          }
          links.push({
            source: parentAccountName,
            target: childAccountName,
            value: delegation.vesting_shares,
            lineStyle: {
              width: scaleValue(
                parseFloat(delegation.amount),
                [minAmount, maxAmount],
                [1, 8]
              ),
            },
          });
        });

        if (outgoing.length > outgoingToShow.length) {
          const remaining = outgoing.slice(outgoingToShow.length);
          const sumAmount = remaining.reduce(
            (sum, d) => sum + parseFloat(d.amount),
            0
          );
          const sumHP = remaining.reduce(
            (sum, d) => sum + grabNumericValue(d.vesting_shares),
            0
          );
          const tooltipValue = `${remaining.length} ${t("influenceMapReport.moreDelegations")} (${sumHP.toLocaleString()} HP)`;
          const othersId = `others-out-${parentAccountName}-${pages.outgoing}`;
          nodes.push({
            id: othersId,
            name: `${remaining.length}+ ${t("analyticsDashboard.others")}`,
            symbolSize: scaleValue(
              sumAmount,
              [minAmount, maxAmount],
              [10 * mobileSizeMultipler, 25 * mobileSizeMultipler]
            ),
            category: 4,
            value: tooltipValue,
          });
          links.push({
            source: parentAccountName,
            target: othersId,
            value: t("influenceMapReport.expandCollapseHint"),
            lineStyle: {
              width: scaleValue(sumAmount, [minAmount, maxAmount], [1, 8]),
            },
          });
        }

        const incomingToShow = incoming.slice(0, pages.incoming * TOP_N_TREE);
        incomingToShow.forEach((delegation) => {
          const childAccountName = delegation.delegator;
          if (!nodeMap.has(childAccountName)) {
            const position = nodePositions.get(childAccountName);
            nodes.push({
              id: childAccountName,
              name: `@${childAccountName}`,
              symbolSize: childNodeSize,
              category: 1,
              value: delegation.vesting_shares,
              ...(position && { x: position.x, y: position.y, fixed: true }),
            });
            nodeMap.set(childAccountName, nodes[nodes.length - 1]);
            queue.push(childAccountName);
          }
          links.push({
            source: childAccountName,
            target: parentAccountName,
            value: delegation.vesting_shares,
            lineStyle: {
              width: scaleValue(
                parseFloat(delegation.amount),
                [minAmount, maxAmount],
                [1, 8]
              ),
            },
          });
        });

        if (incoming.length > incomingToShow.length) {
          const remaining = incoming.slice(incomingToShow.length);
          const sumAmount = remaining.reduce(
            (sum, d) => sum + parseFloat(d.amount),
            0
          );
          const sumHP = remaining.reduce(
            (sum, d) => sum + grabNumericValue(d.vesting_shares),
            0
          );
          const tooltipValue = `${remaining.length} ${t("influenceMapReport.moreDelegations")} (${sumHP.toLocaleString()} HP)`;
          const othersId = `others-in-${parentAccountName}-${pages.incoming}`;
          nodes.push({
            id: othersId,
            name: `${remaining.length}+ ${t("analyticsDashboard.others")}`,
            symbolSize: scaleValue(
              sumAmount,
              [minAmount, maxAmount],
              [10 * mobileSizeMultipler, 25 * mobileSizeMultipler]
            ),
            category: 2,
            value: tooltipValue,
          });
          links.push({
            source: othersId,
            target: parentAccountName,
            value: t("influenceMapReport.expandCollapseHint"),
            lineStyle: {
              width: scaleValue(sumAmount, [minAmount, maxAmount], [1, 8]),
            },
          });
        }
      }
      finalNodes = nodes;
      finalLinks = links;
    }

    setGraphData({ nodes: finalNodes, links: finalLinks });

    const usedCategoryIndices = new Set(
      finalNodes.map((node) => node.category)
    );
    const currentActiveCategories = allPossibleCategories.filter((_, index) =>
      usedCategoryIndices.has(index)
    );
    setActiveLegendCategories(currentActiveCategories);
  }, [
    accountName,
    chartDimensions,
    expandedNodes,
    dataCache,
    fullIncoming,
    fullOutgoing,
    isFullyExpanded,
    loadingNodes,
    nodePages,
    t,
    allPossibleCategories,
    nodePositions,
    isMobile,
  ]);

  // Effect to re-generate the graph whenever its dependencies change.
  useEffect(() => {
    generateGraph();
  }, [generateGraph]);

  /**
   * Event handler for when the ECharts force layout simulation finishes.
   * It captures and saves the final positions of the nodes to maintain layout stability.
   */
  const handleLayoutEnd = useCallback(() => {
    if (isFullyExpanded) return;
    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;

    const option = echartsInstance.getOption();
    if (!option || !option.series) return;

    // Type assertion to fix TypeScript error
    const seriesArray = option.series as { data: GraphNode[] }[];
    if (!seriesArray || seriesArray.length === 0 || !seriesArray[0].data)
      return;

    const nodesFromChart = seriesArray[0].data;
    const newPositions = new Map<string, { x: number; y: number }>();
    nodesFromChart.forEach((node) => {
      if (node.id && node.x != null && node.y != null) {
        newPositions.set(node.id, { x: node.x, y: node.y });
      }
    });

    setNodePositions((prevPositions) => {
      if (newPositions.size === 0) return prevPositions;
      if (
        Array.from(newPositions.entries()).every(
          ([id, pos]) =>
            prevPositions.has(id) &&
            prevPositions.get(id)?.x === pos.x &&
            prevPositions.get(id)?.y === pos.y
        ) &&
        prevPositions.size === newPositions.size
      ) {
        return prevPositions;
      }
      return newPositions;
    });
  }, [isFullyExpanded]);

  /**
   * Event handler for clicks on graph nodes.
   * Manages expanding/collapsing nodes, loading more data, and triggering data fetches.
   */
  const handleNodeClick = useCallback(
    async (params: any) => {
      if (params.dataType !== "node" || isFullyExpanded) return;
      const clickedNodeId = params.data.id as string;
      if (loadingNodes.has(clickedNodeId) || accountToFetch === clickedNodeId)
        return;

      if (clickedNodeId.startsWith("others-")) {
        const [, direction, parentAccount, pageStr] = clickedNodeId.split("-");
        const page = parseInt(pageStr, 10);
        setNodePages((prev) => {
          const newPages = new Map(prev);
          const current = newPages.get(parentAccount) || {
            incoming: 1,
            outgoing: 1,
          };
          if (direction === "out") current.outgoing = page + 1;
          if (direction === "in") current.incoming = page + 1;
          newPages.set(parentAccount, current);
          return newPages;
        });
      } else {
        const accountToToggle = clickedNodeId;
        if (accountToToggle === accountName) {
          setExpandedNodes(new Set([accountName]));
          const initialPageCount = Math.max(1, TOP_N / TOP_N_TREE);
          setNodePages(
            new Map([
              [
                accountName,
                { incoming: initialPageCount, outgoing: initialPageCount },
              ],
            ])
          );
          setNodePositions(new Map()); // Reset positions when collapsing the main node
        } else if (expandedNodes.has(accountToToggle)) {
          setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(accountToToggle);
            return newSet;
          });
        } else {
          setExpandedNodes((prev) => new Set(prev).add(accountToToggle));
          if (!dataCache.has(accountToToggle)) {
            setLoadingNodes((prev) => new Set(prev).add(accountToToggle));
            setAccountToFetch(accountToToggle);
          }
        }
      }
    },
    [
      isFullyExpanded,
      expandedNodes,
      dataCache,
      accountName,
      loadingNodes,
      accountToFetch,
    ]
  );

  /**
   * Toggles the view between the interactive tree and the fully expanded circular layout.
   */
  const toggleExpandAll = () => {
    setIsFullyExpanded((prevState) => !prevState);
    setNodePositions(new Map());
  };

  if (!data.incoming || !data.outgoing) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  const canExpand = fullIncoming.length > TOP_N || fullOutgoing.length > TOP_N;
  const onEvents = { click: handleNodeClick, layoutended: handleLayoutEnd };

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {canExpand && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleExpandAll}
          className="absolute top-2 right-2 z-10"
        >
          {isFullyExpanded
            ? t("analyticsDashboard.collapseAll")
            : t("analyticsDashboard.expandAll")}
        </Button>
      )}
      <ReactECharts
        ref={chartRef}
        option={getChartOption(
          graphData.nodes,
          graphData.links,
          isFullyExpanded,
          allPossibleCategories,
          activeLegendCategories,
          t,
          theme
        )}
        onEvents={onEvents}
        style={{ height: "100%", width: "100%" }}
        notMerge={true}
        lazyUpdate={false}
      />
    </div>
  );
};

export default InfluenceMapReport;
