import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountDetails = (accountName: string) => {
  const {
    data: accountDetails,
    isLoading: isAccountDetailsLoading,
    isError: isAccountDetailsError,
  }: UseQueryResult<Hive.AccountDetailsQueryResponse> = useQuery({
    queryKey: ["account_details", accountName],
    queryFn: () => fetchingService.getAccount(accountName),
    refetchOnWindowFocus: false,
  });

  return { accountDetails, isAccountDetailsLoading, isAccountDetailsError };
};

export default useAccountDetails;
