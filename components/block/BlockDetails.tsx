import Hive from "@/types/Hive";
import BlockPageOperationCount from "./BlockPageOperationCount";
import Link from "next/link";
import Image from "next/image";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import CopyButton from "../ui/CopyButton";

interface BlockDetailsProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number;
  nonVirtualOperationLength: number;
  blockDetails?: Hive.BlockDetails;
  enableRawVirtualOperations: boolean;
  handleEnableVirtualOperations: () => void;
  trxOperationsLength : number | undefined;
}

const BlockDetails: React.FC<BlockDetailsProps> = ({
  virtualOperationsTypesCounters,
  nonVirtualOperationsTypesCounters,
  blockDetails,
  virtualOperationLength,
  nonVirtualOperationLength,
  enableRawVirtualOperations,
  handleEnableVirtualOperations,
  trxOperationsLength,
}) => {
  if (!blockDetails) return;
  interface BlockDetailItemProps {
    label: string;
    value: React.ReactNode; // Allow the value to be any React node
    dataTestId?: string;
    hasBorder?: boolean;
  }
  
  const BlockDetailItem: React.FC<BlockDetailItemProps> = ({
    label,
    value,
    dataTestId,
    hasBorder,
  }) => {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-[360px_1fr] items-center py-1.5",
          hasBorder && "border-b"
        )}
      >
        <div
          className="font-medium md:text-left pr-2 md:pr-0"
          data-testid={`${dataTestId}-label`}
        >
          {label}:
        </div>
        <div className="text-sm" data-testid={dataTestId}>
          {value} 
        </div>
      </div>
    );
  };
  

  return (
    <Card
      className="flex flex-col w-full md:max-w-screen-2xl m-auto"
      data-testid="block-page-block-details"
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle data-testid="block-number" className="text-lg font-semibold text-left">
          Block {blockDetails.block_num.toLocaleString()}   
          <CopyButton
            text={blockDetails.block_num}
            tooltipText="Copy block hash"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 px-4 py-2">

        <BlockDetailItem
          label="Produced at"
          value={formatAndDelocalizeTime(blockDetails.created_at)}
          dataTestId="produced-at"
          hasBorder
        />

        <BlockDetailItem
          label="Produced by"
          value={
            <Link
              className="flex items-center justify-start gap-2"
              data-testid="account-name"
              href={`/@${blockDetails.producer_account}`}
            >
              <span
                className="text-link"
                data-testid="block-producer-name"
              >
                {blockDetails.producer_account}
              </span>
              <Image
                className="rounded-full border-2 border-link"
                src={getHiveAvatarUrl(blockDetails.producer_account)}
                alt="avatar"
                width={32}
                height={32}
              />
            </Link>
          }
          dataTestId="produced-by"
          hasBorder
        />


        <BlockDetailItem
          label="Hash"
          value={
            <>
              {blockDetails.hash}
              <CopyButton
                text={blockDetails.hash || ""}
                tooltipText="Copy block hash"
              />
            </>
          }
          dataTestId="hash"
          hasBorder
        />

        <BlockDetailItem
          label="Previous Hash"
          value={
            <>
              {blockDetails.prev}
              <CopyButton
                text={blockDetails.prev || ""}
                tooltipText="Copy prev block hash"
              />
            </>
          }
          dataTestId="prev-hash"
          hasBorder
        />

        <BlockDetailItem
          label="Number of Transactions"
          value={trxOperationsLength}
          dataTestId="trx-length"
          hasBorder
        />
        <BlockPageOperationCount
          virtualOperationLength={virtualOperationLength}
          nonVirtualOperationLength={nonVirtualOperationLength}
          virtualOperationsTypesCounters={virtualOperationsTypesCounters}
          nonVirtualOperationsTypesCounters={nonVirtualOperationsTypesCounters}
          enableRawVirtualOperations={enableRawVirtualOperations}
          handleEnableVirtualOperations={handleEnableVirtualOperations}
        />
      </CardContent>
    </Card>
  );
};

export default BlockDetails;
