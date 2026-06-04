import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useProxyPower = (
  accountName: string,
  page: number,
  sort?: string,
  direction?: Hive.Direction
) => {
  const {
    data: accountProxyPower,
    isLoading: isAccountProxyPowerLoading,
    isError: isAccountProxyPowerError,
    isFetching: isAccountProxyPowerFetching,
  }: UseQueryResult<Hive.ProxyPowerResponse[]> = useQuery({
    queryKey: ["account_proxy", accountName, page, sort, direction],
    queryFn: () =>
      fetchingService.getProxyPower(accountName, page, sort, direction),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  return {
    accountProxyPower,
    isAccountProxyPowerLoading,
    isAccountProxyPowerError,
    isAccountProxyPowerFetching,
  };
};

export default useProxyPower;
