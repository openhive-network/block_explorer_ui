import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import FiltersSection from "@/components/block/FiltersSection";
import NonVirtualOperations from "@/components/block/NonVirtualOperations";
import VirtualOperations from "@/components/block/VirtualOperations";

export default function Block() {
  const router = useRouter();

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(0);
  const [blockFilters, setBlockFilters] = useState<number[]>([]);

  const { data: blockOperations }: UseQueryResult<Hive.OpsByBlockResponse[]> = useQuery({
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

  const virtualOperations = blockOperations?.filter(
    (operation) => operation.virtual_op
  );

  const nonVirtualOperations = blockOperations?.filter(
    (operation) => !operation.virtual_op
  );

  const handleNextBlock = () => {
    router.push({
      pathname: "[blockId]",
      query: { blockId: (blockIdToNum += 1) },
    });
  };

  const handePreviousBlock = () => {
    router.push({
      pathname: "[blockId]",
      query: { blockId: (blockIdToNum -= 1) },
    });
  };

  const handleGoToBlock = (blockNumber: string) => {
    router.push({
      pathname: "[blockId]",
      query: { blockId: blockNumber },
    });
  }

  if (!blockOperations || !operationTypes) {
    return 'Loading ...'
  };

  if (!blockOperations.length || !operationTypes.length) {
    return 'No Data'
  }

  return (
    <div className="md:p-10 w-full h-full">
      <BlockPageNavigation
        blockNumber={blockNumber}
        goToBlock={handleGoToBlock}
        timeStamp={new Date(blockOperations[0].timestamp)}
        virtualOperationLength={virtualOperations?.length ?? 0}
        nonVirtualOperationLength={nonVirtualOperations?.length ?? 0}
      />
      <FiltersSection
        operationTypes={operationTypes.sort((a, b) =>
          a[1].localeCompare(b[1])
        )}
        setFilters={setBlockFilters}
      />
      <section className="md:p-10 flex items-center justify-center text-white">
        <div className="w-full p-4 md:p-0 md:w-4/5">
          <NonVirtualOperations
            nonVirtualOperations={nonVirtualOperations || []}
          />
          <VirtualOperations
            virtualOperations={virtualOperations || []}
          />
        </div>
      </section>
    </div>
  );
}
