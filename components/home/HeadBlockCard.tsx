import { useState } from "react";
import { Loader2 } from "lucide-react";
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
  const [hiddenPropertiesByCard, setHiddenPropertiesByCard] = useState<any>({
    timeCard: true,
    supplyCard: true,
    hiveParamsCard: true,
  });
  const { settings, setSettings } = useUserSettingsContext();

  const vestsToHiveRatio = getVestsToHiveRatio(headBlockCardData);

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

  return (
    <Card
      className="col-span-4 md:col-span-1"
      data-testid="head-block-card"
    >
      <CardHeader>
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
        <div className="text-explorer-turquoise text-2xl text-left">
          <Link
            className="text-link"
            href={`/block/${blockDetails?.block_num}`}
            data-testid="block-number-link"
          >
            Block: {blockDetails?.block_num?.toLocaleString()}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div className="my-2">Operations per block : {opcount} </div>
        {blockDetails?.producer_account && (
          <div className="flex">
            <p>Current witness : </p>
            <Link
              className="flex justify-between items-center min-h-[40px]"
              href={`/@${blockDetails?.producer_account}`}
              data-testid="current-witness-link"
            >
              <div className="flex">
                <p
                  className="text-link mx-2"
                  data-testid="current-witness-name"
                >
                  {blockDetails?.producer_account}
                </p>
                <div className="min-w-[30px]">
                  <Image
                    className="rounded-full border-2 border-link"
                    src={getHiveAvatarUrl(blockDetails?.producer_account)}
                    alt="avatar"
                    width={40}
                    height={40}
                  />
                </div>
              </div>
            </Link>
          </div>
        )}
        <div className="my-2">
          Feed Price : {headBlockCardData?.headBlockDetails.feedPrice ?? ""}
        </div>
        <div className="my-2">
          Vests To Hive Ratio : {vestsToHiveRatio} VESTS
        </div>
        <div>
          Blockchain Time :{" "}
          {!!headBlockCardData?.headBlockDetails.blockchainTime &&
            headBlockCardData?.headBlockDetails.blockchainTime}
        </div>
        <div>
          <div className="text-center my-4 text-xl">Properties</div>

          {!headBlockCardData || !headBlockCardData.headBlockDetails ? (
            <div className="flex justify-center m-2">
              <Loader2 className="animate-spin mt-1 text-white h-12 w-12 ml-3 ..." />
            </div>
          ) : (
            <>
              <HeadBlockPropertyCard
                parameters={fundAndSupplyParameters}
                header="Fund and Supply"
                isParamsHidden={hiddenPropertiesByCard.supplyCard}
                handleHideParams={handleHideSupplyParams}
              />
              <HeadBlockPropertyCard
                parameters={hiveParameters}
                header="Hive Parameters"
                isParamsHidden={hiddenPropertiesByCard.hiveParamsCard}
                handleHideParams={handleHideHiveParams}
              />
              <HeadBlockPropertyCard
                parameters={blockchainDates}
                header="Blockchain Dates"
                isParamsHidden={hiddenPropertiesByCard.timeCard}
                handleHideParams={handleHideBlockchainDates}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeadBlockCard;