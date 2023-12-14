import CustomPagination from "../CustomPagination";
import JumpToPage from "../JumpToPage";
import OperationTypesDialog from "../OperationTypesDialog";
import ScrollTopButton from "../ScrollTopButton";
import { config } from "@/Config";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";

const AccountPagination = ({
  page,
  setPage,
  accountOperations,
  accountName,
  setOperationFilters,
  operationFilters,
}: any) => {
  const { accountOperationTypes } = useAccountOperationTypes(accountName);

  const handleFilterChange = (newFilters: number[]) => {
    setPage(undefined);
    setOperationFilters(newFilters);
  };

  return (
    <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-14 md:top-16 right-0 left-0 p-2 z-10">
      <div className="col-span-3 md:col-span-2 md:justify-self-end justify-self-center z-20 max-w-full">
        <CustomPagination
          currentPage={page}
          totalCount={accountOperations.total_operations || 0}
          pageSize={config.standardPaginationSize}
          onPageChange={(page: number) => setPage(page)}
        />
      </div>

      <div className="justify-self-end col-span-4 md:col-span-1">
        <div className="grid gap-x-3 grid-flow-row-dense grid-cols-3">
          <JumpToPage
            currentPage={page}
            onPageChange={(page: number) => setPage(page)}
          />
          <div className="justify-self-end self-center">
            <ScrollTopButton />
          </div>

          <OperationTypesDialog
            operationTypes={accountOperationTypes}
            setSelectedOperations={handleFilterChange}
            selectedOperations={operationFilters}
            colorClass="bg-explorer-dark-gray"
            triggerTitle={"Operation Filters"}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountPagination;
