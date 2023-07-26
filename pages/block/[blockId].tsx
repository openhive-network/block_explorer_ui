import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import HeaderSection from "@/components/block/HeaderSection";
import FiltersSection from "@/components/block/FiltersSection";
import OperationsSection from "@/components/block/OperationsSection";

export default function Block() {
  const router = useRouter();

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(0);
  const [blockFilters, setBlockFilters] = useState([]);

  const {
    isLoading: isBlockOperationsLoading,
    data: blockOperations,
  }: UseQueryResult<Hive.OpsByBlockResponse[]> = useQuery({
    queryKey: ["block_operations", blockNumber, blockFilters],
    queryFn: () => fetchingService.getOpsByBlock(blockNumber, blockFilters),
  });

  useEffect(() => {
    if (!blockIdToNum) return;

    setBlockNumber(blockIdToNum);
  }, [blockIdToNum]);

  if (!blockOperations || !blockOperations.length) {
    return null;
  }

  const virtualOperations = blockOperations.filter(
    (operation) => operation.virtual_op
  );

  const nonVirtualOperations = blockOperations.filter(
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

  const blockTimeStamp = blockOperations[0].timestamp;

  return (
    <>
      {isBlockOperationsLoading ? (
        <div>Loading .....</div>
      ) : (
        <div className="p-10 w-full h-full">
          <HeaderSection
            blockNumber={blockNumber}
            nextBlock={handleNextBlock}
            prevBlock={handePreviousBlock}
            timeStamp={blockTimeStamp}
            virtualOperationLength={virtualOperations.length}
            nonVirtualOperationLength={nonVirtualOperations.length}
          />
          <FiltersSection />
          <OperationsSection
            virtualOperations={virtualOperations}
            nonVirtualOperations={nonVirtualOperations}
          />
        </div>
      )}
    </>
  );
}
