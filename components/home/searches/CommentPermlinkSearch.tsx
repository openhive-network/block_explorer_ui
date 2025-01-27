import { useState, ChangeEvent, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Explorer from "@/types/Explorer";
import { trimAccountName } from "@/utils/StringUtils";

import SearchRanges from "@/components/searchRanges/SearchRanges";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { useSearchesContext } from "@/contexts/SearchesContext";
import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import { startCommentPermlinkSearch } from "./utils/commentPermlinkSearchHelpers";
import PostTypeSelector from "./PostTypeSelector";

const CommentsPermlinkSearch = () => {
  const {
    permlinkSearchProps,
    setPermlinkSearchProps,
    setCommentPaginationPage,
    setCommentType,
    setLastSearchKey,
    searchRanges,
  } = useSearchesContext();

  const { permlinkSearchDataLoading } = usePermlinkSearch(permlinkSearchProps);

  const [accountName, setAccountName] = useState<string>("");
  const [localCommentType, setLocalCommentType] =
    useState<Explorer.CommentType>("post");

  const { getRangesValues } = searchRanges;

  const onButtonClick = async () => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const commentPermlinksSearchProps: Explorer.PermlinkSearchProps | any = {
        accountName: trimAccountName(accountName),
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        lastBlocks:
          searchRanges.rangeSelectKey === "lastBlocks"
            ? searchRanges.lastBlocksValue
            : undefined,
        lastTime: searchRanges.lastTimeUnitValue,
        rangeSelectKey: searchRanges.rangeSelectKey,
        timeUnit: searchRanges.timeUnitSelectKey,
        commentType: localCommentType,
      };

      startCommentPermlinkSearch(
        commentPermlinksSearchProps,
        setPermlinkSearchProps,
        setCommentPaginationPage,
        setCommentType,
        (val: "comment-permlink") => setLastSearchKey(val)
      );
    }
  };

  const handleChangeCommentType = (e: ChangeEvent<HTMLSelectElement>) => {
    const {
      target: { value },
    } = e;

    setLocalCommentType(value as Explorer.CommentType);
  };

  return (
    <>
      <p className="ml-2">Find comments permlinks by account name</p>
      <div className="flex flex-col">
        <AutocompleteInput
          value={accountName}
          onChange={setAccountName}
          placeholder="Author"
          inputType="account_name"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          required
        />
      </div>
      <SearchRanges
        rangesProps={searchRanges}
        safeTimeRangeDisplay
      />

      <div className="flex justify-start">
        <PostTypeSelector
          showLabel
          handleChange={handleChangeCommentType}
          commentType={localCommentType}
        />
      </div>
      <div className="flex items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onButtonClick}
          disabled={!accountName}
        >
          Search
          {permlinkSearchDataLoading && (
            <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
          )}
        </Button>
        {!accountName && (
          <label className="text-gray-300 dark:text-gray-500 ">
            Set author name
          </label>
        )}
      </div>
    </>
  );
};

export default CommentsPermlinkSearch;
