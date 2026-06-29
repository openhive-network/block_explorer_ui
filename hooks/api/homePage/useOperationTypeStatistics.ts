import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useOperationTypeStatistics = (
  granularity: "daily" | "monthly" | "yearly",
  direction: "asc" | "desc",
  fromBlock?: Date | number,
  toBlock?: Date | number,
  opTypes?: number[]
) => {
  const {
    data: operationTypeStatistics,
    isLoading: isOperationTypeStatisticsLoading,
    isError: isOperationTypeStatisticsError,
  }: UseQueryResult<
    Hive.OperationTypeStatisticsResponse[] | undefined
  > = useQuery({
    queryKey: [
      "get_operation_type_statistics",
      granularity,
      direction,
      fromBlock,
      toBlock,
      opTypes,
    ],
    queryFn: () =>
      fetchingService.getOperationTypeStatistics(
        granularity,
        direction,
        fromBlock,
        toBlock,
        opTypes
      ),
    refetchOnWindowFocus: false,
  });

  return {
    operationTypeStatistics,
    isOperationTypeStatisticsLoading,
    isOperationTypeStatisticsError,
  };
};

export default useOperationTypeStatistics;
