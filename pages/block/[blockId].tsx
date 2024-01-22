import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import { scrollTo } from "@/utils/UI";
import PageNotFound from "@/components/PageNotFound";
import { Button } from "@/components/ui/button";
import { useUserSettingsContext } from "@/components/contexts/UserSettingsContext";
import JSONView from "@/components/JSONView";
import useBlockData from "@/api/blockPage/useBlockData";
import useBlockOperations from "@/api/common/useBlockOperations";
import useOperationsTypes from "@/api/common/useOperationsTypes";
import BlockDetails from "@/components/block/BlockDetails";
import Hive from "@/types/Hive";
import ScrollTopButton from "@/components/ScrollTopButton";

const FILTERS = "filters";
const SPLIT = "-";

export default function Block() {
  const router = useRouter();
  const virtualOpsRef = useRef(null);

  const { blockId, filters } = router.query;

  const [blockDate, setBlockDate] = useState<Date>();
  const [blockFilters, setBlockFilters] = useState<number[]>([]);

  const { settings } = useUserSettingsContext();

  const { blockDetails, loading } = useBlockData(Number(blockId), blockFilters);

  const { blockOperations: totalOperations } = useBlockOperations(
    Number(blockId),
    []
  );

  const { blockError, blockOperations, trxLoading } = useBlockOperations(
    Number(blockId),
    blockFilters
  );

  const { operationsTypes } = useOperationsTypes();

  useEffect(() => {
    if (blockDetails && blockDetails.created_at) {
      setBlockDate(new Date(blockDetails.created_at + "Z"));
    }
  }, [blockDetails]);

  const getSplitOperations = useCallback(
    (operations?: Hive.OperationResponse[]) => {
      if (operations) {
        return {
          virtualOperations: operations?.filter(
            (operation) => operation.virtual_op
          ),
          nonVirtualOperations: operations?.filter(
            (operation) => !operation.virtual_op
          ),
        };
      } else return { virtualOperations: [], nonVirtualOperations: [] };
    },
    []
  );

  const { virtualOperations, nonVirtualOperations } =
    getSplitOperations(blockOperations);
  const {
    virtualOperations: totalVirtualOperations,
    nonVirtualOperations: totalNonVirtualOperations,
  } = getSplitOperations(totalOperations);

  const handleGoToBlock = (blockNumber: string) => {
    router.push({
      pathname: "[blockId]",
      query: { ...router.query, blockId: blockNumber },
    });
  };

  const handleFilterChange = (filters: number[]) => {
    setBlockFilters(filters);
    if (!!filters.length) {
      router.replace({
        query: { ...router.query, [FILTERS]: filters.join(SPLIT) },
      });
    } else {
      delete router.query[FILTERS];
      router.replace({
        query: { ...router.query },
      });
    }
  };

  useEffect(() => {
    filters &&
      handleFilterChange(
        (filters as string)?.split(SPLIT).map((filter) => Number(filter))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if ((trxLoading === false && !blockOperations) || blockError) {
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
      id="block-page-top"
    >
      <BlockPageNavigation
        blockNumber={Number(blockId)}
        goToBlock={handleGoToBlock}
        timeStamp={blockDate}
        setFilters={handleFilterChange}
        operationTypes={operationsTypes || []}
        selectedOperationIds={blockFilters}
      />
      <BlockDetails
        operations={totalOperations}
        virtualOperationLength={totalVirtualOperations?.length}
        nonVirtualOperationLength={totalNonVirtualOperations?.length}
        blockDetails={blockDetails}
      />
      <div className="fixed top-[calc(100vh-90px)] md:top-[calc(100vh-100px)] w-full flex flex-col items-end px-3 md:px-12">
        <ScrollTopButton />
        <Button
          onClick={() => scrollTo(virtualOpsRef)}
          className="bg-[#ADA9A9] rounded text-white hover:bg-gray-700 w-fit"
        >
          <p className="hidden md:inline">To Virtual Ops</p>
          <p className="md:hidden inline">V Ops</p>
        </Button>
      </div>
      {loading === false ? (
        settings.rawJsonView ? (
          <JSONView
            json={{
              details: { ...blockDetails },
              operations: { ...blockOperations },
            }}
            className="w-full md:w-[962px] mt-6 m-auto py-2 px-4 bg-explorer-dark-gray rounded text-white text-xs break-words break-all"
          />
        ) : (
          <section className="md:px-10 flex items-center justify-center text-white">
            <div className="w-full px-4 md:p-0 md:w-4/5 flex flex-col gap-y-2" data-testid="block-page-operation-list">
              {nonVirtualOperations?.map((operation, index) => (
                <DetailedOperationCard
                  operation={operation.operation}
                  operationId={operation.operation_id}
                  date={new Date(operation.timestamp)}
                  blockNumber={operation.block_num}
                  transactionId={operation.trx_id}
                  key={operation.timestamp + index}
                  skipBlock
                  skipDate
                  isShortened={operation.is_modified}
                />
              ))}
              <div
                className="text-center mt-4"
                ref={virtualOpsRef}
                style={{ scrollMargin: "100px" }}
              >
                <p className="text-3xl text-black">
                  {!!blockOperations && !blockOperations.length
                    ? "No operations were found"
                    : !!virtualOperations.length
                    ? "Virtual Operations"
                    : null}
                </p>
              </div>
              {virtualOperations?.map((operation, index) => (
                <DetailedOperationCard
                  operation={operation.operation}
                  operationId={operation.operation_id}
                  date={new Date(operation.timestamp)}
                  blockNumber={operation.block_num}
                  transactionId={operation.trx_id}
                  key={operation.timestamp + index}
                  skipBlock
                  skipDate
                  isShortened={operation.is_modified}
                />
              ))}
            </div>
          </section>
        )
      ) : (
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin mt-1 h-16 w-16 ml-3 ... " />
        </div>
      )}
    </div>
  );
}
