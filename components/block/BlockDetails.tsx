import Hive from "@/types/Hive";
import BlockPageOperationCount from "./BlockPageOperationCount";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import moment from "moment";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

interface BlockDetailsProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
  blockDetails?: Hive.BlockDetails;
}

const BlockDetails: React.FC<BlockDetailsProps> = ({
  virtualOperationsTypesCounters,
  nonVirtualOperationsTypesCounters,
  blockDetails,
  virtualOperationLength,
  nonVirtualOperationLength,
}) => {
  return (
    <div
      className="flex flex-col w-full md:w-4/6 mx-auto mb-4 text-white rounded shadow-xl border border-explorer-bg-start bg-explorer-dark-gray text-center"
      data-testid="block-page-block-details"
    >
      <div className="text-2xl font-semibold mt-2" data-testid="block-number">
        Block {blockDetails?.block_num?.toLocaleString()}
      </div>
      <div
        className="flex items-center gap-x-1 mt-3 px-8 md:px-4 w-full justify-center"
        data-testid="produced-data"
      >
        <p>Produced at: </p>
        <p>
          {formatAndDelocalizeTime(blockDetails?.created_at)}
        </p>
        <p>by</p>
        <Link
          className="flex justif-between items-center"
          data-testid="account-name"
          href={`/@${blockDetails?.producer_account}`}
        >
          <span
            className="text-explorer-turquoise mx-2"
            data-testid="block-producer-name"
          >
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
      <div className="flex items-center gap-x-4 mt-3 px-8 md:px-4 w-full justify-center flex-wrap text-sm md:text-base">
        <p>
          <span data-testid="hash" className="text-base">Hash: </span>
          {blockDetails?.hash}
        </p>
        <p>
          <span data-testid="prev-hash" className="text-base">Prev hash: </span>
          {blockDetails?.prev}
        </p>
      </div>
      <BlockPageOperationCount
        virtualOperationLength={virtualOperationLength}
        nonVirtualOperationLength={nonVirtualOperationLength}
        virtualOperationsTypesCounters={virtualOperationsTypesCounters}
        nonVirtualOperationsTypesCounters={nonVirtualOperationsTypesCounters}
      />
    </div>
  );
};

export default BlockDetails;
