import { LineChart } from "lucide-react";
import TransferVolumeCard from "@/components/home/TransferVolumeCard";
import TotalValueLockedCard from "@/components/home/TotalValueLockedCard";
import HpMomentumCard from "@/components/home/HpMomentumCard";
import TopHoldersWidget from "@/components/dashboard/widgets/data/TopHoldersWidget";
import NetworkTopAccountsCard from "@/components/home/NetworkTopAccountsCard";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";
import GuestBoardHeader from "./GuestBoardHeader";
import GuestSectionTitle from "./GuestSectionTitle";
import { useI18n } from "@/i18n/i18n";

const GuestMarketHome = () => {
  const { t } = useI18n();
  return (
    <>
      <GuestBoardHeader
        icon={LineChart}
        accent="amber"
        eyebrow={t("guestHome.market.eyebrow")}
        title={t("guestHome.market.title")}
        subtitle={t("guestHome.market.subtitle")}
      />
      <div className="page-container grid grid-cols-12 text-white gap-3">
        <div className="col-span-12 lg:col-span-8">
          <GuestSectionTitle
            accent="amber"
            label={t("guestHome.market.sectionValue")}
            hint={t("guestHome.market.hintValue")}
          />
          <NodeSupportGate widgetId="tvl">
            <TotalValueLockedCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="transfer-volume">
            <TransferVolumeCard />
          </NodeSupportGate>
          <NodeSupportGate widgetId="hp-momentum">
            <HpMomentumCard />
          </NodeSupportGate>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <GuestSectionTitle
            accent="amber"
            label={t("guestHome.market.sectionHeld")}
            hint={t("guestHome.market.hintHeld")}
          />
          <NodeSupportGate widgetId="top-holders">
            <TopHoldersWidget />
          </NodeSupportGate>
          <NodeSupportGate widgetId="top-accounts">
            <NetworkTopAccountsCard />
          </NodeSupportGate>
        </div>
      </div>
    </>
  );
};

export default GuestMarketHome;
