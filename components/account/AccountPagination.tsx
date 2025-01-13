import { config } from "@/Config";
import Hive from "@/types/Hive";
import JumpToPage from "../JumpToPage";

import CustomPagination from "../CustomPagination";

interface AccountPaginationProps {
  page: number;
  setPage: (page: number | undefined) => void;
  accountOperations: Hive.OperationsCount;
}

const AccountPagination: React.FC<AccountPaginationProps> = ({
  page,
  setPage,
  accountOperations,
}) => {
  const onLatestButtonClick = () => {
    setPage(undefined);
  };

  return (
    <div className="flex-col w-full">
      <div
        className="flex w-full justify-center flex-wrap my-4"
        data-testid="account-top-bar"
      >
        <div className="items-center mx-4">
          <CustomPagination
            handleLatestPage={onLatestButtonClick}
            currentPage={page}
            totalCount={accountOperations.total_operations || 0}
            pageSize={config.standardPaginationSize}
            onPageChange={setPage}
            isMirrored={true}
          />
        </div>
        <div className="flex items-center ">
          <JumpToPage
            currentPage={page}
            onPageChange={setPage}
            className="flex-shrink"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountPagination;
