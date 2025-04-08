import usePermlinkSearch from "@/hooks/api/common/usePermlinkSearch";
import CommentPermlinkResultTable from "../CommentPermlinkResultTable";
import { useSearchesContext } from "@/contexts/SearchesContext";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
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
          <div className="flex justify-center items-center text-text sticky z-20 pt-0 top-[3.2rem] md:top-[4rem]">
            <CustomPagination
              currentPage={permlinkPaginationPage}
              totalCount={permlinkSearchData.total_permlinks}
              pageSize={config.standardPaginationSize}
              onPageChange={changePermlinkSearchPagination}
              className="mb-4 rounded"
            />
          </div>

          <div className="flex flex-wrap">
            <CommentPermlinkResultTable
              permlinkCount={permlinkSearchData.total_permlinks}
              openCommentsSection={openCommentsSection}
              data={permlinkSearchData.permlinks_result}
              accountName={accountName}
            />
          </div>
        </div>
      ) : (
        <NoResult />
      )}
    </>
  );
};

export default CommentPermlinkSearchResults;
