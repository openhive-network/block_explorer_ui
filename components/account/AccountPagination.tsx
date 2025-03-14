import { config } from "@/Config";
import JumpToPage from "../JumpToPage";

import CustomPagination from "../CustomPagination";

interface AccountPaginationProps {
  page: number;
  setPage: (page: number | undefined) => void;
  operationsCount: number;
}

const AccountPagination: React.FC<AccountPaginationProps> = ({
  page,
  setPage,
  operationsCount,
}) => {
  const onLatestButtonClick = () => {
    setPage(undefined);
  };

  return (
    <div className="flex-col w-full">
      {operationsCount &&  Math.ceil(operationsCount / config.standardPaginationSize) > 1 && (
        <div
          className="flex w-full justify-center items-center flex-wrap bg-theme rounded"
          data-testid="account-top-bar"
        >
          <div className="flex items-center justify-center w-full md:ml-auto md:w-3/4">
            <CustomPagination
              handleLatestPage={onLatestButtonClick}
              currentPage={page}
              totalCount={operationsCount ?? 1}
              pageSize={config.standardPaginationSize}
              onPageChange={setPage}
              isMirrored={true}
            />
          </div>
          <div className="flex items-center mt-2 md:ml-auto w-full md:w-auto justify-center md:justify-end mb-2">
            <JumpToPage
              currentPage={page}
              onPageChange={setPage}
              totalCount={operationsCount ?? 1}
              pageSize={config.standardPaginationSize}
              
            />
          </div>
        </div>
    )}
    </div>
  );
};

export default AccountPagination;
