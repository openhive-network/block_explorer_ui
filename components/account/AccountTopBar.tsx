import Hive from "@/types/Hive";
import JumpToPage from "../JumpToPage";
import { config } from "@/Config";
import OperationTypesDialog from "../OperationTypesDialog";
import { getOperationButtonTitle } from "@/utils/UI";
import {
  cn,
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import CustomPagination from "../CustomPagination";
import { Button } from "../ui/button";

interface AccountTopBarProps {
  page: number;
  setPage: (page: number | undefined) => void;
  isLastPage: boolean;
  accountOperations: Hive.OperationsCount;
  accountOperationTypes: Hive.OperationPattern[];
  onOperationsSelect: (filters: boolean[]) => void;
  selectedFilters: boolean[];
}

const AccountTopBar: React.FC<AccountTopBarProps> = ({
  page,
  setPage,
  isLastPage,
  accountOperations,
  accountOperationTypes,
  onOperationsSelect,
  selectedFilters,
}) => {
  const handleOperationSelect = (filters: number[]) => {
    onOperationsSelect(convertIdsToBooleanArray(filters));
  };

  const onLatestButtonClick = () => {
    setPage(undefined);
  }

  return (
    <div
      className="bg-explorer-orange flex items-stretch justify-center w-full flex-wrap mb-2 mt-3"
      data-testid="account-top-bar"
    >
      <div className="flex justify-center items-center mx-4">
        <Button className={cn("rounded", {"bg-white": isLastPage})} onClick={onLatestButtonClick}>
          Latest
        </Button>
      </div>
      <div className="flex justify-center items-center mx-4">
        <CustomPagination
          currentPage={page}
          totalCount={accountOperations.total_operations || 0}
          pageSize={config.standardPaginationSize}
          onPageChange={setPage}
        />
      </div>
      <div className="my-1 flex gap-x-2">
        <OperationTypesDialog
          operationTypes={accountOperationTypes}
          setSelectedOperations={handleOperationSelect}
          selectedOperations={convertBooleanArrayToIds(selectedFilters)}
          buttonClassName="bg-explorer-dark-gray"
          triggerTitle={getOperationButtonTitle(
            convertBooleanArrayToIds(selectedFilters),
            accountOperationTypes
          )}
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
    </div>
  );
};

export default AccountTopBar;
