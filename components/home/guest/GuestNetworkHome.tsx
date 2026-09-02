import DailyActiveUsersCard from "@/components/home/DailyActiveUsersCard";
import TransactionStatisticsCard from "@/components/home/TransactionStatisticsCard";
import NetworkOpMixCard from "@/components/home/NetworkOpMixCard";
import NetworkDappUsageCard from "@/components/home/NetworkDappUsage/NetworkDappUsageCard";
import NetworkRcUtilizationCard from "@/components/home/NetworkRcUtilizationCard";
import NetworkGrowthCard from "@/components/home/NetworkGrowthCard";
import NetworkContentVolumeCard from "@/components/home/NetworkContentVolumeCard";
import NetworkEngagementCard from "@/components/home/NetworkEngagementCard";
import NetworkAuthorRetentionCard from "@/components/home/NetworkAuthorRetentionCard";
import AccountRetentionFunnelCard from "@/components/home/AccountRetentionFunnelCard";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";
import GuestBoardHeader from "./GuestBoardHeader";
import GuestSectionTitle from "./GuestSectionTitle";
import { Activity } from "lucide-react";
import { useI18n } from "@/i18n/i18n";

const GuestNetworkHome = () => {
  const { t } = useI18n();
  return (
    <>
      <GuestBoardHeader
        headingLevel="h1"
        icon={Activity}
        accent="blue"
        eyebrow={t("guestHome.network.eyebrow")}
        title={t("guestHome.network.title")}
        subtitle={t("guestHome.network.subtitle")}
      />
      <div className="page-container grid grid-cols-12 text-white gap-3">
        <div className="col-span-12 lg:col-span-6">
          <GuestSectionTitle
            accent="blue"
            label={t("guestHome.network.sectionUse")}
            hint={t("guestHome.network.hintUse")}
          />
          <NodeSupportGate widgetId="daily-active-users">
            <DailyActiveUsersCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="tx-stats">
            <TransactionStatisticsCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="op-mix">
            <NetworkOpMixCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-dapp-usage">
            <NetworkDappUsageCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-content-volume">
            <NetworkContentVolumeCard />
          </NodeSupportGate>
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col">
          <GuestSectionTitle
            accent="blue"
            label={t("guestHome.network.sectionCapacity")}
            hint={t("guestHome.network.hintCapacity")}
          />
          <NodeSupportGate widgetId="network-growth">
            <NetworkGrowthCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-rc-utilization">
            <NetworkRcUtilizationCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-engagement">
            <NetworkEngagementCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="network-author-retention">
            <NetworkAuthorRetentionCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="account-retention-funnel">
            <AccountRetentionFunnelCard />
          </NodeSupportGate>
        </div>
      </div>
    </>
  );
};

export default GuestNetworkHome;
