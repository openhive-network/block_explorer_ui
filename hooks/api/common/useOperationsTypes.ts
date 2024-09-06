import { UseQueryResult, useQuery } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";

const useOperationsTypes = () => {
  const {
    data: operationsTypes,
    isLoading: operationsTypesLoading,
    error: operationsTypesError,
  }: UseQueryResult<Explorer.ExtendedOperationTypePattern[]> = useQuery({
    queryKey: ["operation_types"],
    queryFn: () => fetchingService.getOperationTypes(),
    refetchOnWindowFocus: false,
  });

  return {
    operationsTypes,
    operationsTypesLoading,
    operationsTypesError,
  };
};

export default useOperationsTypes;
