import { useState } from "react";
import Explorer from "@/types/Explorer";
import Image from "next/image";
import Link from "next/link";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Hive from "@/types/Hive";
import { AlertCircle, Loader2 } from "lucide-react";
import HeadBlockPropertyCard from "./HeadBlockPropertyCard";
import {
  fundAndSupplyParameters,
  hiveParameters,
  blockchainDates,
} from "./headBlockParameters";
import { convertUTCDateToLocalDate } from "@/utils/UTCDateToLocalTime";

interface HeadBlockCardProps {
  headBlockCardData?: Explorer.HeadBlockCardData | any;
  blockDetails?: Hive.BlockDetails;
  transactionCount?: number;
}

const HeadBlockCard: React.FC<HeadBlockCardProps> = ({
  headBlockCardData,
  transactionCount,
  blockDetails,
}) => {
  const [hiddenPropertiesByCard, setHiddenPropertiesByCard] = useState<any>({
    timeCard: true,
    supplyCard: true,
    hiveParamsCard: true,
  });

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

  return (
    <div className='col-start-1 col-span-6 md:col-span-1 bg-explorer-dark-gray p-2 rounded md:mx-6 h-fit' data-testid="head-block-card">
      {headBlockCardData?.headBlockNumber &&
        blockDetails?.block_num &&
        headBlockCardData?.headBlockNumber !== blockDetails?.block_num && (
          <div className="flex gap-x-2 text-explorer-orange">
            <AlertCircle />
            <p>Data might not be synchronized</p>
          </div>
        )}
      <div className="text-explorer-turquoise text-2xl my-2">
        <Link href={`/block/${blockDetails?.block_num}`} data-testid="block-number-link">
          Block: {blockDetails?.block_num}
        </Link>
      </div>
      <div className="my-2">
        Operations per block: {!!transactionCount && transactionCount}
      </div>
      <div>
        <Link
          className="flex justif-between items-center"
          href={`/account/${blockDetails?.producer_account}`}
          data-testid="current-witness-link"
        >
          <span>Current witness: </span>{" "}
          <span className="text-explorer-turquoise mx-2" data-testid="current-witness-name">
            {blockDetails?.producer_account}
          </span>
          <Image
            className="rounded-full border-2 border-explorer-turquoise"
            src={getHiveAvatarUrl(blockDetails?.producer_account)}
            alt="avatar"
            width={40}
            height={40}
          />
        </Link>
      </div>
      <div className="my-2">
        Feed Price : {headBlockCardData?.headBlockDetails.feedPrice ?? ""}
      </div>
      <div>
        Blockchain Time :{" "}
        {convertUTCDateToLocalDate(
          headBlockCardData?.headBlockDetails.blockchainTime
        )}
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
    </div>
  );
};

export default HeadBlockCard;
