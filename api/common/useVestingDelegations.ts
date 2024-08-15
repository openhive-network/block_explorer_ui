import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useVestingDelegations = (
  delegatorAccount: string, 
  startAccount: string | null, 
  limit: number, 
  refetchInterval?: number | false
) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
  } = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount, startAccount, limit],
    queryFn: () => fetchingService.getVestingDelegations(delegatorAccount, startAccount, limit),
    refetchInterval,
    select: (data) => {
      if (Array.isArray(data)) {
      return data.sort((a: Hive.VestingDelegations, b: Hive.VestingDelegations) =>
        a.delegatee.toLowerCase().localeCompare(b.delegatee.toLowerCase())
      );
      }
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return { vestingDelegationsData, isVestingDelegationsLoading, isVestingDelegationsError };
};

export default useVestingDelegations;
