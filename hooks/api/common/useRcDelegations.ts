import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

const useRcDelegations = (
  accountName: string,
  liveDataEnabled: boolean
) => {
  const {
    data,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
  }: UseQueryResult<Hive.RcDelegationsApiResponse> = useQuery({
    queryKey: ["RcDelegations", accountName, liveDataEnabled],
    queryFn: () => fetchingService.getRcDelegations(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  return {
    outgoingRcDelegations: data?.outgoing_delegations,
    incomingRcDelegations: data?.incoming_delegations,
    isRcDelegationsLoading,
    isRcDelegationsError,
  };
};

export default useRcDelegations;
