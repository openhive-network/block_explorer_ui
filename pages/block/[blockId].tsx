import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import BlockPageHeader from "@/components/block/BlockPageHeader";
import FiltersSection from "@/components/block/FiltersSection";
import NonVirtualOperations from "@/components/block/NonVirtualOperations";
import VirtualOperations from "@/components/block/VirtualOperations";

export default function Block() {
  const router = useRouter();

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(0);
  const [blockFilters, setBlockFilters] = useState<string[]>([]);

  const {
    isLoading: isBlockOperationsLoading,
    data: blockOperations,
  }: UseQueryResult<Hive.OpsByBlockResponse[]> = useQuery({
    queryKey: ["block_operations", blockNumber],
    queryFn: () => fetchingService.getOpsByBlock(blockNumber, []),
  });

  const { data: operationTypes }: UseQueryResult<Hive.OperationTypes[]> =
    useQuery({
      queryKey: ["operation_types"],
      queryFn: () => fetchingService.getOperationTypes(""),
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

  return (
    <>
      {isBlockOperationsLoading ||
      !blockOperations?.length ||
      !operationTypes?.length ||
      !virtualOperations?.length ||
      !nonVirtualOperations?.length ? (
        <div>Loading .....</div>
      ) : (
        <div className="md:p-10 w-full h-full">
          <BlockPageHeader
            blockNumber={blockNumber}
            nextBlock={handleNextBlock}
            prevBlock={handePreviousBlock}
            timeStamp={new Date(blockOperations[0].timestamp)}
            virtualOperationLength={virtualOperations?.length}
            nonVirtualOperationLength={nonVirtualOperations.length}
          />
          <FiltersSection
            operationTypes={operationTypes.sort((a, b) =>
              a[1].localeCompare(b[1])
            )}
            setFilters={(filters) => setBlockFilters(filters)}
          />
          <section className="md:p-10 flex items-center justify-center text-white">
            <div className="w-full p-4 md:p-0 md:w-4/5">
              <NonVirtualOperations
                nonVirtualOperations={
                  !!blockFilters.length
                    ? nonVirtualOperations.filter((operation) =>
                        blockFilters.includes(operation.operation.type)
                      )
                    : nonVirtualOperations
                }
              />
              <VirtualOperations
                virtualOperations={
                  !!blockFilters.length
                    ? virtualOperations.filter((operation) =>
                        blockFilters.includes(operation.operation.type)
                      )
                    : virtualOperations
                }
              />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
