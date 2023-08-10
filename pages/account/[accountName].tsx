import { useState } from "react";
import OperationCard from "../../components/OperationCard";
import AccountDetailsCard from "../../components/account/AccountDetailsCard";
import fetchingService from "@/services/FetchingService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import OperationTypesDialog from "../../components/block/OperationTypesDialog";
import CustomPagination from "../../components/CustomPagination";
import Hive from "@/types/Hive";
import Image from "next/image";

const OPERATIONS_LIMIT = 100;

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const [topOperationCount, setTopOperationCount] = useState(-1);
  const [operationFilters, setOperationFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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
      topOperationCount,
      operationFilters,
    ],
    queryFn: () =>
      fetchingService.getOpsByAccount(
        accountNameFromRoute,
        topOperationCount,
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

  if (!accountDetails || !accountOperations || !accountOperationTypes) {
    return null;
  }
  const firstOperationOnPage = accountOperations[0].acc_operation_id ?? 0;

  return (
    <div className="grid grid-cols-4 text-white mx-8">
      <div className='mt-6 col-start-1 col-span-1 bg-explorer-dark-gray p-2 rounded-["6px] mx-6 h-fit rounded'>
        <div className="flex justify-between text-explorer-orange text-2xl my-4">
          {accountDetails.name}{" "}
          <span>
            <Image className="rounded-full" src={accountDetails.profile_image} alt="avatar" width={50} height={50} /> 
          </span>
        </div>
        <div>
          <div>Voting weight : NEEDS CALC</div>
          <div>Voting Power : NEEDS CALC </div>
          <div>Downvote power : NEEDS CALC</div>
          <div>Recourse credits : NEEDS CALC</div>
          <div>Reputation : NEEDS CALC</div>
          <div>Posts count: {accountDetails.post_count}</div>
          <div>Age : NEEDS CALC</div>
          <div>Created at: {accountDetails.created}</div>
        </div>
        <div>
          <div className="text-center mt-8">Recource credits</div>
          Need calc
        </div>
        <div>
          <AccountDetailsCard userDetails={accountDetails} />
        </div>
      </div>

      <div className="col-start-2 col-span-3">
        <div className="grid grid-cols-full mt-6">
          <div className="col-start-7">
            <div className="w-full flex justify-center">
              <CustomPagination
                currentPage={currentPage}
                totalCount={firstOperationOnPage}
                pageSize={OPERATIONS_LIMIT}
                onPageChange={(page: any) => setCurrentPage(page)}
                setAction={setTopOperationCount}
              />
            </div>
          </div>
          <div className="col-end-12">
            <OperationTypesDialog operationTypes={accountOperationTypes}
            setFilters={() => {}} />
          </div>
        </div>
        {accountOperations.map((operation: any) => (
          <div key={operation.acc_operation_id}>
            <OperationCard
              operation={operation.operation}
              blockNumber={operation.block}
              transactionId={operation.trx_id}
              date={operation.timestamp}
              isVirtual={operation.virtual_op}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
