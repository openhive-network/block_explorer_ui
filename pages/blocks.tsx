import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import type { GetServerSideProps } from "next";
import { Loader2 } from "lucide-react";
import Seo from "@/components/seo/Seo";
import {
  SeoMeta,
  listPageMeta,
  pageTitle,
  SEO_LIST_CACHE_CONTROL,
} from "@/utils/seo";
import { seoText } from "@/utils/seoStrings";

import BlocksTable from "@/components/blocks/BlocksTable";
import NoResult from "@/components/NoResult";
import ErrorPage from "@/components/ErrorPage";
import BlocksSearch, {
  DEFAULT_BLOCKS_SEARCH_PROPS,
} from "@/components/blocks/BlocksSearch";
import ScrollTopButton from "@/components/ScrollTopButton";
import PageTitle from "@/components/PageTitle";
import FilterSectionToggle from "@/components/account/FilterSectionToggle";
import BlockNavigation from "@/components/BlockNavigation";
import BlockInsightsPanel from "@/components/blocks/BlockInsightsPanel";
import LiveScheduleStrip from "@/components/blocks/LiveScheduleStrip";
import { computeSlotDeltas, isContiguousRange } from "@/utils/slotGaps";
import useMissedProducersInRange from "@/hooks/api/blocks/useMissedProducersInRange";

import useAllBlocksSearch from "@/hooks/api/blocks/useAllBlocksSearch";
import useURLParams from "@/hooks/common/useURLParams";
import useBlockNavigation from "@/hooks/common/useBlockNavigation";
import useOperationBuckets from "@/hooks/common/useOperationBuckets";

import { cn, convertBooleanArrayToIds } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/hybrid-tooltip";
import { type OpBucket } from "@/utils/operationBuckets";
import { setLocalStorage, getLocalStorage } from "@/utils/LocalStorage";
import { Toggle } from "@/components/ui/toggle";
import { useRouter } from "next/router";
import { useI18n } from "@/i18n/i18n";
import { useSettings } from "@/contexts/SettingsContext";

export interface Operations {
  op_type_id: number;
  op_count: number;
}

export interface Block {
  block_num: number;
  created_at: Date;
  producer_account: string;
  producer_reward: number;
  hash: string;
  operations?: Operations[];
  trx_count: number;
  prev: string;
}

export interface BlockRow extends Block {
  operationCount: number;
  virtualOperationCount: number;
  buckets: Record<OpBucket, number>;
  isNew?: boolean; // Added property to indicate new block
}

const BlocksPage = ({ meta }: { meta: SeoMeta }) => {
  const { t } = useI18n();

  const { paramsState, setParams } = useURLParams(DEFAULT_BLOCKS_SEARCH_PROPS);
  const pageNum = paramsState.page;
  const router = useRouter();
  const { getOperationsCounts } = useOperationBuckets();

  // Store the very first block selected so that when we click next in pagination or in block navigation the results are not disrupted by new blocks
  const [firstBlock, setFirstBlock] = useState<number | undefined>(
    paramsState.firstBlock
  );
  const [isNewSearch, setIsNewSearch] = useState<boolean>(true);

  // Filter Visibility State
  const [isFiltersActive, setIsFiltersActive] = useState(false);
  const [isBlocksFilterSectionVisible, setIsBlocksFilterSectionVisible] =
    useState(getLocalStorage("is_blocks_filters_visible", true) ?? false);

  const { settings, updateSettings } = useSettings();
  // Derived per view: writing it back would switch Live Data off app-wide.
  const isHistoricalRange = Boolean(paramsState.toBlock || paramsState.endDate);
  const liveDataEnabled = settings.liveData && !isHistoricalRange;
  const changeLiveRefresh = () => {
    updateSettings({ liveData: !liveDataEnabled });
  };
  // Ref to store previous blocks data for live updates comparison
  const prevBlocksDataRef = useRef<Block[] | null>(null);

  // Data Fetching
  const props = {
    ...paramsState,
    operationTypes: paramsState.filters
      ? convertBooleanArrayToIds(paramsState.filters)
      : null,
  } as any;

  const { blocksSearchData, blocksSearchDataError, blocksSearchDataLoading } =
    useAllBlocksSearch(
      props,
      pageNum,
      //router.query.history?.length == 2 means that we are the very first page where history=[]
      liveDataEnabled &&
        firstBlock &&
        (!paramsState.toBlock || router.query.history?.length == 2)
        ? undefined
        : paramsState.toBlock
          ? paramsState.toBlock
          : paramsState.firstBlock,
      liveDataEnabled
    );

  // Handlers
  const handleFiltersVisibility = () => {
    setIsBlocksFilterSectionVisible(!isBlocksFilterSectionVisible);
    if (isFiltersActive) {
      setLocalStorage(
        "is_blocks_filters_visible",
        !isBlocksFilterSectionVisible
      );
    }
  };

  const updateIsFiltersActive = useCallback((newValue: boolean) => {
    setIsFiltersActive(newValue);
  }, []);

  const handlePageChange = (newPage: number) => {
    setIsNewSearch(false);
    const newParams = {
      ...paramsState,
      page: newPage,
    };

    if (!paramsState.toBlock) {
      newParams.firstBlock = blocksSearchData?.block_range.to;
    }

    setParams(newParams);
  };

  const {
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks,
    hasPreviousBlocks,
    isFromRangeSelection,
  } = useBlockNavigation(
    paramsState.toBlock,
    blocksSearchData,
    paramsState,
    setParams,
    false,
    firstBlock
  );

  // Data Preparation
  const tableRows = useMemo(() => {
    if (!blocksSearchData?.blocks_result) {
      return [];
    }

    // Determine new blocks for highlighting, only when liveDataEnabled is true and when we are in very first page of history
    let newBlocks: number[] = [];
    if (
      liveDataEnabled &&
      prevBlocksDataRef.current &&
      (paramsState.page == blocksSearchData.total_pages || !paramsState.page) && // Make sure we are on first page
      (router.query.history?.length == 2 || !router.query.history) // First page - no history
    ) {
      const existingBlockNums = prevBlocksDataRef.current.map(
        (block) => block.block_num
      );
      newBlocks = blocksSearchData.blocks_result
        .map((block) => block.block_num)
        .filter((blockNum) => !existingBlockNums.includes(blockNum));
    }

    return blocksSearchData.blocks_result.map((block) => {
      const { operationCount, virtualOperationCount, buckets } =
        getOperationsCounts(block.operations);
      const isNew = liveDataEnabled && newBlocks.includes(block.block_num);

      return {
        ...block,
        operationCount,
        virtualOperationCount,
        buckets,
        isNew,
      };
    });
  }, [
    blocksSearchData?.blocks_result,
    getOperationsCounts,
    liveDataEnabled,
    router.query.history,
    paramsState.page,
    blocksSearchData?.total_pages,
  ]);

  const latestRow = tableRows[0];
  // Shown for as long as live data is on, so the navigation below it knows
  // whether it or the strip caps the panel.
  const showLiveStrip = Boolean(liveDataEnabled);

  // Computed once and passed down; the table and the health strip both need it.
  const slotDeltas = useMemo(() => computeSlotDeltas(tableRows), [tableRows]);

  // A filtered set is sparse, so slot timing cannot be derived from it. Read
  // from the rows rather than the filters, so any combination stays correct.
  const showSlotTiming = useMemo(
    () => isContiguousRange(slotDeltas),
    [slotDeltas]
  );

  // Shared by the gap dividers and the producer card's per-witness tally.
  const gapBlocks = useMemo(
    () =>
      showSlotTiming
        ? slotDeltas.filter((d) => d.missedSlots > 0).map((d) => d.blockNum)
        : [],
    [slotDeltas, showSlotTiming]
  );
  const { missedProducersByBlock } = useMissedProducersInRange(gapBlocks);

  const TABLE_CELLS = [
    t("common.block"),
    t("blocksPage.producer"),
    t("blocksPage.prevHash"),
    t("blocksPage.hash"),
    t("blocksPage.time"),
    ...(showSlotTiming ? [t("blocksPage.slotDelta")] : []),
    t("blocksPage.rewardVests"),
    t("common.transactions"),
    t("common.operations"),
    t("blocksPage.virtualOperations"),
    "",
  ];

  // Update the ref with the current blocks data for the next comparison if liveDataEnabled
  useEffect(() => {
    if (liveDataEnabled) {
      prevBlocksDataRef.current = blocksSearchData?.blocks_result || null;
    } else {
      prevBlocksDataRef.current = null;
    }
  }, [blocksSearchData?.blocks_result, liveDataEnabled]);

  useEffect(() => {
    if (isNewSearch && !paramsState.firstBlock) {
      // New Search
      setFirstBlock(blocksSearchData?.block_range.to);
    } else if (paramsState.toBlock !== undefined && !paramsState.firstBlock) {
      setFirstBlock(paramsState.toBlock);
    } else {
      setFirstBlock(paramsState.firstBlock);
    }
  }, [
    paramsState.toBlock,
    paramsState.firstBlock,
    blocksSearchData,
    isNewSearch,
  ]);

  return (
    <>
      <Seo meta={meta} title={pageTitle(t("blocksPage.title"))} />

      <div className="page-container">
        {/* PageTitle is w-full, so it needs a shrinkable wrapper or it pushes
            the controls onto their own line. py-4 matches every other page. */}
        {/* items-start: the title grows when its info panel opens. */}
        <div className="flex items-start justify-between gap-4 w-full bg-theme rounded pe-6">
          <div className="min-w-0 flex-1">
            <PageTitle titleKey="pageTitle.hiveBlocks" className="py-4" />
          </div>
          <div className="flex flex-shrink-0 items-center gap-1 py-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border border-transparent py-1.5 pe-1 ps-2",
                      "text-sm font-medium text-gray-500 dark:text-gray-400",
                      isHistoricalRange && "opacity-50"
                    )}
                  >
                    <Toggle
                      checked={liveDataEnabled}
                      disabled={isHistoricalRange}
                      onClick={changeLiveRefresh}
                      className="whitespace-nowrap"
                      leftLabel={t("headBlockCard.liveData")}
                    />
                  </span>
                </TooltipTrigger>
                {isHistoricalRange ? (
                  <TooltipContent className="bg-theme text-text p-2 text-xs">
                    {t("blocksPage.liveDisabledHistorical")}
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
            <FilterSectionToggle
              isFiltersActive={isFiltersActive}
              toggleFilters={handleFiltersVisibility}
            />
          </div>
        </div>
        <div className="mt-4">
          <BlocksSearch
            isVisible={isBlocksFilterSectionVisible}
            setIsVisible={setIsBlocksFilterSectionVisible}
            setIsFiltersActive={updateIsFiltersActive}
            setIsNewSearch={setIsNewSearch}
            isNewSearch={isNewSearch}
            isFiltersActive={isFiltersActive}
            isFromRangeSelection={isFromRangeSelection}
            firstUserSelectedBlock={firstBlock}
          />
        </div>

        <BlockInsightsPanel
          rows={tableRows}
          slotDeltas={slotDeltas}
          missedProducersByBlock={missedProducersByBlock}
          paramsState={paramsState}
          className="mt-4"
        />

        {showLiveStrip ? (
          <LiveScheduleStrip
            isLive={Boolean(liveDataEnabled)}
            latestBlockNumber={latestRow?.block_num}
            latestProducer={latestRow?.producer_account}
            className="mt-4 rounded-t"
          />
        ) : null}

        {/* Directly above the table so the stepper and pagination stay adjacent. */}
        <BlockNavigation
          fromBlock={blocksSearchData?.block_range.from}
          toBlock={blocksSearchData?.block_range.to}
          hasPrevious={hasPreviousBlocks}
          hasNext={hasMoreBlocks}
          loadPreviousBlocks={handleLoadPreviousBlocks}
          loadNextBlocks={handleLoadNextBlocks}
          urlParams={paramsState}
          className={showLiveStrip ? "rounded-t-none rounded-b" : "rounded"}
        />

        {/* Distinct from NoResult, which would read as "this range is empty". */}
        {blocksSearchDataError && !blocksSearchData ? (
          <ErrorPage />
        ) : /* Spinner on the first load only: gating it on !liveDataEnabled left
             the page blank until the first live poll returned. Once data exists,
             background refetches must not replace the table with a spinner. */
        blocksSearchDataLoading && !blocksSearchData ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mt-1 h-16 w-10 ml-10 dark:text-white" />
          </div>
        ) : blocksSearchData?.blocks_result &&
          blocksSearchData?.blocks_result.length > 0 ? (
          <>
            <BlocksTable
              rows={tableRows}
              paramsState={paramsState}
              TABLE_CELLS={TABLE_CELLS}
              currentPage={pageNum || blocksSearchData.total_pages}
              totalCount={blocksSearchData.total_blocks}
              onPageChange={handlePageChange}
              showSlotTiming={showSlotTiming}
              slotDeltas={slotDeltas}
              missedProducersByBlock={missedProducersByBlock}
            />
          </>
        ) : !blocksSearchDataLoading ? (
          <NoResult />
        ) : null}
        <div className="fixed bottom-[10px] right-0 flex flex-col items-end justify-end px-3 md:px-12">
          <ScrollTopButton />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<{
  meta: SeoMeta;
}> = async ({ req, res }) => {
  res.setHeader("Cache-Control", SEO_LIST_CACHE_CONTROL);
  return {
    props: {
      meta: listPageMeta(
        req,
        "/blocks",
        seoText("seo.blocks.title"),
        seoText("seo.blocks.description")
      ),
    },
  };
};

export default BlocksPage;
