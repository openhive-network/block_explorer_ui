import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { config } from "@/Config";
import { getOperationButtonTitle } from "@/utils/UI";
import { Input } from "@/components/ui/input";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import { Button } from "@/components/ui/button";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";
import useURLParams from "@/hooks/common/useURLParams";
import { trimAccountName } from "@/utils/StringUtils";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import { useHandleInteractionsSearch } from "./useHandleInteractionsSearch";

export const DEFAULT_PARAMS = {
  accountName: "",
  permlink: undefined,
  filters: null,
  pageNumber: 1,
};

interface AccountPageInteractionSearchProps {
  isCommentSearchDataLoading: boolean;
}

const AccountPageInteractionSearch: React.FC<
  AccountPageInteractionSearchProps
> = ({ isCommentSearchDataLoading }) => {
  const {
    setLastSearchKey,
    setCommentPaginationPage,
    setSelectedCommentSearchOperationTypes,
  } = useSearchesContext();

  const { paramsState, setParams } = useURLParams(DEFAULT_PARAMS, [
    "accountName",
  ]);

  const accountName = trimAccountName(paramsState?.accountName ?? "");
  const { handleCommentsSearch } = useHandleInteractionsSearch();

  const handleClearCommentSearch = () => {
    const clearParams = {
      accountName,
      activeTab: "interactions",
    } as any;
    setPermlink("");
    setParams(clearParams);
  };

  const { operationsTypes } = useOperationsTypes();

  const [permlink, setPermlink] = useState("");

  const handlePermlinkChange = (e: { target: { value: string } }) => {
    setPermlink(e.target.value);
  };

  // Passing null if we want to reset operations
  const handleOperationSelect = (operationTypes: number[] | null) => {
    setSelectedCommentSearchOperationTypes(operationTypes);
    setCommentPaginationPage(1);

    const filters = convertIdsToBooleanArray(operationTypes);

    const props = {
      ...paramsState,
      accountName,
      filters,
      pageNumber: 1,
    } as any;

    setParams(props);
  };

  const infoText =
    "Find all operations related to comments for exact permlink.";

  const buttonLabel = "Set permlink";

  const onClickSearchButton = () => {
    setLastSearchKey("comment");
    handleCommentsSearch(accountName, permlink);
  };

  useEffect(() => {
    if (paramsState.permlink) {
      setPermlink(paramsState.permlink);
    }
  }, [paramsState.permlink]);

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
          setSelectedOperations={handleOperationSelect}
          buttonClassName="bg-buttonBg"
          selectedOperations={convertBooleanArrayToIds(
            paramsState.filters ?? []
          )}
          triggerTitle={getOperationButtonTitle(
            convertBooleanArrayToIds(paramsState.filters ?? []),
            operationsTypes
          )}
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Button
            data-testid="search-button"
            onClick={onClickSearchButton}
            className="mr-2 my-2"
            disabled={!permlink}
          >
            Search
            {isCommentSearchDataLoading && (
              <Loader2 className="ml-2 animate-spin h-4 w-4  ..." />
            )}
          </Button>
          {!permlink ? (
            <label className="text-gray-300 dark:text-gray-500 ">
              {buttonLabel}
            </label>
          ) : null}
        </div>
        <Button onClick={handleClearCommentSearch}>Clear</Button>
      </div>
    </>
  );
};

export default AccountPageInteractionSearch;
