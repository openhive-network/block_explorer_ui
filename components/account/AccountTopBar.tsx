import { config } from "@/Config";
import Hive from "@/types/Hive";
import { getOperationButtonTitle } from "@/utils/UI";
import {
  convertBooleanArrayToIds,
  convertIdsToBooleanArray,
} from "@/lib/utils";
import useAccountOperationTypes from "@/hooks/api/accountPage/useAccountOperationTypes";
import JumpToPage from "../JumpToPage";
import OperationTypesDialog from "../OperationTypesDialog";
import CustomPagination from "../CustomPagination";

interface AccountTopBarProps {
  accountName: string;
  page: number;
  setPage: (page: number | undefined) => void;
  accountOperations: Hive.OperationsCount;
  onOperationsSelect: (filters: boolean[]) => void;
  selectedFilters: boolean[];
}

const AccountTopBar: React.FC<AccountTopBarProps> = ({
  accountName,
  page,
  setPage,
  accountOperations,
  onOperationsSelect,
  selectedFilters,
}) => {
  const handleOperationSelect = (filters: number[]) => {
    onOperationsSelect(convertIdsToBooleanArray(filters));
  };

  const onLatestButtonClick = () => {
    setPage(undefined);
  };

  const { accountOperationTypes } = useAccountOperationTypes(accountName);

  return (
    <div
      className="bg-explorer-orange flex items-stretch justify-center w-full flex-wrap mb-2 mt-3"
      data-testid="account-top-bar"
    >
      <div className="flex justify-center items-center mx-4">
        <CustomPagination
          handleLatestPage={onLatestButtonClick}
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
          buttonClassName="bg-explorer-gray-light dark:bg-explorer-gray-dark"
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
