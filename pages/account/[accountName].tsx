import { useState } from "react";
import AccountDetailsCard from "../../components/account/AccountDetailsCard";
import fetchingService from "@/services/FetchingService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationTypesDialog from "../../components/block/OperationTypesDialog";
import CustomPagination from "../../components/CustomPagination";
import Hive from "@/types/Hive";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import JSONCard from "@/components/JSONCard";
import AccountMainCard from "@/components/account/AccountMainCard";
import AccountWitnessVotesCard from "@/components/account/AccountWitnessVotesCard";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import ScrollTopButton from "@/components/ScrollTopButton";

const OPERATIONS_LIMIT = 100;

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const [page, setPage] = useState(1);
  const [operationFilters, setOperationFilters] = useState<number[]>([]);
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
  }: UseQueryResult<Hive.OpsByAccountResponse[]> = useQuery({
    queryKey: [
      "account_operations",
      accountNameFromRoute,
      page,
      operationFilters,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountNameFromRoute,
        page,
        OPERATIONS_LIMIT,
        operationFilters
      ),
    refetchOnWindowFocus: false,
  });

  // Account operation types (filters)
  const { data: accountOperationTypes }: UseQueryResult<Hive.OperationTypes[]> =
    useQuery({
      queryKey: ["account_operation_types", accountNameFromRoute],
      queryFn: () => fetchingService.getAccOpTypes(accountNameFromRoute),
      refetchOnWindowFocus: false,
    });

  // Witness data
  const { data: witnessDetails }: UseQueryResult<Hive.Witness> = useQuery({
    queryKey: ["account_witness_details", accountNameFromRoute],
    queryFn: () => fetchingService.getWitness(accountNameFromRoute),
    select: (witnessData: any) => witnessData[0],
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

  if (!accountDetails || !accountOperations || !accountOperationTypes) {
    return "Loading ...";
  }
  if (!accountOperations.length) {
    return "No data";
  }

  const handleOpenVotersModal = () => {
    setOpenVotersModal(!openVotersModal);
  };

  return (
    <>
      <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-16 right-0 left-0 p-2 ">
        <div className="col-span-2 justify-self-end">
          <CustomPagination
            currentPage={page}
            totalCount={accountDetails.ops_count}
            pageSize={OPERATIONS_LIMIT}
            onPageChange={(page: number) => setPage(page)}
          />
        </div>

        <div className="justify-self-end">
          <div className="grid gap-x-5 grid-flow-row-dense grid-cols-2">
            <div className="justify-self-end self-center">
              <ScrollTopButton />
            </div>
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setSelectedOperations={setOperationFilters}
              triggerTitle={"Operation Filters"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 text-white mx-8 mt-14 w-full">
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

        <div className="col-start-2 col-span-3">
          {/* <div className="mt-6 bg-red-500 overflow auto right-0 left-0 top-10 mb-20 flex justify-center items-center fixed">
          <CustomPagination
            currentPage={page}
            totalCount={accountDetails.ops_count}
            pageSize={OPERATIONS_LIMIT}
            onPageChange={(page: number) => setPage(page)}
          />

          <OperationTypesDialog
            operationTypes={accountOperationTypes}
            setSelectedOperations={setOperationFilters}
            triggerTitle={"Operation Filters"}
          />
        </div> */}
          <div>
            {accountOperations.map((operation: any) => (
              <div
                className="m-2"
                key={operation.acc_operation_id}
              >
                <DetailedOperationCard
                  operation={operation.operation}
                  date={new Date(operation.timestamp)}
                  blockNumber={operation.block}
                  transactionId={operation.trx_id}
                  key={operation.timestamp}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
