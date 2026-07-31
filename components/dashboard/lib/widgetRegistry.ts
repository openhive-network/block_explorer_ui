import WatchedProposalsWidget from "@/components/dashboard/widgets/data/WatchedProposalsWidget";
import WitnessHealthWidget from "@/components/dashboard/widgets/data/WitnessHealthWidget";
import MyWalletWidget from "@/components/dashboard/widgets/data/MyWalletWidget";
import MyBalanceHistoryWidget from "@/components/dashboard/widgets/data/MyBalanceHistoryWidget";
import MyRecurringTransfersWidget from "@/components/dashboard/widgets/data/MyRecurringTransfersWidget";
import MyHpDelegationsWidget from "@/components/dashboard/widgets/data/MyHpDelegationsWidget";
import MyRcDelegationsWidget from "@/components/dashboard/widgets/data/MyRcDelegationsWidget";
import MyAuthoritiesWidget from "@/components/dashboard/widgets/data/MyAuthoritiesWidget";
import MyRecentActivityWidget from "@/components/dashboard/widgets/data/MyRecentActivityWidget";
import MyRcFootprintWidget from "@/components/dashboard/widgets/data/MyRcFootprintWidget";
import MyContentActivityWidget from "@/components/dashboard/widgets/data/MyContentActivityWidget";
import MyRcConsumptionWidget from "@/components/dashboard/widgets/data/MyRcConsumptionWidget";
import MyFinancialSummaryWidget from "@/components/dashboard/widgets/data/MyFinancialSummaryWidget";
import MySocialInteractionsWidget from "@/components/dashboard/widgets/data/MySocialInteractionsWidget";
import MyPendingRewardsWidget from "@/components/dashboard/widgets/data/MyPendingRewardsWidget";
import TopHoldersWidget from "@/components/dashboard/widgets/data/TopHoldersWidget";
import EmbedWidget from "@/components/dashboard/widgets/layout/EmbedWidget";
import MarkdownWidget from "@/components/dashboard/widgets/layout/MarkdownWidget";
import LiveInfoWidget from "@/components/dashboard/widgets/data/LiveInfoWidget";
import MarketDataWidget from "@/components/dashboard/widgets/data/MarketDataWidget";
import SearchesSection from "@/components/home/SearchesSection";
import TopCommunitiesCard from "@/components/home/TopCommunitiesCard";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import NetworkTopAccountsCard from "@/components/home/NetworkTopAccountsCard";
import TransactionStatisticsCard from "@/components/home/TransactionStatisticsCard";
import TransferVolumeCard from "@/components/home/TransferVolumeCard";
import TotalValueLockedCard from "@/components/home/TotalValueLockedCard";
import NetworkHpDistributionCard from "@/components/home/NetworkHpDistributionCard";
import NetworkGrowthCard from "@/components/home/NetworkGrowthCard";
import HpMomentumCard from "@/components/home/HpMomentumCard";
import NetworkVotingActivityCard from "@/components/home/NetworkVotingActivityCard";
import DailyActiveUsersCard from "@/components/home/DailyActiveUsersCard";
import AccountRetentionFunnelCard from "@/components/home/AccountRetentionFunnelCard";
import NetworkAuthorRetentionCard from "@/components/home/NetworkAuthorRetentionCard";
import NetworkOpMixCard from "@/components/home/NetworkOpMixCard";
import NetworkRcUtilizationCard from "@/components/home/NetworkRcUtilizationCard";
import NetworkContentVolumeCard from "@/components/home/NetworkContentVolumeCard";
import NetworkEngagementCard from "@/components/home/NetworkEngagementCard";
import NetworkDappUsageCard from "@/components/home/NetworkDappUsage/NetworkDappUsageCard";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import FundAndSupplyWidget from "@/components/dashboard/widgets/data/FundAndSupplyWidget";
import HiveParametersWidget from "@/components/dashboard/widgets/data/HiveParametersWidget";
import BlockchainDatesWidget from "@/components/dashboard/widgets/data/BlockchainDatesWidget";
import HivePriceChartWidget from "@/components/dashboard/widgets/data/HivePriceChartWidget";
import QuickLinksWidget from "@/components/dashboard/widgets/layout/QuickLinksWidget";
import TitleWidget from "@/components/dashboard/widgets/layout/TitleWidget";
import SpacerWidget from "@/components/dashboard/widgets/layout/SpacerWidget";
import SeparatorWidget from "@/components/dashboard/widgets/layout/SeparatorWidget";
import ImageWidget from "@/components/dashboard/widgets/layout/ImageWidget";
import NoteWidget from "@/components/dashboard/widgets/layout/NoteWidget";
import LabeledDividerWidget from "@/components/dashboard/widgets/layout/LabeledDividerWidget";
import ButtonWidget from "@/components/dashboard/widgets/layout/ButtonWidget";
import { DashboardActions, DashboardData } from "../hooks/useDashboardData";

export type WidgetCategory = "reports" | "chain" | "account" | "layout";

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
  category?: WidgetCategory;
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

export const WIDGET_CATEGORY_META: Record<
  WidgetCategory,
  { nameKey: string; order: number }
> = {
  reports: { nameKey: "widgetLibrary.categoryReports", order: 0 },
  chain: { nameKey: "widgetLibrary.categoryChain", order: 1 },
  account: { nameKey: "widgetLibrary.categoryAccount", order: 2 },
  layout: { nameKey: "widgetLibrary.categoryLayout", order: 3 },
};

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
    category: "chain" as const,
    component: LiveInfoWidget,
    defaultLayout: { w: 3, h: 2, minW: 3, minH: 2 },
    dynamicHeight: true,
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
    category: "chain" as const,
    component: HivePriceChartWidget,
    defaultLayout: { w: 6, h: 5.8, minW: 4, minH: 1 },
    getProps: (data, widgetState, actions) => ({
      isCollapsed: widgetState?.isCollapsed ?? false,
      onToggleCollapse: actions.handleToggleCollapse,
      onShowFullChart: () => actions.setIsFullHiveChartVisible(true),
    }),
    collapsible: true,
    initialCollapsed: false,
    dynamicHeight: true,
  },
  "fund-and-supply": {
    id: "fund-and-supply",
    name: "widgets.fundAndSupplyName",
    category: "chain" as const,
    component: FundAndSupplyWidget,
    defaultLayout: { w: 3, h: 1.2, minW: 2, minH: 0.5 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "hive-parameters": {
    id: "hive-parameters",
    name: "widgets.hiveParametersName",
    category: "chain" as const,
    component: HiveParametersWidget,
    defaultLayout: { w: 3, h: 1.2, minW: 2, minH: 1 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "blockchain-dates": {
    id: "blockchain-dates",
    name: "widgets.blockchainDatesName",
    category: "chain" as const,
    component: BlockchainDatesWidget,
    defaultLayout: { w: 3, h: 1.2, minW: 2, minH: 1 },
    getProps: getCollapsibleCardProps,
    collapsible: true,
    initialCollapsed: true,
    dynamicHeight: true,
  },
  "market-data": {
    id: "market-data",
    name: "widgets.marketDataName",
    category: "chain" as const,
    component: MarketDataWidget,
    defaultLayout: { w: 4, h: 1.4, minW: 3, minH: 1 },
    dynamicHeight: true,
    getProps: (data) => ({
      headBlockCardData: data.dynamicGlobalQueryData,
    }),
  },
  "last-blocks": {
    id: "last-blocks",
    name: "widgets.lastBlocksName",
    category: "chain" as const,
    component: LastBlocksWidget,
    defaultLayout: { w: 6, h: 8.3, minW: 6, minH: 8 },
    dynamicHeight: true,
    getProps: (data) => ({
      headBlock: data.headBlockNum,
      strokeColor: data.strokeColor,
    }),
  },
  "top-witnesses": {
    id: "top-witnesses",
    name: "widgets.topWitnessesName",
    category: "chain" as const,
    component: TopWitnessesCard,
    defaultLayout: { w: 2.95, h: 13, minW: 2, minH: 6 },
    dynamicHeight: true,
    getProps: (data) => ({
      witnessesData: data.witnessesData,
      isLoading: data.isWitnessDataLoading,
    }),
  },
  "top-communities": {
    id: "top-communities",
    name: "widgets.topCommunitiesName",
    category: "chain" as const,
    component: TopCommunitiesCard,
    defaultLayout: { w: 2.95, h: 5.8, minW: 2, minH: 3 },
    dynamicHeight: true,
    getProps: (data) => ({
      communitiesData: data.popularCommunitiesData,
      isLoading: data.isCommunitiesLoading,
    }),
  },
  "top-accounts": {
    id: "top-accounts",
    name: "widgets.topAccountsName",
    category: "reports" as const,
    component: NetworkTopAccountsCard,
    defaultLayout: { w: 3, h: 11, minW: 2, minH: 11 },
    dynamicHeight: true,
  },
  "tx-stats": {
    id: "tx-stats",
    name: "widgets.txStatsName",
    category: "reports" as const,
    component: TransactionStatisticsCard,
    defaultLayout: { w: 6, h: 5, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  "transfer-volume": {
    id: "transfer-volume",
    name: "widgets.transferVolumeName",
    category: "reports" as const,
    component: TransferVolumeCard,
    defaultLayout: { w: 6, h: 5, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  tvl: {
    id: "tvl",
    name: "widgets.tvlName",
    category: "reports" as const,
    component: TotalValueLockedCard,
    defaultLayout: { w: 6, h: 3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "network-hp-distribution": {
    id: "network-hp-distribution",
    name: "widgets.networkHpDistributionName",
    category: "reports" as const,
    component: NetworkHpDistributionCard,
    defaultLayout: { w: 3, h: 6.7, minW: 2, minH: 5 },
    dynamicHeight: true,
  },
  "network-growth": {
    id: "network-growth",
    name: "widgets.networkGrowthName",
    category: "reports" as const,
    component: NetworkGrowthCard,
    defaultLayout: { w: 6, h: 3.3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "hp-momentum": {
    id: "hp-momentum",
    name: "widgets.hpMomentumName",
    category: "reports" as const,
    component: HpMomentumCard,
    defaultLayout: { w: 6, h: 5, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  "daily-active-users": {
    id: "daily-active-users",
    name: "widgets.dailyActiveUsersName",
    category: "reports" as const,
    component: DailyActiveUsersCard,
    defaultLayout: { w: 6, h: 3.3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "account-retention-funnel": {
    id: "account-retention-funnel",
    name: "widgets.accountRetentionFunnelName",
    category: "reports" as const,
    component: AccountRetentionFunnelCard,
    defaultLayout: { w: 6, h: 3.3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "network-author-retention": {
    id: "network-author-retention",
    name: "widgets.networkAuthorRetentionName",
    category: "reports" as const,
    component: NetworkAuthorRetentionCard,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  "op-mix": {
    id: "op-mix",
    name: "widgets.opMixName",
    category: "reports" as const,
    component: NetworkOpMixCard,
    defaultLayout: { w: 6, h: 3.3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "network-rc-utilization": {
    id: "network-rc-utilization",
    name: "widgets.networkRcUtilizationName",
    category: "reports" as const,
    component: NetworkRcUtilizationCard,
    defaultLayout: { w: 6, h: 3.3, minW: 3, minH: 3 },
    dynamicHeight: true,
  },
  "network-content-volume": {
    id: "network-content-volume",
    name: "widgets.networkContentVolumeName",
    category: "reports" as const,
    component: NetworkContentVolumeCard,
    defaultLayout: { w: 6, h: 5, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  "network-engagement": {
    id: "network-engagement",
    name: "widgets.networkEngagementName",
    category: "reports" as const,
    component: NetworkEngagementCard,
    defaultLayout: { w: 6, h: 5, minW: 3, minH: 4 },
    dynamicHeight: true,
  },
  "network-dapp-usage": {
    id: "network-dapp-usage",
    name: "widgets.networkDappUsageName",
    category: "reports" as const,
    component: NetworkDappUsageCard,
    defaultLayout: { w: 6, h: 7, minW: 3, minH: 5 },
    dynamicHeight: true,
  },
  "voting-activity": {
    id: "voting-activity",
    name: "widgets.votingActivityName",
    category: "reports" as const,
    component: NetworkVotingActivityCard,
    defaultLayout: { w: 3, h: 5.8, minW: 2, minH: 4 },
    dynamicHeight: true,
  },
  searches: {
    id: "searches",
    name: "widgets.searchesName",
    category: "chain" as const,
    component: SearchesSection,
    defaultLayout: { w: 6, h: 11.9, minW: 4, minH: 3 },
    dynamicHeight: true,
  },

  "watched-proposals": {
    id: "watched-proposals",
    name: "widgets.watchedProposalsName",
    category: "account" as const,
    component: WatchedProposalsWidget,
    defaultLayout: { w: 3, h: 6, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "witness-health": {
    id: "witness-health",
    name: "widgets.witnessHealthName",
    category: "account" as const,
    component: WitnessHealthWidget,
    defaultLayout: { w: 3, h: 6, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-wallet": {
    id: "my-wallet",
    name: "widgets.myWalletName",
    category: "account" as const,
    component: MyWalletWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 4 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-balance-history": {
    id: "my-balance-history",
    name: "widgets.myBalanceHistoryName",
    category: "account" as const,
    component: MyBalanceHistoryWidget,
    defaultLayout: { w: 3, h: 10.5, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-recurring-transfers": {
    id: "my-recurring-transfers",
    name: "widgets.myRecurringTransfersName",
    category: "account" as const,
    component: MyRecurringTransfersWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-hp-delegations": {
    id: "my-hp-delegations",
    name: "widgets.myHpDelegationsName",
    category: "account" as const,
    component: MyHpDelegationsWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 3 },
    allowMultiple: false,
  },

  "my-rc-delegations": {
    id: "my-rc-delegations",
    name: "widgets.myRcDelegationsName",
    category: "account" as const,
    component: MyRcDelegationsWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 3 },
    allowMultiple: false,
  },

  "my-authorities": {
    id: "my-authorities",
    name: "widgets.myAuthoritiesName",
    category: "account" as const,
    component: MyAuthoritiesWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-recent-activity": {
    id: "my-recent-activity",
    name: "widgets.myRecentActivityName",
    category: "account" as const,
    component: MyRecentActivityWidget,
    defaultLayout: { w: 3, h: 7, minW: 2, minH: 3 },
    allowMultiple: false,
  },

  "my-rc-footprint": {
    id: "my-rc-footprint",
    name: "widgets.myRcFootprintName",
    description: "widgets.myRcFootprintDescription",
    category: "account" as const,
    component: MyRcFootprintWidget,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-content-activity": {
    id: "my-content-activity",
    name: "widgets.myContentActivityName",
    description: "widgets.myContentActivityDescription",
    category: "account" as const,
    component: MyContentActivityWidget,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-rc-consumption": {
    id: "my-rc-consumption",
    name: "widgets.myRcConsumptionName",
    description: "widgets.myRcConsumptionDescription",
    category: "account" as const,
    component: MyRcConsumptionWidget,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-financial-summary": {
    id: "my-financial-summary",
    name: "widgets.myFinancialSummaryName",
    description: "widgets.myFinancialSummaryDescription",
    category: "account" as const,
    component: MyFinancialSummaryWidget,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-social-interactions": {
    id: "my-social-interactions",
    name: "widgets.mySocialInteractionsName",
    description: "widgets.mySocialInteractionsDescription",
    category: "account" as const,
    component: MySocialInteractionsWidget,
    defaultLayout: { w: 6, h: 13, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-pending-rewards": {
    id: "my-pending-rewards",
    name: "widgets.myPendingRewardsName",
    description: "widgets.myPendingRewardsDescription",
    category: "account" as const,
    component: MyPendingRewardsWidget,
    defaultLayout: { w: 3, h: 11, minW: 2, minH: 4 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "top-holders": {
    id: "top-holders",
    name: "widgets.topHoldersName",
    category: "reports" as const,
    component: TopHoldersWidget,
    defaultLayout: { w: 3, h: 8, minW: 2, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  // --- Layout Widgets (With descriptions and state-management props) ---
  title: {
    id: "title",
    component: TitleWidget,
    name: "widgets.titleName",
    description: "widgets.titleNameDescription",
    category: "layout" as const,
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
    category: "layout" as const,
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
    category: "layout" as const,
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
    category: "layout" as const,
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
    category: "layout" as const,
    defaultLayout: { w: 1, h: 2 },
    isLayoutWidget: true,
    allowMultiple: true,
  },
  separator: {
    id: "separator",
    component: SeparatorWidget,
    name: "widgets.separatorName",
    description: "widgets.separatorNameDescription",
    category: "layout" as const,
    defaultLayout: { w: 12, h: 1, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
  },
  image: {
    id: "image",
    component: ImageWidget,
    name: "widgets.imageName",
    description: "widgets.imageNameDescription",
    category: "layout" as const,
    defaultLayout: { w: 4, h: 5, minW: 2, minH: 2, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialUrl: widgetState?.url || "",
      initialFit: widgetState?.fit || "cover",
      onUrlChange: (url: string) => actions.handleWidgetStateChange({ url }),
      onFitChange: (fit: string) => actions.handleWidgetStateChange({ fit }),
    }),
  },
  note: {
    id: "note",
    component: NoteWidget,
    name: "widgets.noteName",
    description: "widgets.noteNameDescription",
    category: "layout" as const,
    defaultLayout: { w: 4, h: 3, minW: 2, minH: 2, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialText: widgetState?.text,
      initialVariant: widgetState?.variant || "info",
      onTextChange: (text: string) => actions.handleWidgetStateChange({ text }),
      onVariantChange: (variant: string) =>
        actions.handleWidgetStateChange({ variant }),
    }),
  },
  "labeled-divider": {
    id: "labeled-divider",
    component: LabeledDividerWidget,
    name: "widgets.labeledDividerName",
    description: "widgets.labeledDividerNameDescription",
    category: "layout" as const,
    defaultLayout: { w: 12, h: 1, minW: 3, minH: 1, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLabel: widgetState?.label,
      onLabelChange: (label: string) =>
        actions.handleWidgetStateChange({ label }),
    }),
  },
  button: {
    id: "button",
    component: ButtonWidget,
    name: "widgets.buttonName",
    description: "widgets.buttonNameDescription",
    category: "layout" as const,
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 1, isResizable: true },
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLabel: widgetState?.label,
      initialUrl: widgetState?.url,
      initialColor: widgetState?.color,
      onLabelChange: (label: string) =>
        actions.handleWidgetStateChange({ label }),
      onUrlChange: (url: string) => actions.handleWidgetStateChange({ url }),
      onColorChange: (color: string) =>
        actions.handleWidgetStateChange({ color }),
    }),
  },
};

export const ALL_WIDGETS = Object.values(WIDGET_REGISTRY);
