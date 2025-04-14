import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useSearchesContext } from "@/contexts/SearchesContext";

import { trimAccountName } from "@/utils/StringUtils";
import Explorer from "@/types/Explorer";
import { getSearchParams } from "@/components/home/searches/utils/getSearchParams";
import useURLParams from "@/hooks/common/useURLParams";
import { DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS } from "./CommentsTabContent";

const usePermlinkCommentSearch = (accountName: string) => {
  const router = useRouter();
  const { paramsState, setParams } = useURLParams(
    {
      ...DEFAULT_COMMENT_PERMLINKS_SEARCH_PROPS,
      accountName,
    },
    ["accountName"]
  );

  const {
    searchRanges,
    setCommentType,
    permlinkSearchProps,
    setPermlinkSearchProps,
    permlinkPaginationPage,
  } = useSearchesContext();

  const [localCommentType, setLocalCommentType] = useState<
    Explorer.CommentType | string
  >(permlinkSearchProps?.commentType || "all");

  const {
    setRangesValues,
    setLastTimeUnitValue,
    setRangeSelectKey,
    setTimeUnitSelectKey,
    setFromBlock,
    setToBlock,
    setStartDate,
    setEndDate,
    setLastBlocksValue,
  } = searchRanges;

  const handleClearFilters = async () => {
    setFromBlock(undefined);
    setToBlock(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setLastBlocksValue(undefined);
    setLastTimeUnitValue(undefined);
    setRangeSelectKey("none");
    setTimeUnitSelectKey(undefined);
    setLocalCommentType("all");
    setCommentType("all");

    const commentPermlinksSearchProps = {
      accountName: trimAccountName(accountName),
      activeTab: "comments",
      commentType: "all" as Explorer.CommentType,
      pageNumber: 1,
      fromBlock: undefined,
      toBlock: undefined,
      startDate: undefined,
      endDate: undefined,
      lastBlocks: undefined,
      lastTime: 30,
      rangeSelectKey: "none",
      timeUnit: undefined,
    };
    setPermlinkSearchProps(commentPermlinksSearchProps);
    setRangesValues(commentPermlinksSearchProps);
    setParams({ ...commentPermlinksSearchProps, startDate: undefined } as any);
  };

  const handleCommentPermlinkSearch = async () => {
    if (!accountName) return;

    const searchParams = await getSearchParams(searchRanges);

    if (!searchParams) return;

    const commentPermlinksSearchProps = {
      accountName: trimAccountName(accountName),
      activeTab: "comments",
      commentType: localCommentType,
      pageNumber: permlinkPaginationPage,
      ...searchParams,
    } as any;

    setPermlinkSearchProps(commentPermlinksSearchProps);
    setRangesValues(commentPermlinksSearchProps);
    setParams(commentPermlinksSearchProps);
  };

  useEffect(() => {
    if (!router.isReady) return;
    setFromBlock(paramsState.fromBlock);
    setToBlock(paramsState.toBlock);
    setStartDate(paramsState.startDate);
    setEndDate(paramsState.endDate);
    setLastBlocksValue(paramsState.lastBlocks);
    setLastTimeUnitValue(paramsState.lastTime);
    setRangeSelectKey(paramsState.rangeSelectKey);
    setTimeUnitSelectKey(paramsState.timeUnit);
    setLocalCommentType(paramsState.commentType);
    setCommentType(paramsState.commentType);

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.isReady,
    paramsState.fromBlock,
    paramsState.toBlock,
    paramsState.startDate,
    paramsState.endDate,
    paramsState.lastBlocks,
    paramsState.lastTime,
    paramsState.rangeSelectKey,
    paramsState.timeUnit,
    paramsState.commentType,
  ]);

  return {
    handleClearFilters,
    handleCommentPermlinkSearch,
    localCommentType,
    setLocalCommentType,
  };
};

export default usePermlinkCommentSearch;
