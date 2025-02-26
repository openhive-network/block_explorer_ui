import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import Hive from "@/types/Hive";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import { convertTransactionResponseToTableOperations } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import useTransactionData from "@/hooks/api/common/useTransactionData";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import PageNotFound from "@/components/PageNotFound";
import JSONView from "@/components/JSONView";
import OperationsTable from "@/components/OperationsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import CopyButton from "@/components/ui/CopyButton";

const TransactionDetailItem = ({
  label,
  value,
  dataTestId,
  hasBorder,
}: {
  label: string;
  value: any;
  dataTestId?: string;
  hasBorder?: boolean;
}) => (
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
export default function Transaction() {
  const router = useRouter();
  const { settings } = useUserSettingsContext();
  const transactionId = router.query.transactionId as string;
  const [includeVirtual, setIncludeVirtual] = useState(false);

  const { trxData, trxLoading, trxError } = useTransactionData(
    transactionId,
    includeVirtual
  );
  const formattedTransaction = useOperationsFormatter(trxData) as
    | Hive.TransactionResponse
    | undefined;

  const handleToggleIncludeVirtual = () => {
    setIncludeVirtual(!includeVirtual);
  };

  if (trxError) {
    return <PageNotFound message={`Transaction not found.`} />;
  }

  return (
    <>
      <Head>
        <title>{trxData?.transaction_id?.slice(0, 10)} - Hive Explorer</title>
      </Head>
      <div className="w-full px-2 flex flex-col gap-y-4">
        {!trxLoading && !!trxData && (
          <>
            <Card data-testid="transaction-header">
              <CardHeader className="flex items-center py-2 ">
                <CardTitle className="text-xl font-semibold text-left flex justify-between items-center">
                  Transaction Details
                  <div className="flex items-center space-x-2">
                    <span className="text-sm mr-1">
                      Include Virtual Operations:
                    </span>
                    <Toggle
                      checked={includeVirtual}
                      onClick={handleToggleIncludeVirtual}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 py-2">
                <div
                  data-testid="transaction-header-hash-trx"
                  className="w-full text-left text-sm"
                >
                  <span className="font-semibold">Transaction ID:</span>{" "}
                  {trxData?.transaction_id} 
                  <CopyButton
                    text={trxData?.transaction_id}
                    tooltipText="Copy transaction ID"
                  />                  
                </div>
                  <div className="text-left text-sm">
                    <span className="font-semibold">Block:</span>{" "}
                    <Link
                      href={`/block/${trxData?.block_num}`}
                      data-testid="transaction-header-block-number"
                    >
                      <span className="text-link">
                        {trxData?.block_num.toLocaleString()}
                      </span>                      
                    </Link>
                    <CopyButton
                        text={trxData?.block_num}
                        tooltipText="Copy block hash"
                      />
                  </div>
                <div
                    data-testid="transaction-header-date"
                    className="text-left text-sm"
                  >
                    <span className="font-semibold">Date:</span>{" "}
                    <span>{formatAndDelocalizeTime(trxData.timestamp)}</span>
                  </div>
              </CardContent>
            </Card>
            {settings.rawJsonView || settings.prettyJsonView ? (
              <JSONView
                json={trxData.transaction_json}
                className="w-full m-auto py-2 px-4 bg-theme rounded text-xs break-words break-all"
                isPrettyView={settings.prettyJsonView}
              />
            ) : (
              <>
                {formattedTransaction?.transaction_json?.operations && (
                  <OperationsTable
                    operations={convertTransactionResponseToTableOperations(
                      formattedTransaction
                    )}
                    unformattedOperations={convertTransactionResponseToTableOperations(
                      trxData
                    )}
                  />
                )}
                <Card data-testid="transaction-details">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <CardTitle className="text-lg font-semibold text-left">
                      Transaction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0 px-4 py-2">
                    <TransactionDetailItem
                      label="Ref Block Num"
                      value={trxData.transaction_json.ref_block_num}
                      dataTestId="ref-block-num"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label="Ref Block Prefix"
                      value={trxData.transaction_json.ref_block_prefix}
                      dataTestId="ref-block-prefix"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label="Expiration"
                      value={formatAndDelocalizeTime(
                        trxData.transaction_json.expiration
                      )}
                      dataTestId="expiration"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label="Block Number"
                      value={trxData.block_num}
                      dataTestId="block-number"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label="Transaction Number"
                      value={trxData.transaction_num}
                      dataTestId="transaction-number"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label="Timestamp"
                      value={trxData.timestamp} // Format the date here
                      dataTestId="transaction-expiration"
                      hasBorder
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
