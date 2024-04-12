import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
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
import { useURLParams } from "@/utils/Hooks";
import useOperationsCountInBlock from "@/api/blockPage/useOperationsInBlock";
import Explorer from "@/types/Explorer";
import { useOperationsFormatter } from "@/utils/Hooks";
import Head from "next/head";
import useBlockRawData from "@/api/blockPage/useBlockRawData";
import useHeadBlockNumber from "@/api/common/useHeadBlockNum";
import OperationsTable from "@/components/OperationsTable";
import {
  convertBooleanArrayToIds,
  convertOperationResultsToTableOperations,
} from "@/lib/utils";
import CustomPagination from "@/components/CustomPagination";

interface BlockSearchParams {
  blockId?: number;
  page: number;
  filters?: boolean[];
  accountName?: string;
  keyContent?: string;
  setOfKeys?: string[];
}

const defaultParams: BlockSearchParams = {
  page: 1,
  filters: undefined,
  accountName: undefined,
  keyContent: undefined,
  setOfKeys: undefined,
};

export default function Block() {
  const router = useRouter();
  const virtualOpsRef = useRef(null);

  const blockId = (router.query.blockId as string)?.replaceAll(",", "");

  const { refetch } = useHeadBlockNumber();

  const [blockDate, setBlockDate] = useState<Date>();
  const { paramsState, setParams } = useURLParams(
    {
      ...defaultParams,
      blockId: blockId,
    },
    ["blockId"]
  );

  useEffect(() => {
    refetch();
  }, [blockId, refetch]);

  const { settings } = useUserSettingsContext();

  const { operationsCountInBlock, countLoading } = useOperationsCountInBlock(
    Number(blockId)
  );

  const { blockDetails, loading } = useBlockData(Number(blockId));

  const { rawBlockdata } = useBlockRawData(Number(blockId));

  const { blockOperations: totalOperations, trxLoading: totalLoading } =
    useBlockOperations(Number(blockId), undefined, paramsState.page || 1);

  const { blockError, blockOperations, trxLoading } = useBlockOperations(
    Number(blockId),
    paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : undefined,
    paramsState.page || 1,
    paramsState.accountName,
    paramsState.keyContent ? [paramsState.keyContent] : undefined,
    paramsState.setOfKeys
  );

  const { operationsTypes } = useOperationsTypes();
  const formattedOperations = useOperationsFormatter(
    blockOperations?.operations_result
  ) as Hive.OperationResponse[];

  useEffect(() => {
    if (blockDetails && blockDetails.created_at) {
      setBlockDate(new Date(blockDetails.created_at + "Z"));
    }
  }, [blockDetails]);

  const getSplitOperations = useCallback(
    (operations?: Hive.OperationResponse[]) => {
      if (operations) {
        return {
          virtualOperations: convertOperationResultsToTableOperations(
            operations?.filter((operation) => operation.virtual_op)
          ),
          nonVirtualOperations: convertOperationResultsToTableOperations(
            operations?.filter((operation) => !operation.virtual_op)
          ),
        };
      } else return { virtualOperations: [], nonVirtualOperations: [] };
    },
    []
  );

  const getOperationsCounts = useCallback(() => {
    if (operationsCountInBlock && !countLoading && operationsTypes) {
      const virtualOperationsTypesCounters: Explorer.OperationCounter[] = [];
      const nonVirtualOperationsTypesCounters: Explorer.OperationCounter[] = [];
      const operationTypesMap = new Map<number, Hive.OperationPattern>();
      let virtualOperationsCounter = 0;
      let nonVirtualOperationsCounter = 0;
      for (const operationType of operationsTypes) {
        operationTypesMap.set(operationType.op_type_id, operationType);
      }
      for (const operationCount of operationsCountInBlock) {
        const operationType = operationTypesMap.get(operationCount.op_type_id);
        const countObject: Explorer.OperationCounter = {
          operationTypeName: operationType?.operation_name || "",
          counter: operationCount.count,
        };
        if (operationType?.is_virtual) {
          virtualOperationsCounter += operationCount.count;
          virtualOperationsTypesCounters.push(countObject);
        } else {
          nonVirtualOperationsCounter += operationCount.count;
          nonVirtualOperationsTypesCounters.push(countObject);
        }
      }
      return {
        virtualOperationsCounter,
        nonVirtualOperationsCounter,
        virtualOperationsTypesCounters,
        nonVirtualOperationsTypesCounters,
      };
    } else
      return {
        virtualOperationsCounter: 0,
        nonVirtualOperationsCounter: 0,
        virtualOperationsTypesCounters: [],
        nonVirtualOperationsTypesCounters: [],
      };
  }, [countLoading, operationsCountInBlock, operationsTypes]);

  const {
    virtualOperationsCounter,
    nonVirtualOperationsCounter,
    virtualOperationsTypesCounters,
    nonVirtualOperationsTypesCounters,
  } = getOperationsCounts();

  const { virtualOperations, nonVirtualOperations } =
    getSplitOperations(formattedOperations);

  const {
    virtualOperations: unformattedVirtual,
    nonVirtualOperations: unformattedNonVirtual,
  } = getSplitOperations(blockOperations?.operations_result);

  const handleGoToBlock = (blockNumber: string) => {
    router.push({
      pathname: "[blockId]",
      query: { ...router.query, blockId: blockNumber },
    });
  };

  const handleFilterChange = (filters: boolean[]) => {
    setParams({
      ...paramsState,
      page: 1,
      filters: filters,
      accountName: undefined,
      keyContent: undefined,
      setOfKeys: undefined,
    });
  };

  const handleClearParams = () => {
    setParams({
      ...paramsState,
      accountName: undefined,
      keyContent: undefined,
      setOfKeys: undefined,
    });
  };

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

  return (
    <>
      <Head>
        <title>{blockId} - Hive Explorer</title>
      </Head>
      {loading ? (
        <div>Loading ...</div>
      ) : blockDetails?.block_num ? (
        <div
          className="w-full h-full flex flex-col gap-y-4 px-2 md:px-0"
          style={{ scrollMargin: "100px" }}
          id="block-page-top"
        >
          <BlockPageNavigation
            blockNumber={Number(blockId)}
            goToBlock={handleGoToBlock}
            timeStamp={blockDate}
            setFilters={handleFilterChange}
            operationTypes={operationsTypes || []}
            selectedOperationIds={paramsState.filters || []}
            accountName={paramsState.accountName}
            keyContent={paramsState.keyContent}
            setOfKeys={paramsState.setOfKeys}
            onClearParams={() => handleClearParams()}
          />
          <BlockDetails
            virtualOperationLength={virtualOperationsCounter}
            nonVirtualOperationLength={nonVirtualOperationsCounter}
            virtualOperationsTypesCounters={virtualOperationsTypesCounters}
            nonVirtualOperationsTypesCounters={
              nonVirtualOperationsTypesCounters
            }
            blockDetails={blockDetails}
          />
          <div className="fixed top-[calc(100vh-90px)] md:top-[calc(100vh-100px)] right-0 flex flex-col items-end justify-end px-3 md:px-12">
            <ScrollTopButton />
            <Button
              onClick={() => scrollTo(virtualOpsRef)}
              className="bg-[#ADA9A9] rounded text-white hover:bg-gray-700 w-fit"
            >
              <p className="hidden md:inline">To Virtual Ops</p>
              <p className="md:hidden inline">V Ops</p>
            </Button>
          </div>
          {loading !== false || trxLoading || totalLoading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin mt-1 h-16 w-16 ml-3 ... " />
            </div>
          ) : settings.rawJsonView ? (
            <div className="px-2">
              <JSONView
                data-testid="json-view"
                json={rawBlockdata || {}}
                className="w-full md:w-[962px] mt-6 m-auto py-2 px-4 bg-explorer-dark-gray rounded text-white text-xs break-words break-all"
              />
            </div>
          ) : (
            <section
              className="md:px-10 flex flex-col items-center justify-center text-white"
              data-testid="block-page-operation-list"
            >
              {!!totalOperations?.total_operations &&
                totalOperations?.total_operations > 1000 && (
                  <CustomPagination
                    currentPage={paramsState.page}
                    onPageChange={(newPage: number) =>
                      setParams({ ...paramsState, page: newPage })
                    }
                    pageSize={1000}
                    totalCount={blockOperations?.total_operations || 0}
                    className="text-black dark:text-white"
                  />
                )}
              <div className="w-full md:w-4/5 flex flex-col gap-y-2">
                <OperationsTable
                  operations={nonVirtualOperations}
                  unformattedOperations={unformattedNonVirtual}
                />
                <div
                  className="text-center mt-4"
                  ref={virtualOpsRef}
                  style={{ scrollMargin: "100px" }}
                >
                  <p className="text-3xl text-black dark:text-white">
                    {!!blockOperations &&
                    !blockOperations?.operations_result?.length
                      ? "No operations were found"
                      : !!virtualOperations.length
                      ? "Virtual Operations"
                      : null}
                  </p>
                </div>
                <OperationsTable
                  operations={virtualOperations}
                  unformattedOperations={unformattedVirtual}
                />
              </div>
            </section>
          )}
        </div>
      ) : (
        <div>
          <div className="mt-9 mb-6">Block not found</div>
          <Button variant="outline" onClick={() => router.reload()}>
            Reload page
          </Button>
        </div>
      )}
    </>
  );
}
