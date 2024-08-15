import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useRcDelegations = (
  delegatorAccount: string, 
  limit: number, 
  refetchInterval?: number | false
) => {
  const {
    data: rcDelegationsData,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
  } = useQuery({
    queryKey: ["RcDelegations", delegatorAccount, limit],
    queryFn: () => fetchingService.getRcDelegations(delegatorAccount, limit),
    refetchInterval,
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

  return { rcDelegationsData, isRcDelegationsLoading, isRcDelegationsError };
};

export default useRcDelegations;