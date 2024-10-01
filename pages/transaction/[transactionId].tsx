import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

import Hive from "@/types/Hive";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import { convertTransactionResponseToTableOperations } from "@/lib/utils";
import { formatAndDelocalizeTime } from "@/utils/TimeUtils";
import { addSpacesAndCapitalizeFirst } from "@/utils/StringUtils";
import useTransactionData from "@/hooks/api/common/useTransactionData";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import PageNotFound from "@/components/PageNotFound";
import JSONView from "@/components/JSONView";
import OperationsTable from "@/components/OperationsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const displayTransactionData = (
  key: string,
  value: string | string[] | number | Date | Hive.Operation[] | Object
) => {
  if (value instanceof Array || value instanceof Object) {
    return null;
  } else {
    return (
      <tr
        key={key}
        className="border-b border-solid border-gray-700 max-w-full overflow-hidden flex flex-col md:table-row"
      >
        <td className="pl-2 py-1">{addSpacesAndCapitalizeFirst(key)}</td>
        <td
          align="right"
          className="pr-2"
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </td>
      </tr>
    );
  }
};

export default function Transaction() {
  const router = useRouter();
  const { settings } = useUserSettingsContext();
  const transactionId = router.query.transactionId as string;

  const { trxData, trxLoading, trxError } = useTransactionData(transactionId);

  const formattedTransaction = useOperationsFormatter(trxData) as
    | Hive.TransactionResponse
    | undefined;

  if (trxError) {
    return <PageNotFound message={`Transaction not found.`} />;
  }

  return (
    <>
      <Head>
        <title>{trxData?.transaction_id?.slice(0, 10)} - Hive Explorer</title>
      </Head>
      <div className="w-full max-w-5xl px-2 md:px-4 text-white flex flex-col gap-y-4">
        {!trxLoading && !!trxData && (
          <>
            <Card data-testid="transaction-header">
              <CardContent>
                <div
                  data-testid="transaction-header-hash-trx"
                  className="w-full text-center"
                >
                  Transaction: <span>{trxData?.transaction_id}</span>
                </div>
                <div className="w-full flex justify-evenly">
                  <div>
                    Block:
                    <Link
                      href={`/block/${trxData?.block_num}`}
                      className="text-explorer-turquoise"
                      data-testid="transaction-header-block-number"
                    >
                      {" " + trxData?.block_num}
                    </Link>
                  </div>
                  <div data-testid="transaction-header-date">
                    Date:
                    <span>
                      {" " + formatAndDelocalizeTime(trxData.timestamp)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {settings.rawJsonView || settings.prettyJsonView ? (
              <JSONView
                json={trxData.transaction_json}
                className="w-full md:w-[992px] m-auto py-2 px-4 bg-explorer-gray-light dark:bg-explorer-gray-dark rounded text-white text-xs break-words break-all"
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
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <table className="w-full text-xs">
                      <tbody>
                        {Object.keys(trxData.transaction_json).map((key) =>
                          displayTransactionData(
                            key,
                            trxData.transaction_json[
                              key as keyof Omit<
                                Hive.TransactionDetails,
                                "operations"
                              >
                            ]
                          )
                        )}
                        {Object.keys(trxData).map((key) =>
                          displayTransactionData(
                            key,
                            trxData[
                              key as keyof Omit<
                                Hive.TransactionResponse,
                                "transaction_json"
                              >
                            ]
                          )
                        )}
                      </tbody>
                    </table>
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
