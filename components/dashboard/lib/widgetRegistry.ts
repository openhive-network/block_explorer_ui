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
import MyCommunityActivityWidget from "@/components/dashboard/widgets/data/MyCommunityActivityWidget";
import MyPendingRewardsWidget from "@/components/dashboard/widgets/data/MyPendingRewardsWidget";
import MyNotificationsWidget from "@/components/dashboard/widgets/data/MyNotificationsWidget";
import MyAccountSnapshotWidget from "@/components/dashboard/widgets/data/MyAccountSnapshotWidget";
import MyTopPostsWidget from "@/components/dashboard/widgets/data/MyTopPostsWidget";
import MyCommunitiesWidget from "@/components/dashboard/widgets/data/MyCommunitiesWidget";
import MyPostingActivityWidget from "@/components/dashboard/widgets/data/MyPostingActivityWidget";
import MyHpActivityWidget from "@/components/dashboard/widgets/data/MyHpActivityWidget";
import MyProposalVotesWidget from "@/components/dashboard/widgets/data/MyProposalVotesWidget";
import WitnessScheduleWidget from "@/components/dashboard/widgets/data/WitnessScheduleWidget";
import TopHoldersWidget from "@/components/dashboard/widgets/data/TopHoldersWidget";
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
import BoardHeaderWidget from "@/components/dashboard/widgets/layout/BoardHeaderWidget";
import ProfileBannerWidget from "@/components/dashboard/widgets/layout/ProfileBannerWidget";
import GlossaryWidget from "@/components/dashboard/widgets/layout/GlossaryWidget";
import { DashboardActions, DashboardData } from "../hooks/useDashboardData";
import { WIDGET_LAYOUT_DEFAULTS } from "./widgetLayoutDefaults";

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
  // Mastheads are added at row 0 full-width, not appended at the bottom.
  placement?: "masthead";
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["live-info"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["hive-price-chart"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["fund-and-supply"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["hive-parameters"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["blockchain-dates"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["market-data"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["last-blocks"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["top-witnesses"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["top-communities"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["top-accounts"],
    dynamicHeight: true,
  },
  "tx-stats": {
    id: "tx-stats",
    name: "widgets.txStatsName",
    category: "reports" as const,
    component: TransactionStatisticsCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["tx-stats"],
    dynamicHeight: true,
  },
  "transfer-volume": {
    id: "transfer-volume",
    name: "widgets.transferVolumeName",
    category: "reports" as const,
    component: TransferVolumeCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["transfer-volume"],
    dynamicHeight: true,
  },
  tvl: {
    id: "tvl",
    name: "widgets.tvlName",
    category: "reports" as const,
    component: TotalValueLockedCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["tvl"],
    dynamicHeight: true,
  },
  "network-hp-distribution": {
    id: "network-hp-distribution",
    name: "widgets.networkHpDistributionName",
    category: "reports" as const,
    component: NetworkHpDistributionCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-hp-distribution"],
    dynamicHeight: true,
  },
  "network-growth": {
    id: "network-growth",
    name: "widgets.networkGrowthName",
    category: "reports" as const,
    component: NetworkGrowthCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-growth"],
    dynamicHeight: true,
  },
  "hp-momentum": {
    id: "hp-momentum",
    name: "widgets.hpMomentumName",
    category: "reports" as const,
    component: HpMomentumCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["hp-momentum"],
    dynamicHeight: true,
  },
  "daily-active-users": {
    id: "daily-active-users",
    name: "widgets.dailyActiveUsersName",
    category: "reports" as const,
    component: DailyActiveUsersCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["daily-active-users"],
    dynamicHeight: true,
  },
  "account-retention-funnel": {
    id: "account-retention-funnel",
    name: "widgets.accountRetentionFunnelName",
    category: "reports" as const,
    component: AccountRetentionFunnelCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["account-retention-funnel"],
    dynamicHeight: true,
  },
  "network-author-retention": {
    id: "network-author-retention",
    name: "widgets.networkAuthorRetentionName",
    category: "reports" as const,
    component: NetworkAuthorRetentionCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-author-retention"],
    dynamicHeight: true,
  },
  "op-mix": {
    id: "op-mix",
    name: "widgets.opMixName",
    category: "reports" as const,
    component: NetworkOpMixCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["op-mix"],
    dynamicHeight: true,
  },
  "network-rc-utilization": {
    id: "network-rc-utilization",
    name: "widgets.networkRcUtilizationName",
    category: "reports" as const,
    component: NetworkRcUtilizationCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-rc-utilization"],
    dynamicHeight: true,
  },
  "network-content-volume": {
    id: "network-content-volume",
    name: "widgets.networkContentVolumeName",
    category: "reports" as const,
    component: NetworkContentVolumeCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-content-volume"],
    dynamicHeight: true,
  },
  "network-engagement": {
    id: "network-engagement",
    name: "widgets.networkEngagementName",
    category: "reports" as const,
    component: NetworkEngagementCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-engagement"],
    dynamicHeight: true,
  },
  "network-dapp-usage": {
    id: "network-dapp-usage",
    name: "widgets.networkDappUsageName",
    category: "reports" as const,
    component: NetworkDappUsageCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["network-dapp-usage"],
    dynamicHeight: true,
  },
  "voting-activity": {
    id: "voting-activity",
    name: "widgets.votingActivityName",
    category: "reports" as const,
    component: NetworkVotingActivityCard,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["voting-activity"],
    dynamicHeight: true,
  },
  searches: {
    id: "searches",
    name: "widgets.searchesName",
    category: "chain" as const,
    component: SearchesSection,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["searches"],
    dynamicHeight: true,
  },

  "watched-proposals": {
    id: "watched-proposals",
    name: "widgets.watchedProposalsName",
    category: "account" as const,
    component: WatchedProposalsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["watched-proposals"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "witness-health": {
    id: "witness-health",
    name: "widgets.witnessHealthName",
    category: "account" as const,
    component: WitnessHealthWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["witness-health"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-wallet": {
    id: "my-wallet",
    name: "widgets.myWalletName",
    category: "account" as const,
    component: MyWalletWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-wallet"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-balance-history": {
    id: "my-balance-history",
    name: "widgets.myBalanceHistoryName",
    category: "account" as const,
    component: MyBalanceHistoryWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-balance-history"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-recurring-transfers": {
    id: "my-recurring-transfers",
    name: "widgets.myRecurringTransfersName",
    category: "account" as const,
    component: MyRecurringTransfersWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-recurring-transfers"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-hp-delegations": {
    id: "my-hp-delegations",
    name: "widgets.myHpDelegationsName",
    category: "account" as const,
    component: MyHpDelegationsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-hp-delegations"],
    allowMultiple: false,
  },

  "my-rc-delegations": {
    id: "my-rc-delegations",
    name: "widgets.myRcDelegationsName",
    category: "account" as const,
    component: MyRcDelegationsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-rc-delegations"],
    allowMultiple: false,
  },

  "my-authorities": {
    id: "my-authorities",
    name: "widgets.myAuthoritiesName",
    category: "account" as const,
    component: MyAuthoritiesWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-authorities"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-recent-activity": {
    id: "my-recent-activity",
    name: "widgets.myRecentActivityName",
    category: "account" as const,
    component: MyRecentActivityWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-recent-activity"],
    allowMultiple: false,
  },

  "my-rc-footprint": {
    id: "my-rc-footprint",
    name: "widgets.myRcFootprintName",
    description: "widgets.myRcFootprintDescription",
    category: "account" as const,
    component: MyRcFootprintWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-rc-footprint"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-content-activity": {
    id: "my-content-activity",
    name: "widgets.myContentActivityName",
    description: "widgets.myContentActivityDescription",
    category: "account" as const,
    component: MyContentActivityWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-content-activity"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-rc-consumption": {
    id: "my-rc-consumption",
    name: "widgets.myRcConsumptionName",
    description: "widgets.myRcConsumptionDescription",
    category: "account" as const,
    component: MyRcConsumptionWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-rc-consumption"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-financial-summary": {
    id: "my-financial-summary",
    name: "widgets.myFinancialSummaryName",
    description: "widgets.myFinancialSummaryDescription",
    category: "account" as const,
    component: MyFinancialSummaryWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-financial-summary"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-social-interactions": {
    id: "my-social-interactions",
    name: "widgets.mySocialInteractionsName",
    description: "widgets.mySocialInteractionsDescription",
    category: "account" as const,
    component: MySocialInteractionsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-social-interactions"],
    allowMultiple: false,
    dynamicHeight: true,
  },
  "my-community-activity": {
    id: "my-community-activity",
    name: "widgets.myCommunityActivityName",
    description: "widgets.myCommunityActivityDescription",
    category: "account" as const,
    component: MyCommunityActivityWidget,
    defaultLayout: { w: 6, h: 8, minW: 3, minH: 3 },
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-pending-rewards": {
    id: "my-pending-rewards",
    name: "widgets.myPendingRewardsName",
    description: "widgets.myPendingRewardsDescription",
    category: "account" as const,
    component: MyPendingRewardsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-pending-rewards"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-notifications": {
    id: "my-notifications",
    name: "widgets.myNotificationsName",
    description: "widgets.myNotificationsDescription",
    category: "account" as const,
    component: MyNotificationsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-notifications"],
    allowMultiple: false,
  },

  "my-account-snapshot": {
    id: "my-account-snapshot",
    name: "widgets.myAccountSnapshotName",
    description: "widgets.myAccountSnapshotDescription",
    category: "account" as const,
    component: MyAccountSnapshotWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-account-snapshot"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-top-posts": {
    id: "my-top-posts",
    name: "widgets.myTopPostsName",
    description: "widgets.myTopPostsDescription",
    category: "account" as const,
    component: MyTopPostsWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-top-posts"],
    allowMultiple: false,
  },

  "my-communities": {
    id: "my-communities",
    name: "widgets.myCommunitiesName",
    description: "widgets.myCommunitiesDescription",
    category: "account" as const,
    component: MyCommunitiesWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-communities"],
    allowMultiple: false,
  },

  "witness-schedule": {
    id: "witness-schedule",
    name: "widgets.witnessScheduleName",
    description: "widgets.witnessScheduleDescription",
    category: "chain" as const,
    component: WitnessScheduleWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["witness-schedule"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-proposal-votes": {
    id: "my-proposal-votes",
    name: "widgets.myProposalVotesName",
    description: "widgets.myProposalVotesDescription",
    category: "account" as const,
    component: MyProposalVotesWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-proposal-votes"],
    allowMultiple: false,
  },

  "my-hp-activity": {
    id: "my-hp-activity",
    name: "widgets.myHpActivityName",
    description: "widgets.myHpActivityDescription",
    category: "account" as const,
    component: MyHpActivityWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-hp-activity"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  "my-posting-activity": {
    id: "my-posting-activity",
    name: "widgets.myPostingActivityName",
    description: "widgets.myPostingActivityDescription",
    category: "account" as const,
    component: MyPostingActivityWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["my-posting-activity"],
    allowMultiple: false,
  },

  "top-holders": {
    id: "top-holders",
    name: "widgets.topHoldersName",
    category: "reports" as const,
    component: TopHoldersWidget,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["top-holders"],
    allowMultiple: false,
    dynamicHeight: true,
  },

  // --- Layout Widgets (With descriptions and state-management props) ---
  "board-header": {
    id: "board-header",
    component: BoardHeaderWidget,
    name: "widgets.boardHeaderName",
    description: "widgets.boardHeaderNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["board-header"],
    placement: "masthead" as const,
    dynamicHeight: true,
    isLayoutWidget: true,
    // One per board: a second toggle would drive the same global setting.
    allowMultiple: false,
    getProps: (data, widgetState, actions) => ({
      initialEyebrow: widgetState?.eyebrow,
      initialTitle: widgetState?.title,
      initialSubtitle: widgetState?.subtitle,
      initialAccent: widgetState?.accent,
      initialIcon: widgetState?.icon,
      headBlock: data.headBlockNum,
      blockTime: data.headBlockData?.created_at,
      showLiveData: widgetState?.showLiveData !== false,
      showBlockTime: widgetState?.showBlockTime !== false,
      showBlockNumber: widgetState?.showBlockNumber !== false,
      onShowLiveDataChange: (showLiveData: boolean) =>
        actions.handleWidgetStateChange({ showLiveData }),
      onShowBlockTimeChange: (showBlockTime: boolean) =>
        actions.handleWidgetStateChange({ showBlockTime }),
      onShowBlockNumberChange: (showBlockNumber: boolean) =>
        actions.handleWidgetStateChange({ showBlockNumber }),
      onEyebrowChange: (eyebrow: string) =>
        actions.handleWidgetStateChange({ eyebrow }),
      onTitleChange: (title: string) =>
        actions.handleWidgetStateChange({ title }),
      onSubtitleChange: (subtitle: string) =>
        actions.handleWidgetStateChange({ subtitle }),
      onAccentChange: (accent: string) =>
        actions.handleWidgetStateChange({ accent }),
    }),
  },
  "profile-banner": {
    id: "profile-banner",
    component: ProfileBannerWidget,
    name: "widgets.profileBannerName",
    description: "widgets.profileBannerNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["profile-banner"],
    placement: "masthead" as const,
    dynamicHeight: true,
    isLayoutWidget: true,
    allowMultiple: false,
    getProps: (data, widgetState, actions) => ({
      initialTagline: widgetState?.tagline,
      initialAccent: widgetState?.accent,
      headBlock: data.headBlockNum,
      blockTime: data.headBlockData?.created_at,
      showLiveData: widgetState?.showLiveData !== false,
      showBlockTime: widgetState?.showBlockTime !== false,
      showBlockNumber: widgetState?.showBlockNumber !== false,
      onTaglineChange: (tagline: string) =>
        actions.handleWidgetStateChange({ tagline }),
      onAccentChange: (accent: string) =>
        actions.handleWidgetStateChange({ accent }),
      onShowLiveDataChange: (showLiveData: boolean) =>
        actions.handleWidgetStateChange({ showLiveData }),
      onShowBlockTimeChange: (showBlockTime: boolean) =>
        actions.handleWidgetStateChange({ showBlockTime }),
      onShowBlockNumberChange: (showBlockNumber: boolean) =>
        actions.handleWidgetStateChange({ showBlockNumber }),
    }),
  },
  glossary: {
    id: "glossary",
    component: GlossaryWidget,
    name: "widgets.glossaryName",
    description: "widgets.glossaryNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["glossary"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialTitle: widgetState?.title,
      initialTerms: widgetState?.terms,
      initialAccent: widgetState?.accent,
      onTitleChange: (title: string) =>
        actions.handleWidgetStateChange({ title }),
      onTermsChange: (terms: string) =>
        actions.handleWidgetStateChange({ terms }),
    }),
  },
  title: {
    id: "title",
    component: TitleWidget,
    name: "widgets.titleName",
    description: "widgets.titleNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["title"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["markdown"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["quick-links"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLinks: widgetState?.links || [],
      initialTitle: widgetState?.title,
      initialAccent: widgetState?.accent,
      onLinksChange: (newLinks: Array<{ label: string; url: string }>) =>
        actions.handleWidgetStateChange({ links: newLinks }),
      onTitleChange: (title: string) =>
        actions.handleWidgetStateChange({ title }),
    }),
  },
  spacer: {
    id: "spacer",
    component: SpacerWidget,
    name: "widgets.spacerName",
    description: "widgets.spacerNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["spacer"],
    isLayoutWidget: true,
    allowMultiple: true,
  },
  separator: {
    id: "separator",
    component: SeparatorWidget,
    name: "widgets.separatorName",
    description: "widgets.separatorNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["separator"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialVariant: widgetState?.variant || "line",
      initialAccent: widgetState?.accent,
      onVariantChange: (variant: string) =>
        actions.handleWidgetStateChange({ variant }),
    }),
  },
  image: {
    id: "image",
    component: ImageWidget,
    name: "widgets.imageName",
    description: "widgets.imageNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["image"],
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["note"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialText: widgetState?.text,
      initialTitle: widgetState?.title,
      initialVariant: widgetState?.variant || "info",
      onTextChange: (text: string) => actions.handleWidgetStateChange({ text }),
      onTitleChange: (title: string) =>
        actions.handleWidgetStateChange({ title }),
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
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["labeled-divider"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLabel: widgetState?.label,
      initialHint: widgetState?.hint,
      initialAccent: widgetState?.accent,
      onLabelChange: (label: string) =>
        actions.handleWidgetStateChange({ label }),
      onHintChange: (hint: string) => actions.handleWidgetStateChange({ hint }),
      onAccentChange: (accent: string) =>
        actions.handleWidgetStateChange({ accent }),
    }),
  },
  button: {
    id: "button",
    component: ButtonWidget,
    name: "widgets.buttonName",
    description: "widgets.buttonNameDescription",
    category: "layout" as const,
    defaultLayout: WIDGET_LAYOUT_DEFAULTS["button"],
    isLayoutWidget: true,
    allowMultiple: true,
    getProps: (data, widgetState, actions) => ({
      initialLabel: widgetState?.label,
      initialUrl: widgetState?.url,
      onLabelChange: (label: string) =>
        actions.handleWidgetStateChange({ label }),
      onUrlChange: (url: string) => actions.handleWidgetStateChange({ url }),
    }),
  },
};

export const ALL_WIDGETS = Object.values(WIDGET_REGISTRY);
