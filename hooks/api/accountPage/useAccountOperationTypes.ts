import { useQuery, UseQueryResult } from "@tanstack/react-query";

import Explorer from "@/types/Explorer";
import fetchingService from "@/services/FetchingService";
import { useOperationTypesContext } from "@/contexts/OperationsTypesContext";

const useAccountOperationTypes = (accountName: string) => {
  const { operationsTypes } = useOperationTypesContext();

  const selectFunction = (
    selectedTypes: number[]
  ): Explorer.ExtendedOperationTypePattern[] => {
    if (!operationsTypes) return [];
    const extendedOperationTypes = operationsTypes.map((operationType) =>
      selectedTypes.includes(operationType.op_type_id)
        ? { ...operationType }
        : { ...operationType, isDisabled: true }
    );
    return extendedOperationTypes;
  };

  const {
    data: accountOperationTypes,
    isLoading: isAccountOperationTypesLoading,
    isError: isAccountOperationTypesError,
  }: UseQueryResult<Explorer.ExtendedOperationTypePattern[]> = useQuery({
    queryKey: ["account_operation_types", accountName],
    queryFn: () => fetchingService.getAccOpTypes(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
    select: selectFunction,
  });

  return {
    accountOperationTypes,
    isAccountOperationTypesLoading,
    isAccountOperationTypesError,
  };
};

export default useAccountOperationTypes;
