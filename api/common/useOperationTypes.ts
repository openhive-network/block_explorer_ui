import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useOperationTypes = () => {
  const {
    data: operationTypes,
    isLoading: operationTypesLoading,
    error: operationTypesError,
  }: UseQueryResult<Hive.OperationPattern[]> = useQuery({
    queryKey: ["operation_types"],
    queryFn: () => fetchingService.getOperationTypes(""),
    refetchOnWindowFocus: false,
  });

  return {
    operationTypes,
    operationTypesLoading,
    operationTypesError
  }
}

export default useOperationTypes;