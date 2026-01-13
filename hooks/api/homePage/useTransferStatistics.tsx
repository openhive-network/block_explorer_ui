import { useQuery, UseQueryResult } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";

const useTransferStatistics = (
  granularity: "daily" | "monthly" | "yearly",
  coinType: "HBD" | "HIVE" = "HIVE", // Default to HIVE
  direction: "asc" | "desc",
  fromDate?: Date | number | undefined,
  toDate?: Date | number | undefined,
  liveDataEnabled?: boolean
) => {
  const {
    data: transferStatistics,
    isLoading: isTransferStatisticsLoading,
    isError: isTransferStatisticsError,
  }: UseQueryResult<
    Hive.TransferStatisticsResponse[] | undefined
  > = useQuery({
    queryKey: [
      "transferStatistics",
      granularity,
      coinType,
      direction,
      fromDate,
      toDate,
      liveDataEnabled,
    ],
    queryFn: async () => {
      if (liveDataEnabled) {
        return await fetchingService.getTransferStatistics(
          granularity,
          coinType,
          direction,
          fromDate,
          toDate
        );
      }
      return []; // Return an empty array when liveDataEnabled is false
    },
  });

  return {
    transferStatistics,
    isTransferStatisticsLoading,
    isTransferStatisticsError,
  };
};

export default useTransferStatistics;
