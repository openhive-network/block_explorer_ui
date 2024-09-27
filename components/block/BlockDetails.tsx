import Hive from "@/types/Hive";
import BlockPageOperationCount from "./BlockPageOperationCount";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import moment from "moment";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    <Card
      className="flex flex-col w-full md:max-w-screen-2xl m-auto"
      data-testid="block-page-block-details"
    >
      <CardHeader>
        <CardTitle data-testid="block-number">
          Block {blockDetails?.block_num?.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center gap-x-1 mt-3 px-8 w-full justify-center flex-wrap gap-y-2"
          data-testid="produced-data"
        >
          <p>Produced at: </p>
          <p>{formatAndDelocalizeTime(blockDetails?.created_at)}</p>
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
            <span data-testid="hash" className="text-base">
              Hash:{" "}
            </span>
            {blockDetails?.hash.slice(2)}
          </p>
          <p>
            <span data-testid="prev-hash" className="text-base">
              Prev hash:{" "}
            </span>
            {blockDetails?.prev.slice(2)}
          </p>
        </div>
        <BlockPageOperationCount
          virtualOperationLength={virtualOperationLength}
          nonVirtualOperationLength={nonVirtualOperationLength}
          virtualOperationsTypesCounters={virtualOperationsTypesCounters}
          nonVirtualOperationsTypesCounters={nonVirtualOperationsTypesCounters}
        />
      </CardContent>
    </Card>
  );
};

export default BlockDetails;
