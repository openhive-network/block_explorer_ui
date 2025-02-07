import React from "react";
import Hive from "@/types/Hive";


import Image from "next/image";
import Link from "next/link";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";

import { ArrowRightLeft, Box, Boxes } from "lucide-react";

interface CurrentBlockCardProps {
  blockDetails?: Hive.BlockDetails;
  transactionCount?: number;
  opcount?: number;
  liveBlockNumber?: number | null;
  timeDifferenceInSeconds ?:number | null;
}

const CurrentBlockCard: React.FC<CurrentBlockCardProps> = ({
  blockDetails,
  transactionCount,
  opcount,
  liveBlockNumber,
  timeDifferenceInSeconds,
}) => {

  return (
   
    <div className="data-box relative flex flex-col w-full min-h-[160px]">
    <div className="flex flex-col w-full">
      <div className="text-lg border-b">Current Block</div>
      <div className="flex justify-between items-center mt-1 min-h-[35px] flex-wrap">
        {/* Block Number and Icon */}
        <div className="flex items-center space-x-1">
          <Box size={15}/>
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
          <div className="min-w-[120px] flex items-center">
            <Boxes size={14} />
            <span className="mx-1">Operations:</span>
            <span className="font-semibold text-sm">
              {opcount ? opcount : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="min-w-[120px] flex items-center">
            <ArrowRightLeft size={14} />
            <span className="mx-1">Trxs:</span>
            <span className="font-semibold text-sm">
              {transactionCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CurrentBlockCard;
