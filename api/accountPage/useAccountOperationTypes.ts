import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import { useOperationTypesContext } from "@/contexts/OperationsTypesContext";

const useAccountOperationTypes = (accountName: string) => {
  const {operationsTypes} = useOperationTypesContext();

  const selectFunction = (selectedTypes: number[]): Hive.OperationPattern[] => {
    if (!operationsTypes) return [];
    const operationTypesMap = new Map<number, Hive.OperationPattern>();
    operationsTypes.forEach((type) => {
      operationTypesMap.set(type.op_type_id, type);
    })
    return selectedTypes.map((selectedType) => operationTypesMap.get(selectedType)) as Hive.OperationPattern[];
  }

  const {
    data: accountOperationTypes,
    isLoading: isAccountOperationTypesLoading,
    isError: isAccountOperationTypesError,
  }: UseQueryResult<Hive.OperationPattern[]> = useQuery({
    queryKey: ["account_operation_types", accountName],
    queryFn: () => fetchingService.getAccOpTypes(accountName),
    refetchOnWindowFocus: false,
    enabled: !!accountName && !!accountName.length,
    select: selectFunction
  });


  return {
    accountOperationTypes,
    isAccountOperationTypesLoading,
    isAccountOperationTypesError,
  };
};

export default useAccountOperationTypes;
