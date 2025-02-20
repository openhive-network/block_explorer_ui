import { useSearchesContext } from "@/contexts/SearchesContext";
import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import AccountCommentPermlinkResultTable from "@/components/account/tabs/comments/AccountCommentPermlinkResultTable";
import NoResult from "@/components/NoResult";
import Hive from "@/types/Hive";

interface AccountCommentPermlinkSearchResultsProps {
  data: Hive.CommentPermlinksResponse | null | undefined;
  accountName: string;
}

const AccountCommentPermlinkSearchResults: React.FC<
  AccountCommentPermlinkSearchResultsProps
> = ({ data, accountName }) => {
  const {
    permlinkSearchProps,
    setPermlinkSearchProps,
    permlinkPaginationPage,
    setPermlinkPaginationPage,
  } = useSearchesContext();

  const changePermlinkSearchPagination = (newPageNum: number) => {
    const newSearchProps: any = {
      ...permlinkSearchProps,
      pageNumber: newPageNum,
    };
    setPermlinkSearchProps(newSearchProps);
    setPermlinkPaginationPage(newPageNum);
  };

  if (!data) return;

  return (
    <>
      {data.total_permlinks ? (
        <div>
          <div className="flex justify-center items-center text-text my-4 sticky z-20 top-[3.2rem] md:top-[4rem]">
            <CustomPagination
              currentPage={permlinkPaginationPage}
              totalCount={data.total_permlinks}
              pageSize={config.standardPaginationSize}
              onPageChange={changePermlinkSearchPagination}
            />
          </div>

          <div className="flex flex-wrap">
            <AccountCommentPermlinkResultTable
              data={data.permlinks_result}
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

export default AccountCommentPermlinkSearchResults;
