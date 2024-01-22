import Hive from "@/types/Hive";
import CustomPagination from "../CustomPagination";
import JumpToPage from "../JumpToPage";
import { config } from "@/Config";
import OperationTypesDialog from "../OperationTypesDialog";
import { getOperationButtonTitle } from "@/utils/UI";

interface AccountTopBarProps {
  page: number;
  setPage: (page: number) => void;
  accountOperations: Hive.OperationsCount;
  accountOperationTypes: Hive.OperationPattern[];
  onOperationsSelect: (filters: number[]) => void;
  selectedFilters: number[];
}

const AccountTopBar: React.FC<AccountTopBarProps> = ({
  page,
  setPage,
  accountOperations,
  accountOperationTypes,
  onOperationsSelect,
  selectedFilters,
}) => {
  return (
    <div className="bg-explorer-orange flex items-stretch justify-center w-full flex-wrap m-2">
      <div className="flex justify-center">
        <CustomPagination
          currentPage={page}
          totalCount={accountOperations.total_operations || 0}
          pageSize={config.standardPaginationSize}
          onPageChange={setPage}
          isMirrored={true}
          className="flex-grows"
        />
        <div className="flex-grow flex justify-between max-w-xl lg:max-w-full">
          <div className="flex items-center ">
            <JumpToPage
              currentPage={page}
              onPageChange={setPage}
              className="flex-shrink"
            />
          </div>
        </div>
      </div>
      <div className="my-1">
        <OperationTypesDialog
          operationTypes={accountOperationTypes}
          setSelectedOperations={onOperationsSelect}
          selectedOperations={selectedFilters}
          buttonClassName="bg-explorer-dark-gray"
          triggerTitle={getOperationButtonTitle(selectedFilters, accountOperationTypes)}
        />
      </div>
    </div>
  );
};

export default AccountTopBar;
