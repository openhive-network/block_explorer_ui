import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useRcDelegations = (
  delegatorAccount: string,
  limit: number,
  liveDataEnabled: boolean
) => {
  const {
    data: rcDelegationsData,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
  }: UseQueryResult<Hive.RCDelegations[]> = useQuery({
    queryKey: ["RcDelegations", delegatorAccount, limit, liveDataEnabled],
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
