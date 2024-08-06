import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useRcDelegations = (delegatorAccount: string, limit: number) => {
  const {
    data: rcDelegationsData,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
    refetch: refetchRcDelegations,
  } = useQuery({
    queryKey: ["RcDelegations", delegatorAccount, limit],
    queryFn: () => fetchingService.getRcDelegations(delegatorAccount, limit),
    select: (data) => {
      return data.sort((a: Hive.RCDelegations, b: Hive.RCDelegations) =>
        a.to.toLowerCase().localeCompare(b.to.toLowerCase())
      );
    },
    refetchOnWindowFocus: false,
  });

  return { rcDelegationsData, isRcDelegationsLoading, isRcDelegationsError, refetchRcDelegations };
};

export default useRcDelegations;