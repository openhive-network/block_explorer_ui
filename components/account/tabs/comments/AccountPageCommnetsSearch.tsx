import { useState } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import { getOperationButtonTitle } from "@/utils/UI";
import { Input } from "@/components/ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import useHandleCommentsSearch from "@/components/home/searches/hooks/useHandleCommentsSearch";

const AccountPageCommentsSearch = () => {
  const {
    setCommentSearchProps,
    commentSearchProps,
    setCommentPaginationPage,
    commentsSearchPermlink,
    setCommentsSearchPermlink,
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  } = useSearchesContext();

  const { isCommentSearchDataLoading } = useCommentSearch(commentSearchProps);
  const { handleCommentsSearch } = useHandleCommentsSearch();

  const { operationsTypes } = useOperationsTypes();

  const [permlink, setPermlink] = useState(commentsSearchPermlink || "");

  const handlePermlinkChange = (e: { target: { value: string } }) => {
    setPermlink(e.target.value);
  };

  // Passing null if we want to reset operations
  const handleOperationSelect = (operationTypes: number[] | null) => {
    setSelectedCommentSearchOperationTypes(operationTypes);
    setCommentPaginationPage(1);
    setCommentSearchProps((prev: any) => {
      return {
        ...prev,
        operationTypes,
        pageNumber: 1,
      };
    });
  };

  const handleClearCommentSearch = () => {
    setCommentsSearchPermlink("");
    setPermlink("");
    setCommentSearchProps(undefined);
    setSelectedCommentSearchOperationTypes(null);
  };

  const infoText =
    "Find all operations related to comments for exact permlink.";

  const buttonLabel = "Set permlink";

  return (
    <>
      <p className="ml-2">{infoText}</p>

      <div className={"flex flex-col my-5"}>
        <Input
          data-testid="permlink-input"
          className="w-1/2 bg-theme dark:bg-theme border-0 border-b-2"
          type="text"
          value={permlink}
          onChange={handlePermlinkChange}
          placeholder="Permlink *"
          required
        />
      </div>
      <div className="flex items-center my-2">
        <OperationTypesDialog
          operationTypes={operationsTypes?.filter((opType) =>
            config.commentOperationsTypeIds.includes(opType.op_type_id)
          )}
          selectedOperations={selectedCommentSearchOperationTypes || []}
          setSelectedOperations={handleOperationSelect}
          buttonClassName="bg-buttonBg"
          triggerTitle={getOperationButtonTitle(
            selectedCommentSearchOperationTypes,
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Button
            data-testid="search-button"
            onClick={() => handleCommentsSearch()}
            className="mr-2 my-2"
            disabled={!permlink}
          >
            Search
            {isCommentSearchDataLoading && (
              <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
            )}
          </Button>
          {!permlink && (
            <label className="text-gray-300 dark:text-gray-500 ">
              {buttonLabel}
            </label>
          )}
        </div>
        <Button onClick={handleClearCommentSearch}>Clear</Button>
      </div>
    </>
  );
};

export default AccountPageCommentsSearch;
