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

interface AccountPaginationProps {
  accountName: string;
  page: number;
  setPage: (page: number | undefined) => void;
  accountOperations: Hive.OperationsCount;
  onOperationsSelect: (filters: boolean[]) => void;
  selectedFilters: boolean[];
}

const AccountPagination: React.FC<AccountPaginationProps> = ({
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
    <div className="flex-col w-full">
      <div className="flex justify-end w-full flex-wrap">
        <OperationTypesDialog
          operationTypes={accountOperationTypes}
          setSelectedOperations={handleOperationSelect}
          selectedOperations={convertBooleanArrayToIds(selectedFilters)}
          buttonClassName="bg-theme"
          triggerTitle={getOperationButtonTitle(
            convertBooleanArrayToIds(selectedFilters),
            accountOperationTypes
          )}
        />
      </div>
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
