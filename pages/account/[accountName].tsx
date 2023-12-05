import { useState } from "react";
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
import MainModule from "@hive/wax";
import PageNotFound from "@/components/PageNotFound";
import useAccountDetails from "@/api/accountPage/useAccountDetails";
import useAccountOperations from "@/api/accountPage/useAccountOperations";
import useWitnessDetails from "@/api/common/useWitnessDetails";
import useAccountOperationTypes from "@/api/accountPage/useAccountOperationTypes";
import { config } from "@/Config";

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const [page, setPage] = useState(1);
  const [operationFilters, setOperationFilters] = useState<number[]>([]);
  const [isVotersModalOpen, setIsVotersModalOpen] = useState(false);
  const [isVotesHistoryModalOpen, setIsVotesHistoryModalOpen] = useState(false);

  const { accountDetails } = useAccountDetails(accountNameFromRoute);
  const { accountOperations, isAccountOperationsLoading } =
    useAccountOperations(
      accountNameFromRoute,
      page,
      operationFilters,
      config.standardPaginationSize
    );

  const { accountOperationTypes } =
    useAccountOperationTypes(accountNameFromRoute);

  const { witnessDetails } = useWitnessDetails(
    accountNameFromRoute,
    !!accountDetails?.is_witness
  );

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

  if (!accountDetails) {
    return "Loading ...";
  }
  if (!accountOperations?.length && !isAccountOperationsLoading) {
    return <PageNotFound message={`Account not found.`} />;
  }

  const handleOpenVotersModal = () => {
    setIsVotersModalOpen(!isVotersModalOpen);
  };

  const handleOpenVotesHistoryModal = () => {
    setIsVotesHistoryModalOpen(!isVotesHistoryModalOpen);
  };

  return (
    <>
      <div className="bg-explorer-orange items-center fixed grid grid-flow-row-dense grid-cols-3 top-14 md:top-16 right-0 left-0 p-2 z-50">
        <div className="col-span-3 md:col-span-2 md:justify-self-end justify-self-center z-20 max-w-full">
          <CustomPagination
            currentPage={page}
            totalCount={accountDetails.ops_count}
            pageSize={config.standardPaginationSize}
            onPageChange={(page: number) => setPage(page)}
          />
        </div>

        <div className="justify-self-end col-span-3 md:col-span-1">
          <div className="grid gap-x-5 grid-flow-row-dense grid-cols-2">
            <div className="justify-self-end self-center">
              <ScrollTopButton />
            </div>
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setSelectedOperations={setOperationFilters}
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
              accountOperations?.map((operation: any) => (
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
