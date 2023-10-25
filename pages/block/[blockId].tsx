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

export default function Block() {
  const router = useRouter();
  const virtualOpsRef = useRef(null);
  const topRef = useRef(null);

  const { blockId } = router.query;

  let blockIdToNum = Number(blockId);

  const [blockNumber, setBlockNumber] = useState(blockIdToNum);
  const [blockDate, setBlockDate] = useState<Date>();
  const [blockFilters, setBlockFilters] = useState<number[]>([]);

  const {
    data: blockOperations,
    isLoading: trxLoading,
  }: UseQueryResult<Hive.OpsByBlockResponse[]> = useQuery({
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

  useEffect(() => {
    if (blockOperations && blockOperations[0]) {
      setBlockDate(new Date(blockOperations[0].timestamp + "Z"));
    }
  }, [blockOperations]);

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

  if ((trxLoading === false && !blockOperations?.length) || blockError) {
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

  return !blockDate ? (
    <div>Loading ...</div>
  ) : (
    <div
      className="w-full h-full"
      style={{ scrollMargin: "100px" }}
      ref={topRef}
      id="block-page-top"
    >
      <BlockPageNavigation
        blockNumber={blockNumber}
        goToBlock={handleGoToBlock}
        timeStamp={blockDate}
        virtualOperationLength={virtualOperations?.length}
        nonVirtualOperationLength={nonVirtualOperations?.length}
        setFilters={setBlockFilters}
        operationTypes={operationTypes || []}
        selectedOperationIds={blockFilters}
      />
      <div className="sticky top-[calc(100vh-90px)] md:top-[calc(100vh-100px)] w-full flex flex-col items-end px-3 md:px-12">
        <Button
          onClick={() => scrollTo(topRef)}
          className="bg-[#ADA9A9] rounded-[6px] text-white hover:bg-gray-700 w-fit mb-1 md:mb-2"
        >
          <p className="hidden md:inline">To Top</p>
          <ArrowUp className="p-0 md:pl-2" />
        </Button>
        <Button
          onClick={() => scrollTo(virtualOpsRef)}
          className="bg-[#ADA9A9] rounded-[6px] text-white hover:bg-gray-700 w-fit"
        >
          <p className="hidden md:inline">To Virtual Ops</p>
          <p className="md:hidden inline">V Ops</p>
        </Button>
      </div>
      {trxLoading === false ? (
        <section className="md:px-10 flex items-center justify-center text-white">
          <div className="w-full px-4 md:p-0 md:w-4/5 flex flex-col gap-y-2 md:gap-y-6">
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
            <div
              className="text-center mt-4"
              ref={virtualOpsRef}
              style={{ scrollMargin: "100px" }}
            >
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
      ) : (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin mt-1 h-16 w-16 ml-3 ... " />
        </div>
      )}
    </div>
  );
}
