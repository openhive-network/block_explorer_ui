import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { config } from "@/Config";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  parseUrlFlagsIntoBooleanArray,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import useHandleCommentsSearch from "./hooks/useHandleCommentsSearch";

const CommentsSearch = () => {
  const {
    setCommentSearchProps,
    commentSearchProps,
    setCommentPaginationPage,
    setLastSearchKey,
    commentsSearchAccountName,
    setCommentsSearchAccountName,
    commentsSearchPermlink,
    setCommentsSearchPermlink,
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  } = useSearchesContext();

  const pathname = usePathname();
  const router = useRouter();

  const { isCommentSearchDataLoading } = useCommentSearch(commentSearchProps);
  const { handleCommentsSearch } = useHandleCommentsSearch();

  const { operationsTypes } = useOperationsTypes();

  const isCommentsPage = pathname?.startsWith("/comments") ?? false;

  const [accountName, setAccountName] = useState(
    commentsSearchAccountName || ""
  );

  const [permlink, setPermlink] = useState(commentsSearchPermlink || "");

  const infoText =
    "Find all operations related to comments of given account or for exact permlink.";

  const buttonLabel = "Set author name and permlink";

  const handleAccountNameChange = (value: string) => {
    setAccountName(value);
  };
  const handlePermlinkChange = (e: { target: { value: string } }) => {
    setPermlink(e.target.value);
  };

  const onSearchButtonClick = () => {
    handleCommentsSearch(accountName, permlink);
    setLastSearchKey("comment");
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
    setAccountName("");
    setPermlink("");
    setCommentsSearchPermlink(undefined);
    setCommentsSearchAccountName(undefined);
    setCommentSearchProps(undefined);
    setSelectedCommentSearchOperationTypes(null);
  };

  //Set parameters for inputs and selected operation types from url (if there are any) on initial load
  useEffect(() => {
    if (isCommentsPage) {
      const accountNameFromRoute = trimAccountName(
        (router.query.accountName?.[0] as string) ?? ""
      );
      const permlinkFromRoute = router.query.permlink ?? "";
      const filtersFromRoute = router.query.filters ?? "";

      setCommentsSearchAccountName(accountNameFromRoute);
      setCommentsSearchPermlink(permlinkFromRoute);

      if (!!filtersFromRoute) {
        const convertedFilters = convertBooleanArrayToIds(
          parseUrlFlagsIntoBooleanArray(filtersFromRoute as string)
        );
        setSelectedCommentSearchOperationTypes(convertedFilters);
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommentsPage, router.query]);

  useEffect(() => {
    if (!commentsSearchAccountName || commentsSearchPermlink) return;

    return () => handleClearCommentSearch();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsSearchAccountName, commentsSearchPermlink]);

  return (
    <>
      <p className="ml-2">{infoText}</p>
      <div className="flex flex-col">
        <AutocompleteInput
          value={accountName as string}
          onChange={handleAccountNameChange}
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
            onClick={onSearchButtonClick}
            className="mr-2 my-2"
            disabled={!accountName || !permlink}
          >
            Search
            {isCommentSearchDataLoading && (
              <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
            )}
          </Button>
          {(!accountName || !permlink) && (
            <label className="text-gray-300 dark:text-gray-500 ">
              {buttonLabel}
            </label>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentsSearch;
