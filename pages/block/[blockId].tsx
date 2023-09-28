import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import FiltersSection from "@/components/block/FiltersSection";
import NonVirtualOperations from "@/components/block/NonVirtualOperations";
import VirtualOperations from "@/components/block/VirtualOperations";
import DetailedOperationCard from "@/components/DetailedOperationCard";

export default function Block() {
  const router = useRouter();

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(0);
  const [blockFilters, setBlockFilters] = useState<number[]>([]);

  const { data: blockOperations }: UseQueryResult<Hive.OpsByBlockResponse[]> =
    useQuery({
      queryKey: ["block_operations", blockNumber, blockFilters],
      queryFn: () => fetchingService.getOpsByBlock(blockNumber, blockFilters),
      refetchOnWindowFocus: false,
    });

  const { data: operationTypes }: UseQueryResult<Hive.OperationTypes[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    if (!blockIdToNum) return;

    setBlockNumber(blockIdToNum);
  }, [blockIdToNum]);

  const virtualOperations =
    blockOperations?.filter((operation) => operation.virtual_op) || [];

  const nonVirtualOperations =
    blockOperations?.filter((operation) => !operation.virtual_op) || [];

  const handleGoToBlock = (blockNumber: string) => {
    router.push({
      pathname: "[blockId]",
      query: { blockId: blockNumber },
    });
  };

  if (!blockOperations || !operationTypes) {
    return "Loading ...";
  }

  if (!blockOperations.length || !operationTypes.length) {
    return "No Data";
  }

  return (
    <div className="md:p-10 w-full h-full">
      <BlockPageNavigation
        blockNumber={blockNumber}
        goToBlock={handleGoToBlock}
        timeStamp={new Date(blockOperations[0].timestamp)}
        virtualOperationLength={virtualOperations?.length ?? 0}
        nonVirtualOperationLength={nonVirtualOperations?.length ?? 0}
        setFilters={setBlockFilters}
        operationTypes={operationTypes}
      />
      <section className="md:px-10 flex items-center justify-center text-white">
        <div className="w-full p-4 md:p-0 md:w-4/5 flex flex-col gap-y-2 md:gap-y-6">
          {nonVirtualOperations?.map((operation) => (
            <DetailedOperationCard
              operation={operation.operation}
              date={new Date(operation.timestamp)}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              key={operation.timestamp}
            />
          ))}
          <div className="text-center mt-4">
            <p className="text-3xl text-black">Virtual Operations</p>
          </div>
          {virtualOperations?.map((operation) => (
            <DetailedOperationCard
              operation={operation.operation}
              date={new Date(operation.timestamp)}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              key={operation.timestamp}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
