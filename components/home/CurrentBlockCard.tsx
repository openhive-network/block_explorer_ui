import React, { useState, useEffect } from "react";
import { ArrowRightLeft, Box, Boxes } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Hive from "@/types/Hive";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import TimeAgo from "timeago-react";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";

interface CurrentBlockCardProps {
  blockDetails?: Hive.BlockDetails | null;
  transactionCount?: number;
  opcount?: number;
  liveBlockNumber?: number | null;
  timeDifferenceInSeconds?: number | null;
  isLive?:boolean;
}

interface Producer {
  href: string;
  avatarUrl: string;
  name: string;
}

const trimBlockNumber = (blockNum: number | undefined) => {
  if (!blockNum) return;

  return blockNum.toLocaleString();
};

const CurrentBlockCard: React.FC<CurrentBlockCardProps> = ({
  blockDetails,
  transactionCount,
  opcount,
  liveBlockNumber,
  timeDifferenceInSeconds,
  isLive,
}) => {
  const [producer, setProducer] = useState<Producer | null>(null);
  useEffect(() => {
    if (blockDetails?.producer_account) {
      const href = `/@${blockDetails?.producer_account}`;
      const avatarUrl = getHiveAvatarUrl(blockDetails?.producer_account);
      const name = blockDetails?.producer_account;
      setProducer({ href, avatarUrl, name });
    }
  }, [blockDetails?.producer_account]);
  return (
    <div className="data-box relative flex flex-col w-full min-h-[160px]">
      <div className="flex flex-col w-full">
        <div className="text-lg border-b">Current Block</div>
        <div className="flex justify-between items-center mt-1 min-h-[35px] flex-wrap">
          {/* Block Number and Icon */}
          <div className="flex items-center space-x-1">
            <Box size={15} />
            <Link
              href={`/block/${liveBlockNumber ?? blockDetails?.block_num}`}
              data-testid="block-number-link"
            >
              <span className="text-link text-lg font-semibold">
                {liveBlockNumber
                  ? trimBlockNumber(liveBlockNumber)
                  : trimBlockNumber(blockDetails?.block_num)}
              </span>
            </Link>
          </div>

          {/* Producer Info */}
          <div className="flex flex-wrap items-center space-x-1 min-w-[140px] min-h-10 transition-opacity duration-500 ease-in-out opacity-100">
            <p className="text-sm">By:</p>
            {producer && (
              <Link
                className="flex items-center space-x-1 text-link"
                href={producer.href}
                data-testid="current-witness-link"
              >
                <Image
                  className="rounded-full border-2 border-link"
                  src={producer.avatarUrl}
                  alt="avatar"
                  width={30}
                  height={30}
                />
                <p className="text-link text-sm font-semibold">
                  {producer.name}
                </p>
              </Link>
            )}
          </div>
        </div>
        {/* Time Difference */}
        {isLive ? (
          <div className="w-[65px] min-w-[65px] flex text-xs font-semibold text-explorer-red justify-end ">
            {timeDifferenceInSeconds} secs ago
          </div>
        ) : (
          <TimeAgo
            datetime={
              new Date(formatAndDelocalizeTime(blockDetails?.created_at))
            }
            className="text-explorer-red w-[120px] min-w-[120px]flex text-xs font-semibold justify-end "
          />
        )}
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
              <span className="font-semibold text-sm">{transactionCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentBlockCard;
