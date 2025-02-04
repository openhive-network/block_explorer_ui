import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "../CommentPermlinkResultTable";
import { useSearchesContext } from "@/contexts/SearchesContext";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import { useRouter } from "next/router";
import AccountCommentPermlinkResultTable from "@/components/account/tabs/comments/AccountCommentPermlinkResultTable";
import NoResult from "@/components/NoResult";

const CommentPermlinkSearchResults = () => {
  const {
    permlinkSearchProps,
    setCommentsSearchAccountName,
    setCommentsSearchPermlink,
    setPermlinkSearchProps,
    permlinkPaginationPage,
    setPermlinkPaginationPage,
    setActiveSearchSection,
    setLastSearchKey,
  } = useSearchesContext();
  const router = useRouter();
  const isAccountPage = Boolean(router.query.accountName) || false;

  const { permlinkSearchData } = usePermlinkSearch(permlinkSearchProps);

  const accountName = permlinkSearchProps?.accountName;

  const openCommentsSection = (accountName: string, permlink: string) => {
    setLastSearchKey("comment");
    setActiveSearchSection("comment");
    setCommentsSearchAccountName(accountName);
    setCommentsSearchPermlink(permlink);
  };

  if (!permlinkSearchData) return;

  const changePermlinkSearchPagination = (newPageNum: number) => {
    const newSearchProps: any = {
      ...permlinkSearchProps,
      pageNumber: newPageNum,
    };
    setPermlinkSearchProps(newSearchProps);
    setPermlinkPaginationPage(newPageNum);
  };

  return (
    <>
      {permlinkSearchData.total_permlinks ? (
        <div>
          <div className="flex justify-center items-center text-text my-4 sticky z-20 top-[3.2rem] md:top-[4rem]">
            <CustomPagination
              currentPage={permlinkPaginationPage}
              totalCount={permlinkSearchData.total_permlinks}
              pageSize={config.standardPaginationSize}
              onPageChange={changePermlinkSearchPagination}
            />
          </div>

          <div className="flex flex-wrap">
            {isAccountPage ? (
              <AccountCommentPermlinkResultTable
                data={permlinkSearchData.permlinks_result}
                accountName={accountName}
              />
            ) : (
              <CommentPermlinkResultTable
                openCommentsSection={openCommentsSection}
                data={permlinkSearchData.permlinks_result}
                accountName={accountName}
              />
            )}
          </div>
        </div>
      ) : (
        <NoResult />
      )}
    </>
  );
};

export default CommentPermlinkSearchResults;
