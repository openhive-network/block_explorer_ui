import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useOperation = (operationId: string) => {
  const {
    data: operationData,
    isFetched: operationDataIsFetched,
    isError: operationDataError,
  } = useQuery({
    queryKey: [`operation-${operationId}`],
    queryFn: () => fetchingService.getOperation(operationId),
    refetchOnWindowFocus: false,
    enabled: !!operationId,
  });

  return { operationData, operationDataIsFetched, operationDataError };
};

export default useOperation;
