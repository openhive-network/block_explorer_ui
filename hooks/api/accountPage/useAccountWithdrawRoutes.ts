import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountWithdrawRoutes = (
  accountName: string,
  liveDataEnabled: boolean
) => {
  const {
    data,
    isLoading: isWithdrawRoutesLoading,
    isError: isWithdrawRoutesError,
  }: UseQueryResult<Hive.WithdrawVestingRoutesResponse> = useQuery({
    queryKey: ["account_withdraw_routes", accountName, liveDataEnabled],
    queryFn: () => fetchingService.getWithdrawRoutes(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
  });

  return {
    withdrawRoutes: data?.routes,
    isWithdrawRoutesLoading,
    isWithdrawRoutesError,
  };
};

export default useAccountWithdrawRoutes;
