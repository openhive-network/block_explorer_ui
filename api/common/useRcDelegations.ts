import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useRcDelegations = (delegatorAccount: string, limit: number) => {
  const {
    data: rcDelegationsData,
    isLoading: isRcDelegationsLoading,
    isError: isRcDelegationsError,
  } = useQuery({
    queryKey: ["RcDelegations", delegatorAccount, limit],
    queryFn: () => fetchingService.getRcDelegations(delegatorAccount, limit),
    refetchOnWindowFocus: false,
  });

  return { rcDelegationsData, isRcDelegationsLoading, isRcDelegationsError };
};

export default useRcDelegations;