import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useDailyActiveUsers = (
  from?: Date,
  to?: Date,
  granularity?: "day" | "week" | "month",
  operationTypes?: string
) => {
  const {
    data: dailyActiveUsers,
    isLoading: isDailyActiveUsersLoading,
    isError: isDailyActiveUsersError,
  }: UseQueryResult<Hive.DailyActiveUsersResponse[] | undefined> = useQuery({
    queryKey: ["dailyActiveUsers", from, to, granularity, operationTypes],
    queryFn: () =>
      fetchingService.getDailyActiveUsers(
        from,
        to,
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
