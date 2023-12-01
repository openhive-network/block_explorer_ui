import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import { useState } from "react";

const useOperationKeys = () => {
  const [operationTypeId, setOperationTypeId] = useState<number | undefined>(undefined);

  const {
    data: operationKeysData,
    isFetching: operationKeysDataLoading,
    isError: operationKeysDataError,
    refetch
  } = useQuery({
    queryKey: ["operationKeys"],
    queryFn: () => fetchOperationKeys(operationTypeId),
    refetchOnWindowFocus: false,
    enabled: !!operationTypeId
  });

  const fetchOperationKeys = async (operationTypeId: number | undefined) => {
    if (operationTypeId !== undefined) {
      return await fetchingService.getOperationKeys(operationTypeId);
    } else {
      return await undefined;
    }
  }

  const getOperationKeys = async (newOperationTypeId: number | undefined) => {
    await setOperationTypeId(newOperationTypeId);
    refetch();
  }

  return { operationKeysData, operationKeysDataLoading, operationKeysDataError, getOperationKeys };
};

export default useOperationKeys;
