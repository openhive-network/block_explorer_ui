import Hive from "@/types/Hive";
import BlockPageOperationCount from "./BlockPageOperationCount";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

interface BlockDetailsProps {
  operations?: Hive.OperationResponse[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
  blockDetails?: Hive.BlockDetails;
}

const BlockDetails: React.FC<BlockDetailsProps> = ({
  blockDetails,
  operations,
  virtualOperationLength,
  nonVirtualOperationLength,
}) => {
  return (
    <div className="flex flex-col w-full md:w-4/6 mx-auto mb-4 text-white rounded-[6px] shadow-xl border border-explorer-bg-start bg-explorer-dark-gray text-center">
      <div className="text-2xl font-semibold mt-2">
        Block {blockDetails?.block_num}
      </div>
      <div className="flex items-center gap-x-1 mt-3 px-8 md:px-4 w-full justify-center">
        <p>Produced at: </p>
        <p>{blockDetails?.created_at}</p>
        <p>by</p>
        <Link
          className="flex justif-between items-center"
          href={`/account/${blockDetails?.producer_account}`}
        >
          <span className="text-explorer-turquoise mx-2">
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
          <p className="text-base">Hash</p>
          {blockDetails?.hash}
        </p>
        <p>
          <p className="text-base">Prev hash</p>
          {blockDetails?.prev}
        </p>
      </div>
      <BlockPageOperationCount
        operations={operations}
        virtualOperationLength={virtualOperationLength}
        nonVirtualOperationLength={nonVirtualOperationLength}
      />
    </div>
  );
};

export default BlockDetails;
