import HeadBlockCard from "@/components/home/HeadBlockCard";
import SearchesSection from "@/components/home/SearchesSection";
import LastBlocksWidget from "@/components/LastBlocksWidget";
import useWitnesses from "@/hooks/api/common/useWitnesses";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import { config } from "@/Config";
import useHeadBlock from "@/hooks/api/homePage/useHeadBlock";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import { useHeadBlockNumber } from "@/contexts/HeadBlockContext";
import { useTheme } from "@/contexts/ThemeContext";
import TransactionStatisticsCard from "@/components/home/TransactionStatisticsCard";
import { useI18n } from "@/i18n/i18n";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import useCommunities from "@/hooks/api/communities/useCommunities";
import TopCommunitiesCard from "@/components/home/TopCommunitiesCard";
import TransferVolumeCard from "@/components/home/TransferVolumeCard";
import TotalValueLockedCard from "@/components/home/TotalValueLockedCard";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/contexts/WatchlistContext";
import WatchedProposalsWidget from "@/components/dashboard/widgets/data/WatchedProposalsWidget";
import WitnessHealthWidget from "@/components/dashboard/widgets/data/WitnessHealthWidget";

const StandardHome = () => {
  const { theme } = useTheme();
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
  const { blockOperations } = useBlockOperations(headBlockNum || 0);

  const trxOperations = blockOperations?.operations_result.reduce(
    (max, operation) => {
      if (typeof operation?.trx_in_block === "number") {
        return Math.max(max, operation.trx_in_block);
      } else {
        return max;
      }
    },
    0
  );

  const [opcount, setOpcount] = useState<number>(0);
  const [trxOpsLength, setTrxOpLength] = useState<number>(0);

  useEffect(() => {
    if (blockOperations?.total_operations) {
      setOpcount(blockOperations?.total_operations);
    }
    if (trxOperations) {
      setTrxOpLength(trxOperations + 1);
    }
  }, [blockOperations?.total_operations, trxOperations]);

  const strokeColor = theme === "dark" ? "#FFF" : "#000";

  return (
    <>
      <Head>
        <title>{t("home.title")}</title>
      </Head>
      <div className="page-container grid grid-cols-12 text-white gap-3">
        <HeadBlockCard
          headBlockCardData={dynamicGlobalQueryData}
          transactionCount={trxOpsLength}
          blockDetails={headBlockData}
          opcount={opcount}
        />

        <div className="col-span-12 md:col-span-8 lg:col-span-6">
          <LastBlocksWidget
            headBlock={headBlockNum}
            strokeColor={strokeColor}
          />
          <TransactionStatisticsCard />
          <TransferVolumeCard />
          <TotalValueLockedCard />
          <div className="mt-4">
            <SearchesSection />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          {isLoggedIn && hasWatchedProposals && <WatchedProposalsWidget />}
          <TopWitnessesCard
            witnessesData={witnessesData}
            isLoading={isWitnessDataLoading}
          />
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
