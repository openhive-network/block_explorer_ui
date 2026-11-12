import Hive from "@/types/Hive";
import { convertOperationResultsToTableOperations } from "@/lib/utils";
import NoResult from "@/components/NoResult";
import OperationsTable from "@/components/OperationsTable";
import useURLParams from "@/hooks/common/useURLParams";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import AccountPagination from "../../AccountPagination";
import { defaultAccountOperationsTabSearchParams } from "./useAccountOperationsTabSearchRanges";
import { useI18n } from "@/i18n/i18n";

interface AccountOperationsSectionProps {
  accountOperations: Hive.AccountOperationsResponse | undefined;
  isAccountOperationsLoading: boolean;
  // Showing the previous page or filter while the new results load.
  isAccountOperationsPlaceholder?: boolean;
}

const AccountOperationsSection: React.FC<AccountOperationsSectionProps> = ({
  accountOperations,
  isAccountOperationsLoading,
  isAccountOperationsPlaceholder = false,
}) => {
  const { t } = useI18n();
  const { paramsState, setParams } = useURLParams(
    defaultAccountOperationsTabSearchParams,
    ["accountName"]
  );
  const { page: pageParam } = paramsState;

  const formattedAccountOperations = useOperationsFormatter(
    accountOperations
  ) as Hive.AccountOperationsResponse;

  if (
    !isAccountOperationsLoading &&
    !isAccountOperationsPlaceholder &&
    !accountOperations?.total_operations
  ) {
    return (
      <div>
        <NoResult />
      </div>
    );
  }
  return (
    <>
      <div
        className={
          "flex justify-center items-center text-text sticky z-20 bg-explorer-bg-start top-[3.2rem] md:top-16 rounded-t-sm"
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
        referrer={t("accountOperationViewTabs.operations").toLowerCase()}
        isLoading={isAccountOperationsLoading || isAccountOperationsPlaceholder}
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
