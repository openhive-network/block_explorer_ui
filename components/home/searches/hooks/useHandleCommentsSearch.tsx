import { useRouter } from "next/router";

import Explorer from "@/types/Explorer";
import { trimAccountName } from "@/utils/StringUtils";
import { getCommentPageLink } from "../utils/commentSearchHelpers";
import { useSearchesContext } from "@/contexts/SearchesContext";

const useHandleCommentsSearch = () => {
  const {
    setCommentSearchProps,
    setCommentPaginationPage,
    commentPaginationPage,
    searchRanges,
    commentsSearchAccountName,
    commentsSearchPermlink,
    selectedCommentSearchOperationTypes,
  } = useSearchesContext();
  const router = useRouter();

  const isCommentsPage = router.query.comments ? true : false;

  const { getRangesValues } = searchRanges;

  const handleCommentsSearch = async (
    accountName = commentsSearchAccountName,
    permlink = commentsSearchPermlink
  ) => {
    if (accountName !== "") {
      const {
        payloadFromBlock,
        payloadToBlock,
        payloadStartDate,
        payloadEndDate,
      } = await getRangesValues();

      const searchProps: Explorer.CommentSearchParams = {
        accountName: trimAccountName(accountName as string),
        permlink: permlink as string,
        fromBlock: payloadFromBlock,
        toBlock: payloadToBlock,
        startDate: payloadStartDate,
        endDate: payloadEndDate,
        operationTypes:
          selectedCommentSearchOperationTypes &&
          selectedCommentSearchOperationTypes?.length
            ? selectedCommentSearchOperationTypes
            : null,
        lastBlocks:
          searchRanges.rangeSelectKey === "lastBlocks"
            ? searchRanges.lastBlocksValue
            : undefined,
        lastTime: searchRanges.lastTimeUnitValue,
        page: commentPaginationPage,
        rangeSelectKey: searchRanges.rangeSelectKey,
        timeUnit: searchRanges.timeUnitSelectKey,
      };

      setCommentSearchProps(searchProps as any);
      setCommentPaginationPage(1);

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

  return { handleCommentsSearch };
};

export default useHandleCommentsSearch;
