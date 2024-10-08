import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useOperationKeys = (operationTypeId: number | undefined) => {
  const {
    data: operationKeysData,
    isFetching: operationKeysDataLoading,
    isError: operationKeysDataError,
  } = useQuery({
    queryKey: ["operationKeys", operationTypeId],
    queryFn: () => fetchOperationKeys(operationTypeId),
    refetchOnWindowFocus: false,
    enabled: operationTypeId !== undefined,
  });

  const fetchOperationKeys = async (operationTypeId: number | undefined) => {
    if (operationTypeId !== undefined) {
      return await fetchingService.getOperationKeys(operationTypeId);
    } else {
      return await undefined;
    }
  };

  return {
    operationKeysData,
    operationKeysDataLoading,
    operationKeysDataError,
  };
};

export default useOperationKeys;
