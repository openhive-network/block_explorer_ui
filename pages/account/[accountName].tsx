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
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import moment from "moment";
import { config } from "@/Config";

const OPERATIONS_LIMIT = 100;

export default function Account() {
  const router = useRouter();

  const accountNameFromRoute = router.query.accountName as string;

  const [page, setPage] = useState(1);
  const [operationFilters, setOperationFilters] = useState<number[]>([]);

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

  if (!accountDetails || !accountOperations || !accountOperationTypes) {
    return 'Loading ...';
  }
  if (!accountOperations.length) {
    return 'No data';
  }

  return (
    <div className="grid grid-cols-4 text-white mx-8">
      <div className='mt-6 col-start-1 col-span-1 bg-explorer-dark-gray p-2 rounded-["6px] mx-6 h-fit rounded'>
        <div className="flex justify-between text-explorer-orange text-2xl my-4">
          {accountDetails.name}{" "}
          <span>
            <Image
              className="rounded-full"
              src={getHiveAvatarUrl(accountNameFromRoute)}
              alt="avatar"
              width={50}
              height={50}
            />
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
          <div>
            Created at:{" "}
            {moment(accountDetails.created).format(config.baseMomentTimeFormat)}
          </div>
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
                currentPage={page}
                totalCount={accountDetails.ops_count}
                pageSize={OPERATIONS_LIMIT}
                onPageChange={(page: number) => setPage(page)}
              />
            </div>
          </div>
          <div className="col-end-12">
            <OperationTypesDialog
              operationTypes={accountOperationTypes}
              setFilters={setOperationFilters}
            />
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
