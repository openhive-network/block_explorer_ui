import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";

import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  siteConfig,
  absoluteBaseUrl,
  canonicalUrl,
  defaultOgImage,
  pageTitle,
  clamp,
  notFoundMeta,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import {
  normalizeTransactionId,
  queryStringOf,
  shortHex,
} from "@/utils/seo/entityIds";
import { seoText } from "@/utils/seo/seoStrings";
import Hive from "@/types/Hive";
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
import PageTitle from "@/components/PageTitle";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

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
export default function Transaction({ meta }: { meta: SeoMeta }) {
  const router = useRouter();
  const { t } = useI18n();
  const { settings } = useSettings();
  const transactionId = router.query.transactionId as string;
  const { hiveChain } = useHiveChainContext();
  const [includeVirtual, setIncludeVirtual] = useState(false);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);

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
  useEffect(() => {
    try {
      if (!hiveChain || !trxData) return;
      let hex: string | null = null;
      if (typeof hiveChain.convertTransactionToBinaryForm === "function") {
        hex = hiveChain.convertTransactionToBinaryForm(
          trxData.transaction_json as any
        );
      }
      if (hex) {
        const buf = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2)
          buf[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        setBytes(buf);
      }
    } catch (err) {
      console.error("Binary conversion failed:", err);
    }
  }, [hiveChain, trxData]);

  if (trxError) {
    return <PageNotFound message={t("transactionPage.transactionNotFound")} />;
  }

  const transactionSize = bytes?.length ? `${bytes?.length ?? 0} bytes` : "-";

  return (
    <>
      <Seo meta={meta} />
      <div className="page-container flex flex-col gap-y-4">
        {!trxLoading && !!trxData && (
          <>
            <Card data-testid="transaction-header">
              <PageTitle
                titleKey="pageTitle.transactionDetails"
                className="py-4"
              />
              <CardHeader className="flex items-center py-2 ">
                <CardTitle>
                  <div className="flex space-x-2">
                    <span className="text-sm">
                      {t("transactionPage.includeVirtualOperations")}:
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
                  <span className="font-semibold">
                    {t("transactionPage.transactionId")}:
                  </span>{" "}
                  {trxData?.transaction_id}
                  <CopyButton
                    text={trxData?.transaction_id}
                    tooltipText={t("common.copyTransactionId")}
                  />
                </div>
                <div className="text-left text-sm">
                  <span className="font-semibold">{t("common.block")}:</span>{" "}
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
                    tooltipText={t("common.copyBlockNumber")}
                  />
                </div>
                <div
                  data-testid="transaction-header-date"
                  className="text-left text-sm"
                >
                  <span className="font-semibold">
                    {t("transactionPage.date")}:
                  </span>{" "}
                  <span>{formatAndDelocalizeTime(trxData.timestamp)}</span>
                </div>
                <div
                  data-testid="transaction-header-date"
                  className="text-left text-sm"
                >
                  <span className="font-semibold">
                    {t("transactionPage.transactionSize")}:
                  </span>{" "}
                  <span>{transactionSize}</span>
                </div>
              </CardContent>
            </Card>

            {settings.rawJsonView || settings.prettyJsonView ? (
              <JSONView
                json={{
                  ...trxData.transaction_json,
                  transactionSize,
                }}
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
                    referrer={`${trxData?.transaction_id?.slice(0, 10)}_${t(
                      "transactionPage.transactionDetailsRefferer"
                    )}`}
                  />
                )}
                <Card data-testid="transaction-details">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <CardTitle className="text-lg font-semibold text-left">
                      {t("transactionPage.transactionDetails")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0 px-4 py-2">
                    <TransactionDetailItem
                      label={t("transactionPage.refBlockNum")}
                      value={trxData.transaction_json.ref_block_num}
                      dataTestId="ref-block-num"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("transactionPage.refBlockPrefix")}
                      value={trxData.transaction_json.ref_block_prefix}
                      dataTestId="ref-block-prefix"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("transactionPage.expiration")}
                      value={formatAndDelocalizeTime(
                        trxData.transaction_json.expiration
                      )}
                      dataTestId="expiration"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("blockPageNavigation.blockNumber")}
                      value={trxData.block_num}
                      dataTestId="block-number"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("transactionPage.transactionNumber")}
                      value={trxData.transaction_num}
                      dataTestId="transaction-number"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("commentPermlinkResultTable.timestamp")}
                      value={trxData.timestamp}
                      dataTestId="transaction-expiration"
                      hasBorder
                    />
                    <TransactionDetailItem
                      label={t("transactionPage.transactionSize")}
                      value={transactionSize}
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

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res, params, resolvedUrl }) => {
  const raw = Array.isArray(params?.transactionId)
    ? params?.transactionId[0]
    : params?.transactionId;
  const { normalized, kind } = normalizeTransactionId(String(raw || "").trim());

  // 404 via statusCode, not `notFound`: app/not-found.tsx would win and lose the localized UI.
  if (kind === "invalid") {
    res.statusCode = 404;
    return { props: { meta: notFoundMeta(seoText("seo.notFound.title")) } };
  }

  // Hex case does not change the transaction, so only one spelling stays reachable.
  if (normalized !== raw) {
    return {
      redirect: {
        destination: `/tx/${normalized}${queryStringOf(resolvedUrl)}`,
        permanent: true,
      },
    };
  }

  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const shortTx = shortHex(normalized);
  const canonical = canonicalUrl(req, `/tx/${normalized}`);
  const description = clamp(
    seoText("seo.tx.description", { short: shortTx, site: siteConfig.name })
  );
  const title = pageTitle(seoText("seo.tx.title", { short: shortTx }));
  return {
    props: {
      meta: {
        title,
        description,
        canonical,
        ogType: "article",
        ogImage: defaultOgImage(absoluteBaseUrl(req)),
        ogImageAlt: title,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: seoText("seo.tx.datasetName", { short: shortTx }),
          description,
          url: canonical,
        },
      },
    },
  };
};
