import Hive from "@/types/Hive";
import CustomPagination from "../CustomPagination";
import JumpToPage from "../JumpToPage";
import ScrollTopButton from "../ScrollTopButton";
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
  selectedFilters
}) => {
  return (
    <div className="bg-explorer-orange flex w-full items-center justify-center flex-wrap py-2 max-w-6xl">
      <CustomPagination
        currentPage={page}
        totalCount={accountOperations.total_operations || 0}
        pageSize={config.standardPaginationSize}
        onPageChange={setPage}
        isMirrored={true}
        className="flex-grows"
      />
      <div className="flex-grow flex justify-between max-w-xl lg:max-w-full">
        <div className="flex">
          <JumpToPage
            currentPage={page}
            onPageChange={setPage}
            className="flex-shrink"
          />
          <ScrollTopButton />
        </div>
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
