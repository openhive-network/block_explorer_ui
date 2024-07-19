import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useVestingDelegations = (delegatorAccount: string, startAccount: string | null, limit: number) => {
  const {
    data: vestingDelegationsData,
    isLoading: isVestingDelegationsLoading,
    isError: isVestingDelegationsError,
  } = useQuery({
    queryKey: ["vestingDelegations", delegatorAccount, startAccount, limit],
    queryFn: () => fetchingService.getVestingDelegations(delegatorAccount, startAccount, limit),
    refetchOnWindowFocus: false,
  });

  return { vestingDelegationsData, isVestingDelegationsLoading, isVestingDelegationsError };
};

export default useVestingDelegations;
