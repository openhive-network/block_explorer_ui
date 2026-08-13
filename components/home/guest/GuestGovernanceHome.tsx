import { Landmark } from "lucide-react";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import NetworkVotingActivityCard from "@/components/home/NetworkVotingActivityCard";
import NetworkHpDistributionCard from "@/components/home/NetworkHpDistributionCard";
import WitnessScheduleWidget from "@/components/dashboard/widgets/data/WitnessScheduleWidget";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";
import GuestBoardHeader from "./GuestBoardHeader";
import GuestSectionTitle from "./GuestSectionTitle";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import { useI18n } from "@/i18n/i18n";
import { config } from "@/Config";

const GuestGovernanceHome = () => {
  const { t } = useI18n();
  const { witnessesData, isWitnessDataLoading } = useWitnesses(
    config.witnessesPerPages.home,
    "rank",
    "asc"
  );

  return (
    <>
      <GuestBoardHeader
        icon={Landmark}
        accent="teal"
        eyebrow={t("guestHome.governance.eyebrow")}
        title={t("guestHome.governance.title")}
        subtitle={t("guestHome.governance.subtitle")}
      />
      <div className="page-container text-white">
        <GuestSectionTitle
          accent="teal"
          label={t("guestHome.governance.sectionProducing")}
          hint={t("guestHome.governance.hintProducing")}
        />
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <div className="col-span-12 flex flex-col lg:col-span-8 [&>*]:mb-0 [&>*]:h-full">
            <NodeSupportGate widgetId="witness-schedule">
              <WitnessScheduleWidget />
            </NodeSupportGate>
          </div>
          <div className="col-span-12 flex flex-col lg:col-span-4 [&>*]:mb-0 [&>*]:h-full">
            <NodeSupportGate widgetId="top-witnesses">
              <TopWitnessesCard
                witnessesData={witnessesData}
                isLoading={isWitnessDataLoading}
              />
            </NodeSupportGate>
          </div>
        </div>

        <GuestSectionTitle
          accent="teal"
          label={t("guestHome.governance.sectionVoting")}
          hint={t("guestHome.governance.hintVoting")}
        />
        <div className="mb-3 grid grid-cols-12 items-stretch gap-3">
          <div className="col-span-12 flex flex-col lg:col-span-6 [&>*]:mb-0 [&>*]:h-full">
            <NodeSupportGate widgetId="voting-activity">
              <NetworkVotingActivityCard />
            </NodeSupportGate>
          </div>
          <div className="col-span-12 flex flex-col lg:col-span-6 [&>*]:mb-0 [&>*]:h-full">
            <NodeSupportGate widgetId="network-hp-distribution">
              <NetworkHpDistributionCard />
            </NodeSupportGate>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestGovernanceHome;
