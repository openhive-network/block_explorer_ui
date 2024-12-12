import Link from "next/link";

import { config } from "@/Config";
import Explorer from "@/types/Explorer";
import { Button } from "@/components//ui/button";
import CustomPagination from "@/components//CustomPagination";
import JumpToPage from "@/components//JumpToPage";
import OperationsTable from "@/components//OperationsTable";
import { convertCommentsOperationResultToTableOperations } from "@/lib/utils";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { getCommentPageLink } from "../utils/commentSearchHelpers";

const CommentSearchResults = () => {
  const {
    commentSearchProps,
    lastSearchKey,
    commentPaginationPage,
    previousCommentSearchProps,
    setCommentSearchProps,
    setCommentPaginationPage,
    searchRanges,
  } = useSearchesContext();

  const { commentSearchData } = useCommentSearch(commentSearchProps);
  const formattedCommentOperations = useOperationsFormatter(commentSearchData);

  if (!commentSearchData) return;

  const formattedOperations = convertCommentsOperationResultToTableOperations(
    formattedCommentOperations?.operations_result
  );

  const unformattedOperations = convertCommentsOperationResultToTableOperations(
    commentSearchData.operations_result
  );
  const commentPageLink = getCommentPageLink(commentSearchProps, searchRanges);

  const changeCommentSearchPagination = (newPageNum: number) => {
    if (previousCommentSearchProps?.accountName) {
      const newSearchProps: Explorer.CommentSearchProps = {
        ...previousCommentSearchProps,
        pageNumber: newPageNum,
      };
      setCommentSearchProps(newSearchProps);
      setCommentPaginationPage(newPageNum);
    }
  };

  return (
    <>
      {commentSearchData.operations_result.length ? (
        <div>
          <Link href={commentPageLink}>
            <Button data-testid="go-to-result-page">Go to result page</Button>
          </Link>

          <div className="flex justify-center items-center text-black dark:text-white">
            <CustomPagination
              currentPage={commentPaginationPage}
              totalCount={commentSearchData.total_operations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeCommentSearchPagination}
            />
          </div>
          <div className="flex justify-end items-center mb-4">
            <JumpToPage
              currentPage={commentPaginationPage}
              onPageChange={changeCommentSearchPagination}
            />
          </div>

          <OperationsTable
            operations={formattedOperations}
            unformattedOperations={unformattedOperations}
          />
        </div>
      ) : (
        <div className="flex justify-center w-full text-black dark:text-white">
          No operations matching given criteria
        </div>
      )}
    </>
  );
};

export default CommentSearchResults;
