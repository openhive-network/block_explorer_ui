import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { config } from "@/Config";


const useRcDelegations = (delegatorAccount: string, limit: number, liveDataEnabled: boolean) => {
  const {
    data: rcDelegationsData,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
  }: UseQueryResult<Hive.RCDelegations[]> = useQuery({
    queryKey: ["RcDelegations", delegatorAccount, limit],
    queryFn: () => fetchingService.getRcDelegations(delegatorAccount, limit),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    select: (data) => {
      if (Array.isArray(data)) {
      return data.sort((a: Hive.RCDelegations, b: Hive.RCDelegations) =>
        a.to.toLowerCase().localeCompare(b.to.toLowerCase())
      );
      }
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return {
    rcDelegationsData,
    isRcDelegationsLoading,
    isRcDelegationsError,
  };
};

export default useRcDelegations;
