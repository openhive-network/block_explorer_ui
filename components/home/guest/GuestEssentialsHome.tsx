import HeadBlockCard from "@/components/home/HeadBlockCard";
import SearchesSection from "@/components/home/SearchesSection";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import TopCommunitiesCard from "@/components/home/TopCommunitiesCard";
import NodeSupportGate from "@/components/dashboard/ui/NodeSupportGate";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useCommunities from "@/hooks/api/communities/useCommunities";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useBlockOperationCounts from "@/hooks/common/useBlockOperationCounts";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import GuestBoardHeader from "./GuestBoardHeader";
import { config } from "@/Config";
import { useI18n } from "@/i18n/i18n";
import { Zap } from "lucide-react";

const GuestEssentialsHome = () => {
  const { t } = useI18n();
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
      <GuestBoardHeader
        icon={Zap}
        accent="slate"
        eyebrow={t("guestHome.essentials.eyebrow")}
        title={t("guestHome.essentials.title")}
        subtitle={t("guestHome.essentials.subtitle")}
      />
      <div className="page-container grid grid-cols-12 text-white gap-x-3 gap-y-0">
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col">
          <HeadBlockCard
            headBlockCardData={dynamicGlobalQueryData}
            transactionCount={trxOpsLength}
            blockDetails={headBlockData}
            opcount={opcount}
          />
        </div>

        <div className="col-span-12 md:col-span-8 lg:col-span-6">
          <NodeSupportGate widgetId="last-blocks">
            <LastBlocksWidget headBlock={headBlockNum} />
          </NodeSupportGate>
          <SearchesSection />
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col">
          <NodeSupportGate widgetId="top-witnesses">
            <TopWitnessesCard
              witnessesData={witnessesData}
              isLoading={isWitnessDataLoading}
            />
          </NodeSupportGate>
          <TopCommunitiesCard
            communitiesData={popularCommunitiesData}
            isLoading={isCommunitiesLoading}
          />
        </div>
      </div>
    </>
  );
};

export default GuestEssentialsHome;
