import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
  parseUrlFlagsIntoBooleanArray,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import AutocompleteInput from "@/components/ui/AutoCompleteInput";
import {
  getCommentPageLink,
  startCommentSearch,
} from "./utils/commentSearchHelpers";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

const CommentsSearch = () => {
  const {
    setCommentSearchProps,
    commentSearchProps,
    setCommentPaginationPage,
    commentPaginationPage,
    setPreviousCommentSearchProps,
    setLastSearchKey,
    searchRanges,
    commentsSearchAccountName,
    setCommentsSearchAccountName,
    commentsSearchPermlink,
    setCommentsSearchPermlink,
    selectedCommentSearchOperationTypes,
    setSelectedCommentSearchOperationTypes,
  } = useSearchesContext();

  const pathname = usePathname();
  const router = useRouter();

  const { commentSearchDataLoading } = useCommentSearch(commentSearchProps);

  const { operationsTypes } = useOperationsTypes();

  const { getRangesValues } = searchRanges;
  const isCommentsPage = pathname?.includes("/comments") ?? false;

  const handleStartCommentSearch = async () => {
    if (commentsSearchAccountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const searchProps: Explorer.CommentSearchParams = {
        accountName: trimAccountName(commentsSearchAccountName as string),
        permlink: commentsSearchPermlink as string,
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
        searchProps,
        setCommentSearchProps,
        setCommentPaginationPage,
        setPreviousCommentSearchProps,
        (val: "comment") => setLastSearchKey(val)
      );
      // change url on comments page when filters are applied
      if (isCommentsPage) {
        const commentPageLink = getCommentPageLink({
          ...searchProps,
          ...searchRanges,
          operationTypes: searchProps?.filters?.length
            ? convertBooleanArrayToIds(searchProps.filters)
            : undefined,
        });

        router.replace(commentPageLink);
      }
    }
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
  }, [isCommentsPage, router.query]);

  return (
    <>
      <p className="ml-2">
        Find all operations related to comments of given account or for exact
        permlink.
      </p>
      <div className="flex flex-col">
        <AutocompleteInput
          value={commentsSearchAccountName as string}
          onChange={setCommentsSearchAccountName}
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
          value={commentsSearchPermlink}
          onChange={(e) => setCommentsSearchPermlink(e.target.value)}
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
          onClick={handleStartCommentSearch}
          className="mr-2 my-2"
          disabled={!commentsSearchAccountName || !commentsSearchPermlink}
        >
          Search
          {commentSearchDataLoading && (
            <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
          )}
        </Button>
        {!commentsSearchAccountName && (
          <label className="text-gray-300 dark:text-gray-500 ">
            Set author name and permlink
          </label>
        )}
      </div>
    </>
  );
};

export default CommentsSearch;
