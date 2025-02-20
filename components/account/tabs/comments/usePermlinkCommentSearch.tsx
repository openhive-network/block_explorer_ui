import { useState } from "react";
import { useSearchesContext } from "@/contexts/SearchesContext";
import {
  DEFAULT_TIME_UNIT_SELECT_KEY,
  DEFAULT_LAST_TIME_UNIT_VALUE,
} from "@/hooks/common/useSearchRanges";
import { trimAccountName } from "@/utils/StringUtils";
import moment from "moment";
import Explorer from "@/types/Explorer";
import { getSearchParams } from "@/components/home/searches/utils/getSearchParams";

const usePermlinkCommentSearch = (accountName: string) => {
  const {
    searchRanges,
    setCommentType,
    permlinkSearchProps,
    setPermlinkSearchProps,
    permlinkPaginationPage,
  } = useSearchesContext();

  const [localCommentType, setLocalCommentType] =
    useState<Explorer.CommentType>(permlinkSearchProps?.commentType || "post");

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
    setLastTimeUnitValue(DEFAULT_LAST_TIME_UNIT_VALUE);
    setRangeSelectKey("lastTime");
    setTimeUnitSelectKey(DEFAULT_TIME_UNIT_SELECT_KEY);
    setLocalCommentType("post");
    setCommentType("post");

    const commentPermlinksSearchProps = {
      accountName: trimAccountName(accountName),
      commentType: "post" as Explorer.CommentType,
      pageNumber: 1,
      fromBlock: undefined,
      toBlock: undefined,
      startDate: moment(Date.now()).subtract(30, "days").toDate(),
      endDate: undefined,
      lastBlocks: undefined,
      lastTime: 30,
      rangeSelectKey: "lastTime",
      timeUnit: "days",
    };
    setPermlinkSearchProps(commentPermlinksSearchProps);
    setRangesValues(commentPermlinksSearchProps);
  };

  const handleCommentPermlinkSearch = async () => {
    if (!accountName) return;

    const searchParams = await getSearchParams(searchRanges);

    if (!searchParams) return;

    const commentPermlinksSearchProps = {
      accountName: trimAccountName(accountName),
      commentType: localCommentType,
      pageNumber: permlinkPaginationPage,
      ...searchParams,
    };

    setPermlinkSearchProps(commentPermlinksSearchProps);
    setRangesValues(commentPermlinksSearchProps);
  };

  return {
    handleClearFilters,
    handleCommentPermlinkSearch,
    localCommentType,
    setLocalCommentType,
  };
};

export default usePermlinkCommentSearch;
