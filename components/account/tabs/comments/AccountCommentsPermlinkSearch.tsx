import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import moment from "moment";

import Explorer from "@/types/Explorer";
import { trimAccountName } from "@/utils/StringUtils";
import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import { useSearchesContext } from "@/contexts/SearchesContext";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { getSearchParams } from "@/components/home/searches/utils/getSearchParams";
import PostTypeSelector from "@/components/home/searches/PostTypeSelector";
import {
  DEFAULT_LAST_TIME_UNIT_VALUE,
  DEFAULT_TIME_UNIT_SELECT_KEY,
} from "@/hooks/common/useSearchRanges";

const AccountCommentsPermlinkSearch = () => {
  const {
    permlinkSearchProps,
    setPermlinkSearchProps,
    setPermlinkPaginationPage,
    permlinkPaginationPage,
    setCommentType,
    searchRanges,
  } = useSearchesContext();
  const router = useRouter();
  const accountNameFromRoute = router.query.accountName as string;

  const { permlinkSearchDataLoading } = usePermlinkSearch(permlinkSearchProps);

  const [accountName, setAccountName] = useState("");
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

  const handleChangeCommentType = (e: ChangeEvent<HTMLSelectElement>) => {
    const {
      target: { value },
    } = e;

    setLocalCommentType(value as Explorer.CommentType);
  };

  const onSearchButtonClick = () => {
    setPermlinkPaginationPage(1);
    setCommentType(localCommentType);

    handleCommentPermlinkSearch();
  };

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

  useEffect(() => {
    if (!accountName) {
      setAccountName(accountNameFromRoute);
    }
  }, [accountName, accountNameFromRoute]);

  useEffect(() => {
    if (!accountName) return;
    handleCommentPermlinkSearch();

    return () => {
      handleClearFilters();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountName]);

  return (
    <>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />

      <div className={"flex justify-start my-4"}>
        <PostTypeSelector
          showLabel
          handleChange={handleChangeCommentType}
          commentType={localCommentType}
        />
      </div>
      <div className="flex justify-between items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onSearchButtonClick}
          disabled={!accountName}
        >
          Search
          {permlinkSearchDataLoading && (
            <Loader2 className="ml-2 animate-spin h-4 w-4" />
          )}
        </Button>
        <Button onClick={handleClearFilters}>Clear</Button>
      </div>
    </>
  );
};

export default AccountCommentsPermlinkSearch;
