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
import { Progress } from "@/components/ui/progress";
import DetailedOperationCard from "@/components/DetailedOperationCard";

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
    return "Loading ...";
  }
  if (!accountOperations.length) {
    return "No data";
  }

  return (
    <div className="grid grid-cols-3 text-white mx-8">
      <div className="mt-6 col-start-1 col-span-1 ">
        <div className='bg-explorer-dark-gray p-2 rounded-["6px] mx-6 h-fit rounded'>
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
            <div className="text-center">
              <p className="text-xl">Vote weight</p>
              <p className="text-lg">50</p>
            </div>
            <div className="text-center text-gray-500">
              <p className="my-2">Voting Power</p>
              <Progress
                value={53}
                color="#cecafa"
                style={{ background: "#03182c" }}
              />
            </div>

            <div className="text-center text-gray-500">
              <p className="my-2">Downvote power </p>
              <Progress
                value={25}
                color="#cecafa"
                style={{ background: "#03182c" }}
              />
            </div>

            <div className="text-center text-gray-500">
              <p className="my-2">Recourse credits </p>
              <Progress
                value={75}
                color="#cecafa"
                style={{ background: "#03182c" }}
              />
            </div>
            <div className="flex justify-between p-5 break-all">
              <div className="text-center">
                <p className="text-xl">Reputation</p>
                <p className="text-lg">75</p>
                <p className="text-xs text-gray-500">
                  {accountDetails.post_count} posts
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg">Creation Date</p>
                <p className="text-lg ">
                  {moment(accountDetails.created).format("DD/MM/YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className='bg-explorer-dark-gray rounded-["6px] mx-6 h-fit rounded'>
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
  );
}
