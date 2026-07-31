import type { GetServerSideProps } from "next";
import { SeoMeta, noindexMeta, SEO_LIST_CACHE_CONTROL } from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";

import useOperation from "@/hooks/api/common/useOperation";
import DetailedOperationCard from "@/components/DetailedOperationCard";

export default function LongOperation() {
  const router = useRouter();
  const { operationId } = router.query;
  const { operationData, operationDataIsFetched } = useOperation(
    String(operationId)
  );

  return (
    <div
      className="w-full h-full text-white flex justify-center items-center px-4 md:p-0 md:w-4/5 flex-col gap-y-2"
      id="block-page-top"
    >
      {operationData?.op && operationDataIsFetched && operationId ? (
        <DetailedOperationCard
          operation={operationData.op}
          operationId={operationData.operation_id}
          blockNumber={operationData.block}
          transactionId={operationData.trx_id}
          key={operationData.timestamp}
          forceStyle="raw-json"
        />
      ) : (
        <div className="text-black flex justify-center flex-col items-center">
          <Loader2 className="animate-spin mt-1 h-16 w-16 ml-3 dark:text-white ..." />
          <p>Your operation is loading. It may take some time.</p>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res, params }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  const raw = Array.isArray(params?.operationId)
    ? params?.operationId[0]
    : params?.operationId;
  return {
    props: {
      meta: noindexMeta(
        req,
        `/longOperation/${encodeURIComponent(String(raw || ""))}`,
        seoText("seo.longOperation.title"),
        seoText("seo.longOperation.description")
      ),
    },
  };
};
