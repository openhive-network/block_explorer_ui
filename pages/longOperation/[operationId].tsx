import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { scrollTo } from "@/utils/UI";
import PageNotFound from "@/components/PageNotFound";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";

export default function LongOperation() {
  const router = useRouter();
  const { operationId } = router.query;

  const { data: operation, isFetched } =
  useQuery({
    queryKey: [`operation-${operationId}`],
    queryFn: () => fetchingService.getOperation(Number(operationId)),
    refetchOnWindowFocus: false,
  });



  return (

    <div
      className="w-full h-full text-white flex justify-center items-center px-4 md:p-0 md:w-4/5 flex-col gap-y-2"
      id="block-page-top"
    >
      {(operation && isFetched && operationId ) ? (
        <DetailedOperationCard
          operation={operation.operation}
          operationId={operation.operation_id}
          date={new Date(operation.timestamp)}
          blockNumber={operation.block_num}
          transactionId={operation.trx_id}
          key={operation.timestamp}
          isShortened={operation.is_modified}
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
