import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useDailyActiveUsers = (
  fromBlock?: Date | number | undefined,
  toBlock?: Date | number | undefined,
  granularity?: "day" | "week" | "month",
  operationTypes?: string
) => {
  const {
    data: dailyActiveUsers,
    isLoading: isDailyActiveUsersLoading,
    isError: isDailyActiveUsersError,
  }: UseQueryResult<Hive.DailyActiveUsersResponse[] | undefined> = useQuery({
    queryKey: [
      "dailyActiveUsers",
      fromBlock,
      toBlock,
      granularity,
      operationTypes,
    ],
    queryFn: () =>
      fetchingService.getDailyActiveUsers(
        fromBlock,
        toBlock,
        granularity,
        operationTypes
      ),
    enabled: true,
  });

  return {
    dailyActiveUsers,
    isDailyActiveUsersLoading,
    isDailyActiveUsersError,
  };
};

export default useDailyActiveUsers;
