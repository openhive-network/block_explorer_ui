import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";

const useOperation = (operationId: number) => {
  const {
    data: operationData,
    isFetched: operationDataIsFetched,
    isError: operationDataError,
  } = useQuery({
    queryKey: [`operation-${operationId}`],
    queryFn: () => fetchingService.getOperation(Number(operationId)),
    refetchOnWindowFocus: false,
  });

  return { operationData, operationDataIsFetched, operationDataError };
};

export default useOperation;
