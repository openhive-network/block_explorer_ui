import { useRouter } from "next/router";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { Loader2 } from "lucide-react";
import useOperation from "@/api/common/useOperation";

export default function LongOperation() {
  const router = useRouter();
  const { operationId } = router.query;
  const { operationData, operationDataIsFetched } = useOperation(
    Number(operationId)
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
