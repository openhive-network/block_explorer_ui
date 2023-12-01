import { useEffect, useState } from "react";
import AccountDetailsCard from "../../components/account/AccountDetailsCard";
import fetchingService from "@/services/FetchingService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import CustomPagination from "../../components/CustomPagination";
import Hive from "@/types/Hive";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import JSONCard from "@/components/JSONCard";
import AccountMainCard from "@/components/account/AccountMainCard";
import AccountWitnessVotesCard from "@/components/account/AccountWitnessVotesCard";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import ScrollTopButton from "@/components/ScrollTopButton";
import MainModule from "@hive/wax";
import PageNotFound from "@/components/PageNotFound";

const FILTERS = "filters";
const PAGE = "page";
const SPLIT = "-";
const OPERATIONS_LIMIT = 100;

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;
  const { filters, page } = router.query;

  const [pageNum, setPageNum] = useState((page && Number(page)) || 1);
  const [operationFilters, setOperationFilters] = useState<number[]>(
    (filters as string)?.split(SPLIT).map((filter) => Number(filter)) || []
  );
  const [openVotersModal, setOpenVotersModal] = useState(false);

  // Account details
  const {
    data: accountDetails,
  }: UseQueryResult<Hive.AccountDetailsQueryResponse> = useQuery({
    queryKey: ["account_details", accountNameFromRoute],
    queryFn: () => fetchingService.getAccount(accountNameFromRoute),
    refetchOnWindowFocus: false,
  });

  // Account operations
  const {
    data: accountOperations,
    isLoading: isAccountOperationsLoading,
  }: UseQueryResult<Hive.OperationResponse[]> = useQuery({
    queryKey: [
      "account_operations",
      accountNameFromRoute,
      pageNum,
      operationFilters,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountNameFromRoute,
        pageNum,
        OPERATIONS_LIMIT,
        operationFilters
      ),
    refetchOnWindowFocus: false,
  });

  const { data: operationsCount } = useQuery({
    queryKey: ["operations_count", operationFilters],
    queryFn: () =>
      fetchingService.getAccountOperationsCount(
        operationFilters,
        accountNameFromRoute
      ),
    refetchOnWindowFocus: false,
  });

  // Account operation types (filters)
  const {
    data: accountOperationTypes,
  }: UseQueryResult<Hive.OperationPattern[]> = useQuery({
    queryKey: ["account_operation_types", accountNameFromRoute],
    queryFn: () => fetchingService.getAccOpTypes(accountNameFromRoute),
    refetchOnWindowFocus: false,
  });

  // Witness data
  const { data: witnessDetails }: UseQueryResult<Hive.Witness> = useQuery({
    queryKey: ["account_witness_details", accountNameFromRoute],
    queryFn: () => fetchingService.getWitness(accountNameFromRoute),
    enabled: !!accountNameFromRoute && !!accountDetails?.is_witness,
    refetchOnWindowFocus: false,
  });

  const { data: witnessVoters }: UseQueryResult<Hive.Voter[]> = useQuery({
    queryKey: ["account_witness_voters", accountNameFromRoute],
    queryFn: () =>
      fetchingService.getWitnessVoters(accountNameFromRoute, "vests", "desc"),
    enabled: !!accountNameFromRoute && !!accountDetails?.is_witness,
    refetchOnWindowFocus: false,
  });

  const handlePageChange = (page: number) => {
    setPageNum(page);
    router.replace({query: { ...router.query, [PAGE]: page }});
  }

  useEffect(() => {
    page && handlePageChange(Number(page));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleFilterChange = (filters: number[]) => {
    setOperationFilters(filters);
    if (!!filters.length) {
      router.replace({
        query: { ...router.query, [FILTERS]: filters.join(SPLIT) },
      });
    } else {
      delete router.query[FILTERS];
      router.replace({
        query: { ...router.query },
      });
    }
  };

  useEffect(() => {
    filters &&
      handleFilterChange(
        (filters as string)?.split(SPLIT).map((filter) => Number(filter))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const calculateManabar = async () => {
    const mainModule = await MainModule();
    const protocolProvider = new mainModule.protocol();
    const result =
      // params: const int32_t now, const int32_t max_mana_low, const int32_t max_mana_high, const int32_t current_mana_low, const int32_t current_mana_high, const uint32_t last_update_time
      protocolProvider.cpp_calculate_current_manabar_value(
        0, // Current timestamp a number
        100, // Next two values are taken from API. Use long library to get high and low numbers. Max mana supply. Low first, high second.
        100,
        0, // As before, value taken from API, handled with long library. Current mana supply. Low first, high second.
        0,
        0 // Last update time from API as number timestamp
      );
    console.log("TEST", JSON.stringify(result));
  };

  if (!accountDetails || !accountOperationTypes) {
    return "Loading ...";
  }
  if (!accountOperations?.length && !isAccountOperationsLoading) {
    return <PageNotFound message={`Account not found.`} />;
  }

  const handleOpenVotersModal = () => {
    setOpenVotersModal(!openVotersModal);
  };

  return (
    <>
      <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-14 md:top-16 right-0 left-0 p-2 z-50">
        <div className="col-span-3 md:col-span-2 md:justify-self-end justify-self-center z-20 max-w-full">
          <CustomPagination
            currentPage={pageNum}
            totalCount={
              !!operationsCount && !isNaN(operationsCount)
                ? operationsCount
                : accountDetails.ops_count
            }
            pageSize={OPERATIONS_LIMIT}
            onPageChange={(page: number) => handlePageChange(page)}
          />
        </div>

        <div className="justify-self-end col-span-3 md:col-span-1">
          <div className="grid gap-x-5 grid-flow-row-dense grid-cols-2">
            <div className="justify-self-end self-center">
              <ScrollTopButton />
            </div>
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setSelectedOperations={(filters) => {handleFilterChange(filters); handlePageChange(1);}}
              selectedOperations={operationFilters}
              colorClass="bg-explorer-dark-gray"
              triggerTitle={"Operation Filters"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-24 md:mt-14 w-full">
        <div className="mt-2 col-start-1 col-span-1">
          <AccountMainCard
            accountDetails={accountDetails}
            accountName={accountNameFromRoute}
            openVotersModal={handleOpenVotersModal}
          />
          <AccountDetailsCard
            header="Properties"
            userDetails={accountDetails}
          />
          <JSONCard
            header="JSON Metadata"
            json={accountDetails.json_metadata}
            showCollapseButton={true}
          />
          <JSONCard
            header="Posting JSON Metadata"
            json={accountDetails.posting_json_metadata}
            showCollapseButton={true}
          />
          <AccountDetailsCard
            header="Witness Properties"
            userDetails={witnessDetails}
          />
          <AccountWitnessVotesCard voters={accountDetails.witness_votes} />
          <VotersDialog
            accountName={accountNameFromRoute}
            isVotersOpen={openVotersModal}
            voters={witnessVoters}
            sorterInfo={{ isAsc: true, sortKey: "name" }}
            changeVotersDialogue={handleOpenVotersModal}
          />
        </div>

        <div className="col-start-1 md:col-start-2 col-span-1 md:col-span-3">
          <div>
            {isAccountOperationsLoading ? (
              <div className="flex justify-center text-center items-center">
                Loading ...
              </div>
            ) : (
              accountOperations?.map((operation: any, index) => (
                <div
                  className="m-2"
                  key={`${operation.acc_operation_id}_${index}`}
                >
                  <DetailedOperationCard
                    operation={operation.operation}
                    operationId={operation.operation_id}
                    date={new Date(operation.timestamp)}
                    blockNumber={operation.block_num}
                    transactionId={operation.trx_id}
                    key={`${operation.timestamp}_${index}`}
                    isShortened={operation.is_modified}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
