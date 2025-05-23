import { Loader2 } from "lucide-react";

import Hive from "@/types/Hive";
import { convertOperationResultsToTableOperations } from "@/lib/utils";
import NoResult from "@/components/NoResult";
import OperationsTable from "@/components/OperationsTable";
import useURLParams from "@/hooks/common/useURLParams";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import AccountPagination from "../../AccountPagination";
import { defaultAccountOperationsTabSearchParams } from "./useAccountOperationsTabSearchRanges";

interface AccountOperationsSectionProps {
  accountOperations: Hive.AccountOperationsResponse | undefined;
  isAccountOperationsLoading: boolean;
}

const AccountOperationsSection: React.FC<AccountOperationsSectionProps> = ({
  accountOperations,
  isAccountOperationsLoading,
}) => {
  const { paramsState, setParams } = useURLParams(
    defaultAccountOperationsTabSearchParams,
    ["accountName"]
  );
  const { page: pageParam } = paramsState;

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations
  ) as Hive.AccountOperationsResponse;

  if (!isAccountOperationsLoading && !accountOperations?.total_operations) {
    return (
      <div>
        <NoResult />
      </div>
    );
  } else if (isAccountOperationsLoading) {
    return (
      <div className="flex justify-center text-center items-center">
        <Loader2 className="animate-spin mt-1 text-text h-12 w-12 ml-3 ..." />
      </div>
    );
  }
  return (
    <>
      <div
        className={
          "flex justify-center items-center text-text  sticky z-20 bg-explorer-bg-start my-4 top-[3.2rem] md:top-[4rem]"
        }
      >
        {accountOperations &&
          accountOperations.total_pages &&
          accountOperations.total_operations && (
            <AccountPagination
              page={pageParam ?? (accountOperations.total_pages || 0)}
              setPage={(page: number | undefined) =>
                setParams({ ...paramsState, page })
              }
              operationsCount={accountOperations.total_operations || 0}
            />
          )}
      </div>

      <OperationsTable
        operationCount={accountOperations?.total_operations || 0}
        operations={convertOperationResultsToTableOperations(
          formattedAccountOperations?.operations_result || []
        )}
        unformattedOperations={convertOperationResultsToTableOperations(
          accountOperations?.operations_result || []
        )}
        referrer="operations"
        accountName={
          paramsState.accountName?.startsWith("@")
            ? paramsState.accountName.slice(1)
            : paramsState.accountName
        }
      />
    </>
  );
};

export default AccountOperationsSection;
