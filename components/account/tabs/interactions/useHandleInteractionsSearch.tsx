import { useSearchesContext } from "@/contexts/SearchesContext";
import useURLParams from "@/hooks/common/useURLParams";
import { trimAccountName } from "@/utils/StringUtils";
import { convertIdsToBooleanArray } from "@/lib/utils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";

export const useHandleInteractionsSearch = () => {
  const { setParams } = useURLParams(DEFAULT_PARAMS, ["accountName"]);
  const { selectedCommentSearchOperationTypes } = useSearchesContext();

  // `filters` is the URL form (one flag per operation type). Without it the
  // last selection made in the operation types dialog is used.
  const handleCommentsSearch = (
    accountName: string,
    permlink: string,
    filters?: boolean[] | null
  ) => {
    if (!accountName) return;

    const selectedFilters =
      filters !== undefined
        ? filters
        : convertIdsToBooleanArray(selectedCommentSearchOperationTypes);

    const searchParams = {
      accountName: trimAccountName(accountName as string),
      activeTab: "interactions",
      permlink: permlink as string,
      filters: selectedFilters?.length ? selectedFilters : null,

      pageNumber: 1,
    } as any;

    setParams(searchParams);
  };

  return { handleCommentsSearch };
};
