import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useAccountFunnel = (from?: Date, to?: Date, enabled = true) => {
  const {
    data: accountFunnel,
    isLoading: isAccountFunnelLoading,
    isError: isAccountFunnelError,
  }: UseQueryResult<Hive.AccountFunnelResponse[] | undefined> = useQuery({
    queryKey: ["accountFunnel", from?.toISOString(), to?.toISOString()],
    queryFn: () => fetchingService.getAccountFunnel(from, to),
    enabled,
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  return {
    accountFunnel,
    isAccountFunnelLoading,
    isAccountFunnelError,
  };
};

export default useAccountFunnel;
