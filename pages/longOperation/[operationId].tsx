import { useRouter } from "next/router";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { Loader2 } from "lucide-react";
import useOperation from "@/api/common/useOperation";

export default function LongOperation() {
  const router = useRouter();
  const { operationId } = router.query;
  const {operationData, operationDataIsFetched} = useOperation(Number(operationId));



  return (

    <div
      className="w-full h-full text-white flex justify-center items-center px-4 md:p-0 md:w-4/5 flex-col gap-y-2"
      id="block-page-top"
    >
      {(operationData?.operation && operationDataIsFetched && operationId ) ? (
        <DetailedOperationCard
          operation={operationData.operation}
          operationId={operationData.operation_id}
          date={new Date(operationData.timestamp)}
          blockNumber={operationData.block_num}
          transactionId={operationData.trx_id}
          key={operationData.timestamp}
          isShortened={operationData.is_modified}
          forceStyle="raw-json"
        />
      ) : (
        <div className="text-black flex justify-center flex-col items-center">
          <Loader2 className="animate-spin mt-1 h-16 w-16 ml-3 ..." />
          <p>Your operation is loading. It may take some time.</p>
        </div>
      )
      }
    </div>
  );
}
