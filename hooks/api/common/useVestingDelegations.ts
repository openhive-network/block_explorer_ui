import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import fetchingService from "@/services/FetchingService";

const useVestingDelegations = (
  delegatorAccount: string,
  startAccount: string | null,
  limit: number,
  liveDataEnabled: boolean
) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
  }: UseQueryResult<Hive.TwoDirectionDelegations> = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount, liveDataEnabled],
    queryFn: () => fetchingService.getVestingDelegations(delegatorAccount),
    enabled: !!delegatorAccount,
    refetchOnWindowFocus: false,
  });

  return {
    outgoingDelegations: vestingDelegationsData?.outgoing_delegations,
    incomingDelegations: vestingDelegationsData?.incoming_delegations,
    isVestingDelegationsLoading,
    isVestingDelegationsError,
  };
};

export default useVestingDelegations;
