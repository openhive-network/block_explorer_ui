import Link from "next/link";

import { config } from "@/Config";
import { Button } from "@/components//ui/button";
import CustomPagination from "@/components//CustomPagination";
import JumpToPage from "@/components//JumpToPage";
import OperationsTable from "@/components//OperationsTable";
import {
  cn,
  convertCommentsOperationResultToTableOperations,
} from "@/lib/utils";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import useCommentSearch from "@/hooks/api/common/useCommentSearch";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { getCommentPageLink } from "../utils/commentSearchHelpers";
import { usePathname } from "next/navigation";
import NoResult from "@/components/NoResult";

const CommentSearchResults = () => {
  const {
    commentSearchProps,
    commentPaginationPage,
    setCommentSearchProps,
    setCommentPaginationPage,
    searchRanges,
  } = useSearchesContext();

  const { commentSearchData } = useCommentSearch(commentSearchProps);
  const formattedCommentOperations = useOperationsFormatter(commentSearchData);
  const pathname = usePathname();

  const isCommentsPage = pathname?.includes("/comments") ?? false;

  if (!commentSearchData) return;

  const formattedOperations = convertCommentsOperationResultToTableOperations(
    formattedCommentOperations?.operations_result
  );

  const unformattedOperations = convertCommentsOperationResultToTableOperations(
    commentSearchData.operations_result
  );
  const commentPageLink = getCommentPageLink({
    ...commentSearchProps,
    ...searchRanges,
  });

  const changeCommentSearchPagination = (newPageNum: number) => {
    const newSearchProps: any = {
      ...commentSearchProps,
      pageNumber: newPageNum,
    };
    setCommentSearchProps(newSearchProps);
    setCommentPaginationPage(newPageNum);
  };

  return (
    <>
      {commentSearchData.operations_result.length ? (
        <div>
          <div className="flex flex-wrap justify-between items-center bg-theme p-2 gap-4 mb-4  sticky z-20 top-[3.2rem] md:top-[4rem]">
            <div className="flex justify-center w-full md:w-auto md:justify-start">
              {!isCommentsPage && (
                <Link href={commentPageLink}>
                  <Button data-testid="go-to-result-page">
                    Go to result page
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 flex-1 justify-center w-full">
              <CustomPagination
                currentPage={commentPaginationPage}
                totalCount={commentSearchData.total_operations}
                pageSize={config.standardPaginationSize}
                onPageChange={changeCommentSearchPagination}
              />
              <JumpToPage
                currentPage={commentPaginationPage}
                onPageChange={changeCommentSearchPagination}
                totalCount={commentSearchData.total_operations}
                pageSize={config.standardPaginationSize}
               
              />
            </div>
          </div>
          <OperationsTable
            operations={formattedOperations}
            unformattedOperations={unformattedOperations}
          />
        </div>
      ) : (
        <NoResult />
      )}
    </>
  );
};

export default CommentSearchResults;
