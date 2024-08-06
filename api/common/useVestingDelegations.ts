import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useVestingDelegations = (delegatorAccount: string, startAccount: string | null, limit: number) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
    refetch: refetchVestingDelegations,
  } = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount, startAccount, limit],
    queryFn: () => fetchingService.getVestingDelegations(delegatorAccount, startAccount, limit),
    select: (data) => {
      return data.sort((a: Hive.VestingDelegations, b: Hive.VestingDelegations) =>
        a.delegatee.toLowerCase().localeCompare(b.delegatee.toLowerCase())
      );
    },
    refetchOnWindowFocus: false,
  });

  return { vestingDelegationsData, isVestingDelegationsLoading, isVestingDelegationsError, refetchVestingDelegations };
};

export default useVestingDelegations;
