import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import Head from "next/head";

import { config } from "@/Config";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";
import {
  convertBooleanArrayToIds,
  convertOperationResultsToTableOperations,
} from "@/lib/utils";
import { useUserSettingsContext } from "@/contexts/UserSettingsContext";
import useBlockData from "@/hooks/api/blockPage/useBlockData";
import useBlockOperations from "@/hooks/api/common/useBlockOperations";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import useURLParams from "@/hooks/common/useURLParams";
import useBlockRawData from "@/hooks/api/blockPage/useBlockRawData";
import useOperationsCountInBlock from "@/hooks/api/blockPage/useOperationsInBlock";
import BlockPageNavigation from "@/components/block/BlockPageNavigation";
import PageNotFound from "@/components/PageNotFound";
import { Button } from "@/components/ui/button";
import JSONView from "@/components/JSONView";
import BlockDetails from "@/components/block/BlockDetails";
import ScrollTopButton from "@/components/ScrollTopButton";
import OperationsTable from "@/components/OperationsTable";
import CustomPagination from "@/components/CustomPagination";
import useBlockId from "@/hooks/common/useBlockId";

interface BlockSearchParams {
  blockId?: number;
  page: number;
  filters?: boolean[];
  accountName?: string;
  keyContent?: string;
  setOfKeys?: string[];
  trxId?: string;
}

const defaultParams: BlockSearchParams = {
  page: 1,
  filters: undefined,
  accountName: undefined,
  keyContent: undefined,
  setOfKeys: undefined,
  trxId: undefined,
};

const scrollToTrxSection = (trxId?: string) => {
  if (!trxId) return;
  const element = document.getElementById(trxId);
  if (!element) return;

  const headerOffset = 60;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  return () => {
    window.scrollTo(undefined);
  };
};

export default function Block() {
  const router = useRouter();
  const { blockId } = useBlockId();

  const [blockDate, setBlockDate] = useState<Date>();
  const [enableRawVirtualOperations, setEnableRawVirtualOperations] =
    useState(false);
  const { paramsState, setParams } = useURLParams(
    {
      ...defaultParams,
      blockId: blockId,
    },
    ["blockId"]
  );

  const { settings } = useUserSettingsContext();
  const { operationsCountInBlock, countLoading } =
    useOperationsCountInBlock(blockId);
  const { blockDetails, loading } = useBlockData(blockId);

  const { rawBlockdata } = useBlockRawData(blockId, enableRawVirtualOperations);
  const { blockOperations: totalOperations, trxLoading: totalLoading } =
    useBlockOperations(blockId, undefined, paramsState.page || 1);

  /* Calculating Maximum Transaction in Blog */
  let maxTransactions = undefined;
  if (
    totalOperations?.operations_result &&
    Array.isArray(totalOperations.operations_result)
  ) {
    maxTransactions = totalOperations.operations_result.reduce(
      (max, operation) => {
        if (typeof operation?.trx_in_block === "number") {
          return Math.max(max, operation.trx_in_block);
        } else {
          return max;
        }
      },
      0
    );
    maxTransactions += 1; // Add one since trx_in_block starts at 0 an not 1
  }

  const { blockError, blockOperations, trxLoading } = useBlockOperations(
    blockId,
    paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : undefined,
    paramsState.page || 1,
    paramsState.accountName,
    paramsState.keyContent ? paramsState.keyContent : undefined,
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

  const getConvertedOperations = useCallback(
    (operations?: Hive.OperationResponse[]) => {
      if (operations) {
        return convertOperationResultsToTableOperations(operations);
      } else {
        return [];
      }
    },
    []
  );

  const getOperationsCounts = useCallback(() => {
    if (countLoading) {
      return {
        virtualOperationsCounter: undefined,
        nonVirtualOperationsCounter: undefined,
        virtualOperationsTypesCounters: [],
        nonVirtualOperationsTypesCounters: [],
      };
    }
    if (operationsCountInBlock && !countLoading && operationsTypes) {
      const virtualOperationsTypesCounters: Explorer.OperationCounter[] = [];
      const nonVirtualOperationsTypesCounters: Explorer.OperationCounter[] = [];
      const operationTypesMap = new Map<number, Hive.OperationPattern>();
      let virtualOperationsCounter = 0;
      let nonVirtualOperationsCounter = 0;
      for (const operationType of operationsTypes) {
        operationTypesMap.set(operationType.op_type_id, operationType);
      }
      for (const operationCount of operationsCountInBlock.ops_count) {
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

  const convertedTotalOperations = getConvertedOperations(formattedOperations);
  const unformattedOperations = getConvertedOperations(
    blockOperations?.operations_result
  );

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
      trxId: undefined,
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
  const handleEnableVirtualOperations = () => {
    setEnableRawVirtualOperations(!enableRawVirtualOperations);
  };
  useEffect(() => {
    if (!blockOperations || !blockOperations?.operations_result?.length) return;

    const timeout = setTimeout(() => {
      scrollToTrxSection(paramsState.trxId);
    });

    return () => clearTimeout(timeout);
  }, [paramsState.trxId, blockOperations]);

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
        <div>
          <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
        </div>
      ) : blockDetails?.block_num ? (
        <div
          className="page-container h-full flex flex-col gap-y-4"
          style={{ scrollMargin: "100px" }}
          id="block-page-top"
        >
          <BlockPageNavigation
            blockNumber={blockDetails.block_num}
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
            trxOperationsLength={maxTransactions}
            blockDetails={blockDetails}
            enableRawVirtualOperations={enableRawVirtualOperations}
            handleEnableVirtualOperations={handleEnableVirtualOperations}
          />
          <div className="fixed top-[calc(100vh-90px)] md:top-[calc(100vh-60px)] right-0 flex flex-col items-end justify-end px-3 md:px-12">
            <ScrollTopButton />
          </div>
          {loading || trxLoading || totalLoading ? (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin text-text mt-1 h-16 w-16 ml-3 ... " />
            </div>
          ) : settings.rawJsonView || settings.prettyJsonView ? (
            <div>
              <JSONView
                data-testid="json-view"
                json={rawBlockdata || {}}
                className="w-full m-auto py-2 px-4 bg-theme dark:bg-theme rounded text-white text-xs break-words break-all"
                isPrettyView={settings.prettyJsonView}
              />
            </div>
          ) : (
            <section
              className="flex flex-col items-center justify-center text-text"
              data-testid="block-page-operation-list"
            >
              {!!totalOperations?.total_operations &&
                totalOperations?.total_operations > 1000 && (
                  <div className="my-4 w-full sticky z-20 top-[3.2rem] md:top-[4rem] rounded">
                    <CustomPagination
                      currentPage={paramsState.page}
                      onPageChange={(newPage: number) =>
                        setParams({ ...paramsState, page: newPage })
                      }
                      pageSize={config.blockPagePaginationSize}
                      totalCount={blockOperations?.total_operations || 0}
                      className="text-text"
                    />
                  </div>
                )}
              <div className="w-full max-w-screen-2xl flex flex-col gap-y-2">
                {!!convertedTotalOperations.length && (
                  <OperationsTable
                    operations={convertedTotalOperations}
                    markedTrxId={paramsState.trxId}
                    unformattedOperations={unformattedOperations}
                    referrer={`${blockId}_block_details.csv`}
                  />
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div>
          <div className="mt-9 mb-6">Block not found</div>
          <Button
            variant="outline"
            onClick={() => router.reload()}
          >
            Reload page
          </Button>
        </div>
      )}
    </>
  );
}
