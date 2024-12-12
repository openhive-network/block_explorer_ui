import { useState } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { startCommentSearch } from "./utils/commentSearchHelpers";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";

const CommentsSearch = () => {
  const {
    setCommentSearchProps,
    commentSearchProps,
    setCommentPaginationPage,
    commentPaginationPage,
    setPreviousCommentSearchProps,
    setLastSearchKey,
    searchRanges,
  } = useSearchesContext();

  const { commentSearchDataLoading } = useCommentSearch(commentSearchProps);

  const { operationsTypes } = useOperationsTypes();

  const [accountName, setAccountName] = useState<string>("");
  const [permlink, setPermlink] = useState<string>("");
  const [
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  ] = useState<number[]>([]);

  const { getRangesValues } = searchRanges;

  const onButtonClick = async () => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const commentSearchProps: Explorer.CommentSearchParams = {
        accountName: trimAccountName(accountName),
        permlink,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        filters: selectedCommentSearchOperationTypes.length
          ? convertIdsToBooleanArray(selectedCommentSearchOperationTypes)
          : undefined,
        lastBlocks:
          searchRanges.rangeSelectKey === "lastBlocks"
            ? searchRanges.lastBlocksValue
            : undefined,
        lastTime: searchRanges.lastTimeUnitValue,
        page: commentPaginationPage,
        rangeSelectKey: searchRanges.rangeSelectKey,
        timeUnit: searchRanges.timeUnitSelectKey,
      };
      startCommentSearch(
        commentSearchProps,
        setCommentSearchProps,
        setCommentPaginationPage,
        setPreviousCommentSearchProps,
        (val: "comment") => setLastSearchKey(val)
      );
    }
  };

  return (
    <>
      <p className="ml-2">
        Find all operations related to comments of given account or for exact
        permlink.
      </p>
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
      <div className="flex flex-col">
        <Input
          data-testid="permlink-input"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          type="text"
          value={permlink}
          onChange={(e) => setPermlink(e.target.value)}
          placeholder="Permlink *"
          required
        />
      </div>
      <div className="flex items-center my-2">
        <OperationTypesDialog
          operationTypes={operationsTypes?.filter((opType) =>
            config.commentOperationsTypeIds.includes(opType.op_type_id)
          )}
          selectedOperations={selectedCommentSearchOperationTypes}
          setSelectedOperations={setSelectedCommentSearchOperationTypes}
          buttonClassName="bg-buttonBg"
          triggerTitle={getOperationButtonTitle(
            selectedCommentSearchOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center">
        <Button
          data-testid="search-button"
          className="mr-2 my-2"
          onClick={onButtonClick}
          disabled={!accountName || !permlink}
        >
          Search
          {commentSearchDataLoading && (
            <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
          )}
        </Button>
        {!accountName && (
          <label className="text-gray-300 dark:text-gray-500 ">
            Set author name and permlink
          </label>
        )}
      </div>
    </>
  );
};

export default CommentsSearch;
