import CustomPagination from "@/components/CustomPagination";
import { config } from "@/Config";
import AccountCommentPermlinkResultTable from "@/components/account/tabs/comments/AccountCommentPermlinkResultTable";
import NoResult from "@/components/NoResult";
import Hive from "@/types/Hive";
import useURLParams from "@/hooks/common/useURLParams";

interface AccountCommentPermlinkSearchResultsProps {
  data: Hive.CommentPermlinksResponse | null | undefined;
  accountName: string;
}

const AccountCommentPermlinkSearchResults: React.FC<
  AccountCommentPermlinkSearchResultsProps
> = ({ data, accountName }) => {
  const { paramsState, setParams } = useURLParams({ pageNumber: 1 }, [
    "accountName",
  ]);

  if (!data) return;

  return (
    <>
      {data.total_permlinks ? (
        <div>
          <div className="rounded flex justify-center items-center text-text sticky z-20 top-[3.2rem] md:top-[4rem]">
            <CustomPagination
              currentPage={paramsState?.pageNumber}
              totalCount={data.total_permlinks}
              pageSize={config.standardPaginationSize}
              onPageChange={(page: number) =>
                setParams({ ...paramsState, pageNumber: page })
              }
              className="rounded"
            />
          </div>

          <div className="flex flex-wrap mt-4">
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
