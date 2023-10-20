import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { scrollTo } from "@/utils/UI";
import PageNotFound from "@/components/PageNotFound";

export default function Block() {
  const router = useRouter();
  const virtualOpsRef = useRef(null);
  const topRef = useRef(null);

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(blockIdToNum);
  const [blockFilters, setBlockFilters] = useState<number[]>([]);

  const { data: blockOperations }: UseQueryResult<Hive.OpsByBlockResponse[]> =
    useQuery({
      queryKey: [`block_operations`, blockNumber, blockFilters],
      queryFn: () => fetchingService.getOpsByBlock(blockNumber, blockFilters),
      refetchOnWindowFocus: false,
    });

  const { data: operationTypes }: UseQueryResult<Hive.OperationPattern[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
      refetchOnWindowFocus: false,
    });

  const blockError = (blockOperations as { [key: string]: any })?.code || null;

  useEffect(() => {
    if (!blockIdToNum) return;
    setBlockNumber(blockIdToNum);
  }, [blockIdToNum]);

  const virtualOperations =
    (!blockError &&
      blockOperations?.filter((operation) => operation.virtual_op)) ||
    [];

  const nonVirtualOperations =
    (!blockError &&
      blockOperations?.filter((operation) => !operation.virtual_op)) ||
    [];

  const handleGoToBlock = (blockNumber: string) => {
    router.push({
      pathname: "[blockId]",
      query: { blockId: blockNumber },
    });
  };

  if (!blockOperations || !operationTypes) {
    return "Loading ...";
  }

  if (!blockOperations.length || !operationTypes.length || blockError) {
    return (
      <PageNotFound
        message={
          blockError
            ? `Error code: ${blockError}`
            : `Block ${blockId} couldn't be found.`
        }
      />
    );
  }

  return (
    <div className="w-full h-full" ref={topRef}>
      <BlockPageNavigation
        blockNumber={blockNumber}
        goToBlock={handleGoToBlock}
        timeStamp={new Date(blockOperations[0].timestamp + "Z")}
        virtualOperationLength={virtualOperations?.length ?? 0}
        nonVirtualOperationLength={nonVirtualOperations?.length ?? 0}
        setFilters={setBlockFilters}
        operationTypes={operationTypes}
        selectedOperationIds={blockFilters}
        onTopClick={() => scrollTo(topRef)}
        onVirtualOpsClick={() => scrollTo(virtualOpsRef)}
      />
      <section className="md:px-10 flex items-center justify-center text-white">
        <div className="w-full p-4 md:p-0 md:w-4/5 flex flex-col gap-y-2 md:gap-y-6">
          {nonVirtualOperations?.map((operation, index) => (
            <DetailedOperationCard
              operation={operation.operation}
              date={new Date(operation.timestamp)}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              key={operation.timestamp + index}
              skipBlock
              skipDate
            />
          ))}
          <div className="text-center mt-4" ref={virtualOpsRef}>
            <p className="text-3xl text-black">Virtual Operations</p>
          </div>
          {virtualOperations?.map((operation, index) => (
            <DetailedOperationCard
              operation={operation.operation}
              date={new Date(operation.timestamp)}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              key={operation.timestamp + index}
              skipBlock
              skipDate
            />
          ))}
        </div>
      </section>
    </div>
  );
}
