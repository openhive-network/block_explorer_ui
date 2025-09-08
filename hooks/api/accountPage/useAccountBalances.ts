import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { config } from "@/Config";

const useAccountBalances = (
  accountName: string,
) => {
  const {
    data: accountBalancesData,
    isLoading: accountBalancesDataLoading,
    isError: accountBalancesDataError,
  }: UseQueryResult<Hive.AccountBalancesResponse> = useQuery({
    queryKey: ["account_balances", accountName],
    queryFn: () => fetchingService.getAccountBalances(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    accountBalancesData,
    accountBalancesDataLoading,
    accountBalancesDataError,
  };
};

export default useAccountBalances;
