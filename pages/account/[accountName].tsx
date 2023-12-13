import { useEffect, useState } from "react";
import AccountDetailsCard from "../../components/account/AccountDetailsCard";
import { useRouter } from "next/router";
import OperationTypesDialog from "@/components/OperationTypesDialog";
import CustomPagination from "../../components/CustomPagination";
import DetailedOperationCard from "@/components/DetailedOperationCard";
import JSONCard from "@/components/JSONCard";
import AccountMainCard from "@/components/account/AccountMainCard";
import AccountWitnessVotesCard from "@/components/account/AccountWitnessVotesCard";
import VotersDialog from "@/components/Witnesses/VotersDialog";
import VotesHistoryDialog from "@/components/Witnesses/VotesHistoryDialog";
import ScrollTopButton from "@/components/ScrollTopButton";
import PageNotFound from "@/components/PageNotFound";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import useWitnessDetails from "@/api/common/useWitnessDetails";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";
import { config } from "@/Config";
import { useURLParams } from "@/utils/Hooks";

interface AccountSearchParams {
  accountName?: string;
  fromBlock: number | undefined;
  toBlock: number | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  page: number;
  filters: number[];
}

const defaultSearchParams: AccountSearchParams = {
  fromBlock: undefined,
  toBlock: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  filters: []
}

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const [page, setPage] = useState<number | undefined>(undefined);
  const [operationFilters, setOperationFilters] = useState<number[]>([]);
  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);

  const { accountDetails } = useAccountDetails(accountNameFromRoute);
  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations(
      accountNameFromRoute,
      operationFilters.length ? operationFilters : undefined,
      config.standardPaginationSize,
      page
    );

  const { accountOperationTypes } =
    useAccountOperationTypes(accountNameFromRoute);

  const { witnessDetails } = useWitnessDetails(
    accountNameFromRoute,
    !!accountDetails?.is_witness
  );

  const { paramsState, setParams } = useURLParams(defaultSearchParams);

  useEffect(() => {
    if (!page && accountOperations) {
      setPage(accountOperations.total_pages);
    }
  }, [accountOperations, page])

  if (!accountDetails) {
    return "Loading ...";
  }
  if (!accountOperations?.total_operations && !isAccountOperationsLoading) {
    return <PageNotFound message={`Account not found.`} />;
  }

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };

  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  };

  const handleFilterChange = (newFilters: number[]) => {
    setPage(undefined);
    setOperationFilters(newFilters);
  }

  return (
    <>
      <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-14 md:top-16 right-0 left-0 p-2 z-10">
        <div className="col-span-3 md:col-span-2 md:justify-self-end justify-self-center z-20 max-w-full">
          {page && 
            <CustomPagination
              currentPage={page}
              totalCount={accountOperations?.total_operations || 0}
              pageSize={config.standardPaginationSize}
              onPageChange={(page: number) => setPage(page)}
            />
          }
        </div>

        <div className="justify-self-end col-span-3 md:col-span-1">
          <div className="grid gap-x-5 grid-flow-row-dense grid-cols-2">
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

      <div className="grid grid-cols-1 md:grid-cols-3 text-white mx-8 mt-24 md:mt-14 w-full">
        <div className="mt-2 col-start-1 col-span-1">
          <AccountMainCard
            accountDetails={accountDetails}
            accountName={accountNameFromRoute}
            openVotersModal={handleOpenVotersModal}
            openVotesHistoryModal={handleOpenVotesHistoryModal}
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
            isVotersOpen={isVotersModalOpen}
            changeVotersDialogue={handleOpenVotersModal}
          />
          <VotesHistoryDialog
            accountName={accountNameFromRoute}
            isVotesHistoryOpen={isVotesHistoryModalOpen}
            changeVoteHistoryDialogue={handleOpenVotesHistoryModal}
          />
        </div>

        <div className="col-start-1 md:col-start-2 col-span-1 md:col-span-3">
          <div>
            {isAccountOperationsLoading ? (
              <div className="flex justify-center text-center items-center">
                Loading ...
              </div>
            ) : (
              accountOperations?.operations_result?.map((operation: any) => (
                <div
                  className="m-2"
                  key={operation.acc_operation_id}
                >
                  <DetailedOperationCard
                    operation={operation.operation}
                    operationId={operation.operation_id}
                    date={new Date(operation.timestamp)}
                    blockNumber={operation.block_num}
                    transactionId={operation.trx_id}
                    key={operation.timestamp}
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
