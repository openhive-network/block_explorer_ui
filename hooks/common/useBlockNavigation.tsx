// hooks/useBlockNavigation.tsx
import {
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { useRouter } from "next/router";

const useBlockNavigation = (
  initialToBlock: number | undefined,
  blocksSearchData: any,
  paramsState: any,
  setParams: any,
  parseFromParamState?: boolean,
  isNewSearch?: boolean,
  setIsNewSearch?: Dispatch<SetStateAction<boolean>>,
  setIsFromRangeSelection?: Dispatch<SetStateAction<boolean>>
) => {
    
  const router = useRouter();

  const parseHistoryFromQuery = useCallback((queryHistory: any): number[] => {
    if (typeof queryHistory === "string") {
      try {
        const parsed = JSON.parse(queryHistory);
        if (Array.isArray(parsed) && parsed.every(Number.isInteger)) {
          return parsed as number[];
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    } else if (
      Array.isArray(queryHistory) &&
      queryHistory.every(Number.isInteger)
    ) {
      return queryHistory as number[];
    }
    return [];
  }, []);

  const [toBlockHistory, setToBlockHistory] = useState<number[] | null>(null);

  useEffect(() => {
    // Parse the history from the URL or paramsState
    const initialHistory = parseHistoryFromQuery(
      parseFromParamState ? paramsState.history : router.query.history
    );
    setToBlockHistory(initialHistory);
  }, [
    parseFromParamState,
    paramsState.history,
    router.query.history,
    parseHistoryFromQuery,
  ]);

  const handleLoadNextBlocks = useCallback(() => {
    if (
      !blocksSearchData?.block_range?.to ||
      !blocksSearchData?.block_range?.from ||
      toBlockHistory === null
    ) {
      return;
    }

    const currentToBlock = blocksSearchData.block_range.to;
    const nextToBlockParam = blocksSearchData.block_range.from;
    const newHistory = [...toBlockHistory, currentToBlock - nextToBlockParam];

    setToBlockHistory(newHistory);

    const serializedHistory = JSON.stringify(newHistory);
    setParams({
      ...paramsState,
      toBlock: nextToBlockParam,
      page: undefined,
      pageNumber: undefined,
      history: serializedHistory,
    });
    setIsNewSearch && setIsNewSearch(false);
    setIsFromRangeSelection && setIsFromRangeSelection(true);
  }, [
    blocksSearchData,
    paramsState,
    setParams,
    toBlockHistory,
    setToBlockHistory,
    setIsNewSearch,
    setIsFromRangeSelection,
  ]);

  const handleLoadPreviousBlocks = useCallback(() => {
    if (!toBlockHistory || toBlockHistory.length === 0) {
      return;
    }

    const targetToBlockDiff = toBlockHistory[toBlockHistory.length - 1];
    const targetToBlock = paramsState.toBlock
      ? paramsState.toBlock + targetToBlockDiff
      : undefined;

    setToBlockHistory((prevHistory) =>
      prevHistory ? prevHistory.slice(0, -1) : null
    );

    setParams({
      ...paramsState,
      toBlock: targetToBlock,
      pageNumber: undefined, //some cases pageNumber is passed in params instead of page
      page: undefined,
      history: JSON.stringify(toBlockHistory.slice(0, -1)),
    });
    setIsNewSearch && setIsNewSearch(false);
    setIsFromRangeSelection && setIsFromRangeSelection(true);
  }, [
    paramsState,
    setParams,
    toBlockHistory,
    setToBlockHistory,
    setIsNewSearch,
    setIsFromRangeSelection,
  ]);

  const checkForMoreBlocks = useCallback((): boolean => {
    if (!blocksSearchData?.block_range) {
      return false;
    }

    if (
      paramsState.fromBlock &&
      paramsState.lastBlocks &&
      paramsState.rangeSelectKey === "lastBlocks" &&
      blocksSearchData.block_range.to > paramsState.fromBlock &&
      blocksSearchData.block_range.from != paramsState.fromBlock
    ) {
      return true;
    }

    if (
      paramsState.fromBlock &&
      paramsState.rangeSelectKey === "blockRange" &&
      blocksSearchData.block_range.from > paramsState.fromBlock
    ) {
      return true;
    }
    return (
      blocksSearchData.block_range.from !== 1 &&
      blocksSearchData.block_range.from != blocksSearchData.block_range.to &&
      (paramsState.fromBlock === undefined ||
        blocksSearchData.block_range.from <= paramsState.fromBlock)
    );
  }, [blocksSearchData, paramsState]);

  const checkForPreviousBlocks = useCallback((): boolean => {
    return toBlockHistory !== null && toBlockHistory.length > 0;
  }, [toBlockHistory]);

  return {
    toBlockHistory,
    handleLoadNextBlocks,
    handleLoadPreviousBlocks,
    hasMoreBlocks: checkForMoreBlocks(),
    hasPreviousBlocks: checkForPreviousBlocks(),
  };
};

export default useBlockNavigation;
