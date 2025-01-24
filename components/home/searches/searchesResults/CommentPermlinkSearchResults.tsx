import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "../CommentPermlinkResultTable";
import { useSearchesContext } from "@/contexts/SearchesContext";
import { getCommentPageLink } from "../utils/commentSearchHelpers";
import PostTypeSelector from "../PostTypeSelector";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import { useRouter } from "next/router";
import AccountCommentPermlinkResultTable from "@/components/account/tabs/posts/AccountCommentPermlinkResultTable";
import NoResult from "@/components/NoResult";

const CommentPermlinkSearchResults = () => {
  const {
    permlinkSearchProps,
    commentType,
    setCommentType,
    setPermlinkSearchProps,
    searchRanges,
    permlinkPaginationPage,
    setPermlinkPaginationPage,
  } = useSearchesContext();
  const router = useRouter();
  const isAccountPage = Boolean(router.query.accountName) || false;

  const { permlinkSearchData } = usePermlinkSearch(permlinkSearchProps);

  const accountName = permlinkSearchProps?.accountName;

  const handleChangeCommentType = (e: any) => {
    const {
      target: { value },
    } = e;

    setCommentType(value);
    setPermlinkSearchProps((prev: any) => {
      return {
        ...prev,
        commentType: value,
      };
    });
  };

  const buildLink = (accountName: string, permlink: string) => {
    return getCommentPageLink({
      ...permlinkSearchProps,
      ...searchRanges,
      accountName,
      permlink,
    });
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
          <div className="flex justify-center items-center text-text">
            <CustomPagination
              currentPage={permlinkPaginationPage}
              totalCount={permlinkSearchData.total_permlinks}
              pageSize={config.standardPaginationSize}
              onPageChange={changePermlinkSearchPagination}
            />
          </div>
          <div className="flex justify-end my-4">
            <PostTypeSelector
              handleChange={handleChangeCommentType}
              commentType={commentType}
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
                buildLink={buildLink}
                data={permlinkSearchData.permlinks_result}
                accountName={accountName}
              />
            )}
          </div>
        </div>
      ) : (
        <NoResult/>
      )}
    </>
  );
};

export default CommentPermlinkSearchResults;
