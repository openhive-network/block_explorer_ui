import { useEffect } from "react";
import Link from "next/link";

import { config } from "@/Config";
import { convertOperationResultsToTableOperations } from "@/lib/utils";
import Explorer from "@/types/Explorer";
import OperationsTable from "@/components/OperationsTable";
import JumpToPage from "@/components/JumpToPage";
import CustomPagination from "@/components/CustomPagination";
import { Button } from "@/components/ui/button";
import useOperationsFormatter from "@/hooks/common/useOperationsFormatter";
import { useSearchesContext } from "@/contexts/SearchesContext";
import useAccountOperations from "@/hooks/api/accountPage/useAccountOperations";
import ErrorPage from "@/pages/ErrorPage";
import { getAccountPageLink } from "../utils/accountSearchHelpers";

const AccountSearchResults = () => {
  const {
    accountOperationsSearchProps,
    setAccountOperationsPage,
    accountOperationsPage,
    previousAccountOperationsSearchProps,
    setAccountOperationsSearchProps,
    lastSearchKey,
    searchRanges,
  } = useSearchesContext();

  const { accountOperations, isAccountOperationsError } = useAccountOperations(
    accountOperationsSearchProps
  );

  const formattedAccountOperations = useOperationsFormatter(accountOperations);

  useEffect(() => {
    if (!accountOperationsPage && accountOperations) {
      setAccountOperationsPage(accountOperations?.total_pages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountOperations, accountOperationsPage]);

  if (isAccountOperationsError) {
    return <ErrorPage />;
  }
  if (!accountOperations) return;

  const formattedOperations = convertOperationResultsToTableOperations(
    formattedAccountOperations?.operations_result
  );

  const unformattedOperations = convertOperationResultsToTableOperations(
    accountOperations.operations_result
  );

  const changeAccountOperationsPagination = (newPageNum: number) => {
    if (previousAccountOperationsSearchProps?.accountName) {
      const newSearchProps: Explorer.AccountSearchOperationsProps = {
        ...previousAccountOperationsSearchProps,
        pageNumber: newPageNum,
      };
      setAccountOperationsSearchProps(newSearchProps);
      setAccountOperationsPage(newPageNum);
    }
  };

  const totalOperations = accountOperations.total_operations;
  const accountPageLink = getAccountPageLink(
    accountOperationsSearchProps,
    searchRanges
  );

  return (
    <>
      {accountOperations.total_operations > 0 ? (
        <div data-testid="operations-card">
          <Link href={accountPageLink}>
            <Button data-testid="go-to-result-page">Go to result page</Button>
          </Link>

          <div className="flex justify-center items-center text-black dark:text-white">
            <CustomPagination
              currentPage={accountOperationsPage || 1}
              totalCount={totalOperations}
              pageSize={config.standardPaginationSize}
              onPageChange={changeAccountOperationsPagination}
              isMirrored={true}
            />
          </div>
          <div className="flex justify-end items-center mb-4">
            <JumpToPage
              currentPage={accountOperationsPage || 1}
              onPageChange={changeAccountOperationsPagination}
            />
          </div>
          <OperationsTable
            operations={formattedOperations}
            unformattedOperations={unformattedOperations}
          />
        </div>
      ) : (
        <div className="flex justify-center w-full text-black dark:text-white">
          No operations matching given criteria
        </div>
      )}
    </>
  );
};

export default AccountSearchResults;
