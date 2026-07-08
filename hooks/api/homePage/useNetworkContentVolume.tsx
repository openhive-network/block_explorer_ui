import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";

const useNetworkContentVolume = (
  fromBlock?: Date | number | undefined,
  toBlock?: Date | number | undefined,
  granularity?: "day" | "week" | "month",
  enabled = true
) => {
  const {
    data: networkContentVolume,
    isLoading: isNetworkContentVolumeLoading,
    isError: isNetworkContentVolumeError,
  }: UseQueryResult<Hive.NetworkContentVolumeResponse[] | undefined> = useQuery(
    {
      queryKey: ["networkContentVolume", fromBlock, toBlock, granularity],
      queryFn: () =>
        fetchingService.getNetworkContentVolume(
          fromBlock,
          toBlock,
          granularity
        ),
      enabled,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return {
    networkContentVolume,
    isNetworkContentVolumeLoading,
    isNetworkContentVolumeError,
  };
};

export default useNetworkContentVolume;
