import HeadBlockCard from "@/components/home/HeadBlockCard";
import SearchesSection from "@/components/home/SearchesSection";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { config } from "@/Config";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useBlockOperationCounts from "@/hooks/common/useBlockOperationCounts";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import TransactionStatisticsCard from "@/components/home/TransactionStatisticsCard";
import { useI18n } from "@/i18n/i18n";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import NetworkTopAccountsCard from "@/components/home/NetworkTopAccountsCard";
import useCommunities from "@/hooks/api/communities/useCommunities";
import TopCommunitiesCard from "@/components/home/TopCommunitiesCard";
import TransferVolumeCard from "@/components/home/TransferVolumeCard";
import TotalValueLockedCard from "@/components/home/TotalValueLockedCard";
import NetworkHpDistributionCard from "@/components/home/NetworkHpDistributionCard";
import TopHoldersWidget from "@/components/dashboard/widgets/data/TopHoldersWidget";
import HpMomentumCard from "@/components/home/HpMomentumCard";
import NetworkGrowthCard from "@/components/home/NetworkGrowthCard";
import NetworkVotingActivityCard from "@/components/home/NetworkVotingActivityCard";
import DailyActiveUsersCard from "@/components/home/DailyActiveUsersCard";
import AccountRetentionFunnelCard from "@/components/home/AccountRetentionFunnelCard";
import NetworkAuthorRetentionCard from "@/components/home/NetworkAuthorRetentionCard";
import NetworkOpMixCard from "@/components/home/NetworkOpMixCard";
import NetworkRcUtilizationCard from "@/components/home/NetworkRcUtilizationCard";
import NetworkContentVolumeCard from "@/components/home/NetworkContentVolumeCard";
import NetworkEngagementCard from "@/components/home/NetworkEngagementCard";
import NetworkDappUsageCard from "@/components/home/NetworkDappUsage/NetworkDappUsageCard";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/contexts/WatchlistContext";
import WatchedProposalsWidget from "@/components/dashboard/widgets/data/WatchedProposalsWidget";
import WitnessHealthWidget from "@/components/dashboard/widgets/data/WitnessHealthWidget";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";

const StandardHome = () => {
  const { t } = useI18n();
  const { isLoggedIn } = useAuth();
  const { getWatched } = useWatchlist();
  const hasWatchedProposals = getWatched("proposals").size > 0;

  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.home,
    "rank",
    "asc"
  );

  const {
    communities: popularCommunitiesData,
    isLoading: isCommunitiesLoading,
  } = useCommunities("", "rank", config.popularCommunitiesCount);

  const headBlockNum = useHeadBlockNumber().headBlockNumberData;
  const dynamicGlobalQueryData =
    useDynamicGlobal(headBlockNum).dynamicGlobalData;
  const headBlockData = useHeadBlock(headBlockNum).headBlockData;
  const { opcount, trxOpsLength } = useBlockOperationCounts(headBlockNum);

  return (
    <>
      <Head>
        <title>{t("home.title")}</title>
      </Head>
      <div className="page-container grid grid-cols-12 text-white gap-x-3 gap-y-0">
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col">
          <HeadBlockCard
            headBlockCardData={dynamicGlobalQueryData}
            transactionCount={trxOpsLength}
            blockDetails={headBlockData}
            opcount={opcount}
          />
          <NodeSupportGate widgetId="voting-activity">
            <NetworkVotingActivityCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-hp-distribution">
            <NetworkHpDistributionCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="top-holders">
            <TopHoldersWidget />
          </NodeSupportGate>
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-6">
          <NodeSupportGate widgetId="last-blocks">
            <LastBlocksWidget headBlock={headBlockNum} />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-growth">
            <NetworkGrowthCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="daily-active-users">
            <DailyActiveUsersCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="account-retention-funnel">
            <AccountRetentionFunnelCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-author-retention">
            <NetworkAuthorRetentionCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="op-mix">
            <NetworkOpMixCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-rc-utilization">
            <NetworkRcUtilizationCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-engagement">
            <NetworkEngagementCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="tx-stats">
            <TransactionStatisticsCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="transfer-volume">
            <TransferVolumeCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="tvl">
            <TotalValueLockedCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="hp-momentum">
            <HpMomentumCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-content-volume">
            <NetworkContentVolumeCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-dapp-usage">
            <NetworkDappUsageCard />
          </NodeSupportGate>
          <SearchesSection />
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col">
          {isLoggedIn && hasWatchedProposals && <WatchedProposalsWidget />}
          <NodeSupportGate widgetId="top-witnesses">
            <TopWitnessesCard
              witnessesData={witnessesData}
              isLoading={isWitnessDataLoading}
            />
          </NodeSupportGate>
          <NodeSupportGate widgetId="top-accounts">
            <NetworkTopAccountsCard />
          </NodeSupportGate>
          <TopCommunitiesCard
            communitiesData={popularCommunitiesData}
            isLoading={isCommunitiesLoading}
          />
          {isLoggedIn && <WitnessHealthWidget />}
        </div>
      </div>
    </>
  );
};

export default StandardHome;
