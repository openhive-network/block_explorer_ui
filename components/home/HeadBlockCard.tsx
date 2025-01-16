import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { getVestsToHiveRatio } from "@/utils/Calculations";
import { useUserSettingsContext } from "../../contexts/UserSettingsContext";
import useBlockchainSyncInfo from "@/hooks/common/useBlockchainSyncInfo";
import HeadBlockPropertyCard from "./HeadBlockPropertyCard";
import {
  fundAndSupplyParameters,
  hiveParameters,
  blockchainDates,
} from "./headBlockParameters";
import { getBlockDifference } from "./SyncInfo";
import { Toggle } from "../ui/toggle";
import { Card, CardContent, CardHeader } from "../ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCube,
  faBoxes,
  faExchangeAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

interface HeadBlockCardProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  blockDetails?: Hive.BlockDetails;
  transactionCount?: number;
  opcount?: number;
}

const HeadBlockCard: React.FC<HeadBlockCardProps> = ({
  headBlockCardData,
  transactionCount,
  blockDetails,
  opcount = 0,
}) => {
  const isBlockCardLoading =
    !headBlockCardData || !headBlockCardData.headBlockDetails ? true : false;

  const [hiddenPropertiesByCard, setHiddenPropertiesByCard] = useState<any>({
    timeCard: true,
    supplyCard: true,
    hiveParamsCard: true,
  });
  const { settings, setSettings } = useUserSettingsContext();

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

  const {
    explorerBlockNumber,
    hiveBlockNumber,
    loading: isLoading,
  } = useBlockchainSyncInfo();

  const blockDifference = getBlockDifference(
    hiveBlockNumber,
    explorerBlockNumber
  );

  const isLiveDataToggleDisabled =
    blockDifference > config.liveblockSecurityDifference || isLoading;

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

  useEffect(() => {
    // Define the calculation logic
    const calculateTimeDifference = () => {
      if (!blockDetails?.created_at || !blockchainDate) {
        setTimeDifferenceInSeconds(null);
        return;
      }

      const blockCreationDate = new Date(blockDetails.created_at).getTime();
      const timeDifference = Math.abs(blockchainDate - blockCreationDate);

      setTimeDifferenceInSeconds(Math.floor(timeDifference / 1000));
    };

    // Invoke the calculation whenever dependencies change
    calculateTimeDifference();

    // Clean up function is unnecessary here as we only update the state
  }, [blockDetails?.created_at, blockchainDate]);

  // refresh interval
  const intervalTime = config.accountRefreshInterval;

  /*States to handle seamless update of blockNumber , blockChainTime, feedprice, and vests/hive ratio when liveData is on*/
  const [liveBlockchainTime, setLiveBlockchainTime] = useState<Date | null>(
    null
  );
  const [liveBlockNumber, setLiveBlockNumber] = useState<number | null>(
    blockDetails?.block_num ?? null
  );
  const [liveFeedPrice, setLiveFeedPrice] = useState<number | undefined>(
    headBlockCardData?.headBlockDetails?.feedPrice
  );
  const [liveVestsToHiveRatio, setLiveVestsToHiveRatio] = useState<
    string | undefined
  >(getVestsToHiveRatio(headBlockCardData));

  // Update liveFeedPrice when feedPrice changes
  useEffect(() => {
    if (headBlockCardData?.headBlockDetails?.feedPrice) {
      setLiveFeedPrice(headBlockCardData.headBlockDetails.feedPrice);
    }
  }, [headBlockCardData?.headBlockDetails?.feedPrice]);

  // Update liveVestsToHiveRatio
  useEffect(() => {
    const newVestsToHiveRatio = getVestsToHiveRatio(headBlockCardData);
    if (newVestsToHiveRatio) {
      setLiveVestsToHiveRatio(newVestsToHiveRatio);
    }
  }, [
    headBlockCardData?.headBlockDetails?.totalVestingFundHive,
    headBlockCardData?.headBlockDetails?.totalVestingShares,
  ]);

  /*Block Chain Time Update*/
  useEffect(() => {
    if (!blockchainDate || !settings.liveData) return;
    const initialTimeDifference = Date.now() - blockchainDate;

    setLiveBlockchainTime(new Date(blockchainDate + initialTimeDifference));

    const intervalId = setInterval(() => {
      setLiveBlockchainTime((prevTime) => {
        if (!prevTime) return new Date(blockchainDate);
        const currentTime = Date.now();
        const updatedTime = new Date(
          blockchainDate + (currentTime - blockchainDate)
        );
        return updatedTime;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [blockchainDate, settings.liveData]);

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
  }, [blockDetails?.block_num, settings.liveData]);

  /*Feed Price and Vest/Hive Ratio Update*/
  useEffect(() => {
    if (!settings.liveData) return;
    const intervalId = setInterval(() => {
      // Update Feed Price only if it has changed
      setLiveFeedPrice((prevFeedPrice) => {
        const newFeedPrice =
          headBlockCardData?.headBlockDetails?.feedPrice ?? 0;
        if (prevFeedPrice !== newFeedPrice) {
          return newFeedPrice;
        }
        return prevFeedPrice;
      });

      // Update Vests to Hive Ratio only if it has changed
      setLiveVestsToHiveRatio((prevRatio) => {
        const newRatio = getVestsToHiveRatio(headBlockCardData);
        if (prevRatio !== newRatio) {
          return newRatio;
        }
        return prevRatio;
      });
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [settings.liveData, headBlockCardData]);

  return (
    <Card className="col-span-4 md:col-span-1" data-testid="head-block-card">
      <CardHeader className="flex justify-between items-end py-2 border-b ">
        {/* Blockchain Time and Live Data Toggle */}
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-end space-x-2 text-[12px]">
            <FontAwesomeIcon icon={faClock} size="xl" />
            <span className="font-semibold">Blockchain Time:</span>
            <span className="font-semibold text-right">
              {liveBlockchainTime
                ? `${liveBlockchainTime
                    .toISOString()
                    .replace("T", " ")
                    .slice(0, 19)} UTC`
                : blockchainTime ?? ""}
            </span>
          </div>

          <div className="mt-4">
            <Toggle
              disabled={isLiveDataToggleDisabled}
              checked={settings.liveData}
              onClick={() =>
                setSettings({
                  ...settings,
                  liveData: !settings.liveData,
                })
              }
              className="text-base"
              leftLabel="Live data"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Other Information*/}
        <div className="data-box">
          <div>
            <span>Feed Price:</span> {liveFeedPrice}
          </div>
          <div>
            <span>Vests To Hive Ratio:</span> {liveVestsToHiveRatio} VESTS
          </div>
        </div>
        {/* Block Information */}

        <div className="data-box relative flex flex-col w-full min-h-[160px]">
          <div className="flex flex-col w-full">
            <div className="text-lg border-b">Current Block</div>
            <div className="flex justify-between items-center mt-1 min-h-[35px] flex-wrap">
              {/* Block Number and Icon */}
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon icon={faCube} size="sm" />
                <Link
                  href={`/block/${blockDetails?.block_num}`}
                  data-testid="block-number-link"
                >
                  <span className="text-link text-lg font-semibold">
                    {liveBlockNumber
                      ? liveBlockNumber?.toLocaleString()
                      : blockDetails?.block_num
                      ? blockDetails?.block_num.toLocaleString()
                      : ""}
                  </span>
                </Link>
              </div>

              {/* Producer Info */}
              <div className="flex flex-wrap items-center space-x-1 min-w-[140px] min-h-10 transition-opacity duration-500 ease-in-out opacity-100">
                <p className="text-sm">By:</p>

                {blockDetails?.producer_account && (
                  <Link
                    className="flex items-center space-x-1 text-link"
                    href={`/@${blockDetails?.producer_account}`}
                    data-testid="current-witness-link"
                  >
                    <Image
                      className="rounded-full border-2 border-link"
                      src={getHiveAvatarUrl(blockDetails?.producer_account)}
                      alt="avatar"
                      width={30}
                      height={30}
                    />
                    <p className="text-link text-sm font-semibold">
                      {blockDetails?.producer_account}
                    </p>
                  </Link>
                )}
              </div>
            </div>
            {/* Time Difference */}
            <div className="flex text-xs font-semibold text-explorer-red w-[65px] min-w-[65px] justify-end">
              {timeDifferenceInSeconds} secs ago
            </div>
            {/* Operations and Transactions Info  */}
            <div className="flex flex-col justify-end space-y-2 pt-4 min-h-[40px]">
              <div className="flex items-center justify-end">
                <div className="min-w-[120px]">
                  <FontAwesomeIcon icon={faBoxes} size="xs" />
                  <span className="ml-1">Operations: </span>
                  <span className="font-semibold text-sm">
                    {opcount ? opcount : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <div className="min-w-[120px]">
                  <FontAwesomeIcon icon={faExchangeAlt} size="xs" />
                  <span className="ml-1">Trxs: </span>
                  <span className="font-semibold text-sm">
                    {transactionCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <HeadBlockPropertyCard
            parameters={fundAndSupplyParameters}
            header="Fund and Supply"
            isParamsHidden={hiddenPropertiesByCard.supplyCard}
            handleHideParams={handleHideSupplyParams}
            isLoading={isBlockCardLoading}
          />
          <HeadBlockPropertyCard
            parameters={hiveParameters}
            header="Hive Parameters"
            isParamsHidden={hiddenPropertiesByCard.hiveParamsCard}
            handleHideParams={handleHideHiveParams}
            isLoading={isBlockCardLoading}
          />
          <HeadBlockPropertyCard
            parameters={blockchainDates}
            header="Blockchain Dates"
            isParamsHidden={hiddenPropertiesByCard.timeCard}
            handleHideParams={handleHideBlockchainDates}
            isLoading={isBlockCardLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HeadBlockCard;
