import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { getOperationButtonTitle } from "@/utils/UI";
import { trimAccountName } from "@/utils/StringUtils";
import {
  cn,
  convertBooleanArrayToIds,
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

interface CommentsSearchProps {
  isAccountPage?: boolean;
}

const CommentsSearch: React.FC<CommentsSearchProps> = ({
  isAccountPage = false,
}) => {
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

  const { isCommentSearchDataLoading } = useCommentSearch(commentSearchProps);

  const { operationsTypes } = useOperationsTypes();

  const { getRangesValues } = searchRanges;
  const isCommentsPage = pathname?.startsWith("/comments") ?? false;

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
        operationTypes: selectedCommentSearchOperationTypes,
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
          operationTypes: selectedCommentSearchOperationTypes,
        });

        router.replace(commentPageLink);
      }
    }
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

  const handleClearCommentSearch = () => {
    setCommentSearchProps(undefined);
    setCommentsSearchPermlink("");
    setSelectedCommentSearchOperationTypes(null);
  };

  // Render data if there is comment search permlink present on account page
  useEffect(() => {
    if (isAccountPage && commentsSearchPermlink) {
      handleStartCommentSearch();
    }
    return () => {
      setCommentSearchProps(undefined);
      setSelectedCommentSearchOperationTypes(null);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountPage, commentsSearchPermlink]);

  const infoText = isAccountPage
    ? "Find all operations related to comments for exact permlink."
    : "Find all operations related to comments of given account or for exact permlink.";

  const buttonLabel = isAccountPage
    ? "Set permlink"
    : "Set author name and permlink";

  return (
    <>
      <p className="ml-2">{infoText}</p>
      {!isAccountPage ? (
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
      ) : null}

      <div
        className={cn("flex flex-col", {
          "my-5": isAccountPage,
        })}
      >
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
            onClick={handleStartCommentSearch}
            className="mr-2 my-2"
            disabled={!commentsSearchAccountName || !commentsSearchPermlink}
          >
            Search
            {isCommentSearchDataLoading && (
              <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
            )}
          </Button>
          {(!commentsSearchAccountName || !commentsSearchPermlink) && (
            <label className="text-gray-300 dark:text-gray-500 ">
              {buttonLabel}
            </label>
          )}
        </div>
        {isAccountPage ? (
          <Button onClick={handleClearCommentSearch}>Clear</Button>
        ) : null}
      </div>
    </>
  );
};

export default CommentsSearch;
