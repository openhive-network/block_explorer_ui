import Hive from "@/types/Hive";
import BlockPageOperationCount from "./BlockPageOperationCount";
import Link from "next/link";
import Explorer from "@/types/Explorer";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import CopyButton from "../ui/CopyButton";
import { useI18n } from "@/i18n/i18n";
import HiveAvatar from "@/components/ui/HiveAvatar";

interface BlockDetailsProps {
  virtualOperationsTypesCounters?: Explorer.OperationCounter[];
  nonVirtualOperationsTypesCounters?: Explorer.OperationCounter[];
  virtualOperationLength: number | undefined;
  nonVirtualOperationLength: number | undefined;
  blockDetails?: Hive.BlockDetails;
  enableRawVirtualOperations: boolean;
  handleEnableVirtualOperations: () => void;
  trxOperationsLength: number | undefined;
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
  const { t, dir } = useI18n();
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
          "flex flex-col md:flex-row items-start md:items-center py-1.5",
          dir === "rtl" && "md:text-left",
          hasBorder && "border-b"
        )}
      >
        <div
          className="font-medium md:w-[360px] md:flex-shrink-0 text-start"
          data-testid={`${dataTestId}-label`}
        >
          {label}:
        </div>
        <div
          className="text-sm w-full flex justify-start"
          data-testid={dataTestId}
        >
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
        <CardTitle
          data-testid="block-number"
          className="text-lg font-semibold text-start"
        >
          <div
            className={cn(
              "flex items-center gap-2",
              dir === "rtl" && "text-right"
            )}
          >
            <span>
              {t("common.block")} {blockDetails.block_num.toLocaleString()}
            </span>
            <CopyButton
              text={blockDetails.block_num}
              tooltipText={t("common.copyBlockNumber")}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 px-4 py-2">
        <BlockDetailItem
          label={t("blockDetails.producedAt")}
          value={formatAndDelocalizeTime(blockDetails.created_at)}
          dataTestId="produced-at"
          hasBorder
        />

        <BlockDetailItem
          label={t("blockDetails.producedBy")}
          value={
            <Link
              className={cn(
                "flex items-center justify-start gap-2",
                dir === "rtl" && "flex-row-reverse"
              )}
              data-testid="account-name"
              href={`/@${blockDetails.producer_account}`}
            >
              <span className="text-link" data-testid="block-producer-name">
                {blockDetails.producer_account}
              </span>
              <HiveAvatar
                accountName={blockDetails.producer_account}
                size={32}
                alt="avatar"
                className="rounded-full border-2 border-link"
              />
            </Link>
          }
          dataTestId="produced-by"
          hasBorder
        />

        <BlockDetailItem
          label={t("blockDetails.hash")}
          value={
            <div
              className={cn(
                "flex items-center gap-2",
                dir === "rtl" && "text-right"
              )}
            >
              <span>{blockDetails.hash}</span>
              <CopyButton
                text={blockDetails.hash || ""}
                tooltipText={t("blockDetails.copyBlockHash")}
              />
            </div>
          }
          dataTestId="hash"
          hasBorder
        />

        <BlockDetailItem
          label={t("blockDetails.previousHash")}
          value={
            <div
              className={cn(
                "flex items-center gap-2",
                dir === "rtl" && "ftext-right"
              )}
            >
              <span>{blockDetails.prev}</span>
              <CopyButton
                text={blockDetails.prev || ""}
                tooltipText={t("blockDetails.copyPrevBlockHash")}
              />
            </div>
          }
          dataTestId="prev-hash"
          hasBorder
        />

        <BlockDetailItem
          label={t("blockDetails.numberOfTransactions")}
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
