import { useState, useEffect } from "react";

import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { getVestsToHiveRatio } from "@/utils/Calculations";
import HeadBlockPropertyCard from "./HeadBlockPropertyCard";
import MarketDataStats from "./MarketDataStats";
import {
  fundAndSupplyParameters,
  hiveParameters,
  blockchainDates,
} from "./headBlockParameters";
import { Card, CardContent } from "../ui/card";
import CurrentBlockCard from "./CurrentBlockCard";
import HeadBlockHiveChartCard from "./HeadBlockHiveChartCard";
import dynamic from "next/dynamic";
const HiveFullChartDialog = dynamic(() => import("./HiveFullChartDialog"), {
  ssr: false,
});
import { useI18n } from "../../i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

interface HeadBlockCardProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  blockDetails?: Hive.BlockDetails | null;
  transactionCount?: number;
  opcount?: number;
}

const calculateTimeDifference = (createdAt: string, blockchainDate: number) => {
  const blockCreationDate = new Date(createdAt).getTime();
  const timeDifference = Math.abs(blockchainDate - blockCreationDate);

  const timeDiffInSeconds = Math.floor(timeDifference / 1000);

  return timeDiffInSeconds;
};

const HeadBlockCard: React.FC<HeadBlockCardProps> = ({
  headBlockCardData,
  transactionCount,
  blockDetails,
  opcount = 0,
}) => {
  const { t } = useI18n();
  const isBlockCardLoading = !headBlockCardData?.headBlockDetails;

  const [hiddenPropertiesByCard, setHiddenPropertiesByCard] = useState<any>({
    timeCard: true,
    supplyCard: true,
    hiveParamsCard: true,
    hiveChart: false,
  });
  const [isFullHiveChartVisible, setIsFullHiveChartVisible] =
    useState<boolean>(false);

  const { settings } = useSettings();

  const handleHideBlockchainDates = () => {
    setHiddenPropertiesByCard({
      ...hiddenPropertiesByCard,
      timeCard: !hiddenPropertiesByCard.timeCard,
    });
  };
  const handleHideSupplyParams = () => {
    setHiddenPropertiesByCard({
      ...hiddenPropertiesByCard,
      supplyCard: !hiddenPropertiesByCard.supplyCard,
    });
  };

  const handleHideHiveParams = () => {
    setHiddenPropertiesByCard({
      ...hiddenPropertiesByCard,
      hiveParamsCard: !hiddenPropertiesByCard.hiveParamsCard,
    });
  };

  const handleHideHiveChart = () => {
    setHiddenPropertiesByCard({
      ...hiddenPropertiesByCard,
      hiveChart: !hiddenPropertiesByCard.hiveChart,
    });
  };

  const handleHiveFullChartVisibility = () => {
    setIsFullHiveChartVisible(!isFullHiveChartVisible);
  };

  const blockchainTime = headBlockCardData?.headBlockDetails.blockchainTime;
  const formattedBlockchainTime = blockchainTime
    ?.replace(/\//g, "-")
    .replace(" UTC", "");
  const blockchainDate = formattedBlockchainTime
    ? new Date(formattedBlockchainTime).getTime()
    : null;

  const [timeDifferenceInSeconds, setTimeDifferenceInSeconds] = useState<
    number | null
  >(null);

  const timeDifference = calculateTimeDifference(
    blockDetails?.created_at as string,
    blockchainDate as number
  );

  useEffect(() => {
    if (!blockDetails?.created_at || !blockchainDate) return;

    setTimeDifferenceInSeconds(timeDifference);
  }, [blockDetails?.created_at, blockchainDate, timeDifference]);

  const intervalTime = config.accountRefreshInterval;
  /*States to handle seamless update of blockNumber , blockChainTime, feedprice, and vests/hive ratio when liveData is on*/
  const [liveBlockNumber, setLiveBlockNumber] = useState<number | null>(
    blockDetails?.block_num ?? null
  );
  const [liveFeedPrice, setLiveFeedPrice] = useState<number | undefined>(
    headBlockCardData?.headBlockDetails?.feedPrice
  );
  const [liveVestsToHiveRatio, setLiveVestsToHiveRatio] = useState<
    string | undefined
  >(getVestsToHiveRatio(headBlockCardData));

  useEffect(() => {
    if (headBlockCardData?.headBlockDetails?.feedPrice) {
      setLiveFeedPrice(headBlockCardData.headBlockDetails.feedPrice);
    }
  }, [headBlockCardData?.headBlockDetails?.feedPrice]);

  useEffect(() => {
    const newVestsToHiveRatio = getVestsToHiveRatio(headBlockCardData);
    if (newVestsToHiveRatio) {
      setLiveVestsToHiveRatio(newVestsToHiveRatio);
    }
  }, [headBlockCardData]);

  /*Block Number Update*/
  useEffect(() => {
    if (!blockDetails?.block_num || !settings.liveData) return;

    setLiveBlockNumber(blockDetails.block_num);

    const intervalId = setInterval(() => {
      setLiveBlockNumber((prevBlockNum) => {
        if (!prevBlockNum) return blockDetails.block_num;
        return prevBlockNum;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [blockDetails?.block_num, settings.liveData, intervalTime]);

  /*Feed Price and Vest/Hive Ratio Update*/
  useEffect(() => {
    if (!settings.liveData) return;
    const intervalId = setInterval(() => {
      setLiveFeedPrice((prevFeedPrice) => {
        const newFeedPrice =
          headBlockCardData?.headBlockDetails?.feedPrice ?? 0;
        if (prevFeedPrice !== newFeedPrice) {
          return newFeedPrice;
        }
        return prevFeedPrice;
      });

      setLiveVestsToHiveRatio((prevRatio) => {
        const newRatio = getVestsToHiveRatio(headBlockCardData);
        if (prevRatio !== newRatio) {
          return newRatio;
        }
        return prevRatio;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [settings.liveData, headBlockCardData, intervalTime]);

  return (
    <>
      <Card
        className="col-span-12 md:col-span-4 lg:col-span-3 mb-2"
        data-testid="head-block-card"
      >
        <CardContent className="px-3 pt-2 pb-2 space-y-1">
          {/* Last Block Information */}
          <CurrentBlockCard
            blockDetails={blockDetails}
            transactionCount={transactionCount}
            opcount={opcount}
            timeDifferenceInSeconds={timeDifferenceInSeconds}
            liveBlockNumber={liveBlockNumber}
            isLive={settings.liveData}
          />
          {/* Other Information*/}
          <MarketDataStats
            feedPrice={liveFeedPrice}
            vestsToHiveRatio={liveVestsToHiveRatio}
          />

          <HeadBlockHiveChartCard
            header={t("headBlockCard.hivePriceChart")}
            isParamsHidden={hiddenPropertiesByCard.hiveChart}
            handleHideParams={handleHideHiveChart}
            handleHiveFullChartVisibility={handleHiveFullChartVisibility}
          />
          <HeadBlockPropertyCard
            parameters={fundAndSupplyParameters}
            header={t("headBlockCard.fundAndSupply")}
            isParamsHidden={hiddenPropertiesByCard.supplyCard}
            handleHideParams={handleHideSupplyParams}
            isLoading={isBlockCardLoading}
            dynamicGlobalData={headBlockCardData}
          />
          <HeadBlockPropertyCard
            parameters={hiveParameters}
            header={t("headBlockCard.hiveParameters")}
            isParamsHidden={hiddenPropertiesByCard.hiveParamsCard}
            handleHideParams={handleHideHiveParams}
            isLoading={isBlockCardLoading}
            dynamicGlobalData={headBlockCardData}
          />
          <HeadBlockPropertyCard
            parameters={blockchainDates}
            header={t("headBlockCard.blockchainDates")}
            isParamsHidden={hiddenPropertiesByCard.timeCard}
            handleHideParams={handleHideBlockchainDates}
            isLoading={isBlockCardLoading}
            dynamicGlobalData={headBlockCardData}
          />
        </CardContent>
      </Card>
      <HiveFullChartDialog
        isOpen={isFullHiveChartVisible}
        handleHiveFullChartVisibility={handleHiveFullChartVisibility}
      />
    </>
  );
};

export default HeadBlockCard;
