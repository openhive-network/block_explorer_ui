import { useSearchesContext } from "@/contexts/SearchesContext";
import useURLParams from "@/hooks/common/useURLParams";
import { trimAccountName } from "@/utils/StringUtils";
import { DEFAULT_PARAMS } from "./AccountPageInteractionSearch";

export const useHandleInteractionsSearch = () => {
  const { setParams } = useURLParams(DEFAULT_PARAMS, ["accountName"]);
  const { selectedCommentSearchOperationTypes } = useSearchesContext();

  const handleCommentsSearch = (accountName: string, permlink: string) => {
    if (!accountName) return;

    const searchParams = {
      accountName: trimAccountName(accountName as string),
      activeTab: "interactions",
      permlink: permlink as string,
      filters:
        selectedCommentSearchOperationTypes &&
        selectedCommentSearchOperationTypes?.length
          ? selectedCommentSearchOperationTypes
          : null,

      pageNumber: 1,
    } as any;

    setParams(searchParams);
  };

  return { handleCommentsSearch };
};
