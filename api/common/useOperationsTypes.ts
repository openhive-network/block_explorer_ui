import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

const useOperationsTypes = () => {
  const {
    data: operationsTypes,
    isLoading: operationsTypesLoading,
    error: operationsTypesError,
  }: UseQueryResult<Hive.OperationPattern[]> = useQuery({
    queryKey: ["operation_types"],
    queryFn: () => fetchingService.getOperationTypes(),
    refetchOnWindowFocus: false,
  });

  return {
    operationsTypes,
    operationsTypesLoading,
    operationsTypesError
  }
}

export default useOperationsTypes;