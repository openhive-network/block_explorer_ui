import WatchedProposalsWidget from "@/components/dashboard/widgets/data/WatchedProposalsWidget";
import WitnessHealthWidget from "@/components/dashboard/widgets/data/WitnessHealthWidget";
import EmbedWidget from "@/components/dashboard/widgets/layout/EmbedWidget";
import MarkdownWidget from "@/components/dashboard/widgets/layout/MarkdownWidget";
import LiveInfoWidget from "@/components/dashboard/widgets/data/LiveInfoWidget";
import MarketDataWidget from "@/components/dashboard/widgets/data/MarketDataWidget";
import SearchesSection from "@/components/home/SearchesSection";
import TopCommunitiesCard from "@/components/home/TopCommunitiesCard";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import TransactionStatisticsCard from "@/components/home/TransactionStatisticsCard";
import TransferVolumeCard from "@/components/home/TransferVolumeCard";
import TotalValueLockedCard from "@/components/home/TotalValueLockedCard";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import FundAndSupplyWidget from "@/components/dashboard/widgets/data/FundAndSupplyWidget";
import HiveParametersWidget from "@/components/dashboard/widgets/data/HiveParametersWidget";
import BlockchainDatesWidget from "@/components/dashboard/widgets/data/BlockchainDatesWidget";
import HivePriceChartWidget from "@/components/dashboard/widgets/data/HivePriceChartWidget";
import QuickLinksWidget from "@/components/dashboard/widgets/layout/QuickLinksWidget";
import TitleWidget from "@/components/dashboard/widgets/layout/TitleWidget";
import SpacerWidget from "@/components/dashboard/widgets/layout/SpacerWidget";
import SeparatorWidget from "@/components/dashboard/widgets/layout/SeparatorWidget";
import { DashboardActions, DashboardData } from "../hooks/useDashboardData";

export interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultLayout: {
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    isResizable?: boolean;
    isDraggable?: boolean;
  };
  description?: string;
  isLayoutWidget?: boolean;
  allowMultiple?: boolean;
  collapsible?: boolean;
  initialCollapsed?: boolean;
  dynamicHeight?: boolean;
  getProps?: (
    data: DashboardData,
    widgetState: any,
    actions: DashboardActions
  ) => object;
}

// --- Helper function for widgets that share props ---
const getCollapsibleCardProps = (
  data: DashboardData,
  widgetState: any,
  actions: DashboardActions
) => ({
  headBlockCardData: data.dynamicGlobalQueryData,
  isCollapsed: widgetState?.isCollapsed ?? false,
  onToggleCollapse: actions.handleToggleCollapse,
});

// --- WIDGET REGISTRY ---
export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {
  // --- Application Widgets  ---
  "live-info": {
    id: "live-info",
    name: "widgets.liveInfoName",
    component: LiveInfoWidget,
    defaultLayout: { w: 3, h: 6, minW: 3, minH: 5 },
    getProps: (data) => ({
      headBlockCardData: data.dynamicGlobalQueryData,
      transactionCount: data.trxOpsLength,
      blockDetails: data.headBlockData,
      opcount: data.opcount,
    }),
  },
  "hive-price-chart": {
    id: "hive-price-chart",
    name: "widgets.hivePriceChartName",
    component: HivePriceChartWidget,
    defaultLayout: { w: 6, h: 7.2, minW: 4, minH: 4 },
    getProps: (data, widgetState, actions) => ({
      isCollapsed: widgetState?.isCollapsed ?? false,
      onToggleCollapse: actions.handleToggleCollapse,
      onShowFullChart: () => actions.setIsFullHiveChartVisible(true),
    }),
    collapsible: true,
    initialCollapsed: false,
  },
  "fund-and-supply": {
    id: "fund-and-supply",
    name: "widgets.fundAndSupplyName",
    component: FundAndSupplyWidget,
    defaultLayout: { w: 3, h: 5, minW: 2, minH: 5 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "hive-parameters": {
    id: "hive-parameters",
    name: "widgets.hiveParametersName",
    component: HiveParametersWidget,
    defaultLayout: { w: 3, h: 7.6, minW: 2, minH: 5 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "blockchain-dates": {
    id: "blockchain-dates",
    name: "widgets.blockchainDatesName",
    component: BlockchainDatesWidget,
    defaultLayout: { w: 3, h: 3.4, minW: 2, minH: 1 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "market-data": {
    id: "market-data",
    name: "widgets.marketDataName",
    component: MarketDataWidget,
    defaultLayout: { w: 4, h:1.5, minW: 3, minH: 1 },
    getProps: (data) => ({
      headBlockCardData: data.dynamicGlobalQueryData,
    }),
  },
  "last-blocks": {
    id: "last-blocks",
    name: "widgets.lastBlocksName",
    component: LastBlocksWidget,
    defaultLayout: { w: 8, h: 9, minW: 6, minH: 8 },
    getProps: (data) => ({
      headBlock: data.headBlockNum,
      strokeColor: data.strokeColor,
    }),
  },
  "top-witnesses": {
    id: "top-witnesses",
    name: "widgets.topWitnessesName",
    component: TopWitnessesCard,
    defaultLayout: { w: 2.95, h: 11, minW: 2, minH: 8 },
    getProps: (data) => ({
      witnessesData: data.witnessesData,
      isLoading: data.isWitnessDataLoading,
    }),
  },
  "top-communities": {
    id: "top-communities",
    name: "widgets.topCommunitiesName",
    component: TopCommunitiesCard,
    defaultLayout: { w: 2.95, h: 7, minW: 2, minH: 5 },
    getProps: (data) => ({
      communitiesData: data.popularCommunitiesData,
      isLoading: data.isCommunitiesLoading,
    }),
  },
  "tx-stats": {
    id: "tx-stats",
    name: "widgets.txStatsName",
    component: TransactionStatisticsCard,
    defaultLayout: { w: 8, h: 5, minW: 4, minH: 4 },
  },
   "transfer-volume": {
    id: "transfer-volume",
    name: "widgets.transferVolumeName",
    component: TransferVolumeCard,
    defaultLayout: { w: 8, h: 5, minW: 4, minH: 4 },
  },
  "tvl": {
    id: "tvl",
    name: "widgets.tvlName",
    component: TotalValueLockedCard,
    defaultLayout: { w: 8, h: 5, minW: 4, minH: 4 },
  },
  searches: {
    id: "searches",
    name: "widgets.searchesName",
    component: SearchesSection,
    defaultLayout: { w: 8, h: 11.9, minW: 4, minH: 3 },
    dynamicHeight: true,
  },

  "watched-proposals": {
    id: "watched-proposals",
    name: "widgets.watchedProposalsName",
    component: WatchedProposalsWidget,
    defaultLayout: { w: 2.95, h: 6, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "witness-health": {
    id: "witness-health",
    name: "widgets.witnessHealthName",
    component: WitnessHealthWidget,
    defaultLayout: { w: 4, h: 6, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  // --- Layout Widgets (With descriptions and state-management props) ---
  title: {
    id: "title",
    component: TitleWidget,
    name: "widgets.titleName",
    description: "widgets.titleNameDescription",
    defaultLayout: { w: 4, h: 1, minW: 3, minH: 1, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialText: widgetState?.text,
      initialColor: widgetState?.backgroundColor || "transparent",
      onColorChange: (newColor: string) =>
        actions.handleWidgetStateChange({ backgroundColor: newColor }),
      onTextChange: (newText: string) =>
        actions.handleWidgetStateChange({ text: newText }),
    }),
  },
  markdown: {
    id: "markdown",
    component: MarkdownWidget,
    name: "widgets.markdownName",
    description: "widgets.markdownNameDescription",
    defaultLayout: { w: 4, h: 4, minW: 2, minH: 2, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialContent: widgetState?.content,
      onContentChange: (newContent: string) =>
        actions.handleWidgetStateChange({ content: newContent }),
    }),
  },
  "quick-links": {
    id: "quick-links",
    component: QuickLinksWidget,
    name: "widgets.quickLinksName",
    description: "widgets.quickLinksNameDescription",
    defaultLayout: { w: 4, h: 4, minW: 2, minH: 3, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLinks: widgetState?.links || [],
      onLinksChange: (newLinks: Array<{ label: string; url: string }>) =>
        actions.handleWidgetStateChange({ links: newLinks }),
    }),
  },
  embed: {
    id: "embed",
    component: EmbedWidget,
    name: "widgets.embedName",
    description: "widgets.embedNameDescription",
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 4, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialUrl: widgetState?.url || "",
      onUrlChange: (newUrl: string) =>
        actions.handleWidgetStateChange({ url: newUrl }),
    }),
  },
  spacer: {
    id: "spacer",
    component: SpacerWidget,
    name: "widgets.spacerName",
    description: "widgets.spacerNameDescription",
    defaultLayout: { w: 1, h: 2 },
    isLayoutWidget: true,
    allowMultiple: true,
  },
  separator: {
    id: "separator",
    component: SeparatorWidget,
    name: "widgets.separatorName",
    description: "widgets.separatorNameDescription",
    defaultLayout: { w: 12, h: 1, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
  },
};

export const ALL_WIDGETS = Object.values(WIDGET_REGISTRY);
