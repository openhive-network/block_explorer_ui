import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { useEffect } from "react";
import { config } from "@/Config";

const useHeadBlockNumber = (liveUpdate?: boolean,) => {
  const {
    data: headBlockNumberData,
    isLoading: headBlockNumberDataLoading,
    isError: headBlockNumberDataError,
    refetch,
  } = useQuery({
    queryKey: ["headBlockNum"],
    queryFn: () => fetchingService.getHafbeLastSyncedBlock(),
    refetchOnWindowFocus: false,
    refetchInterval: liveUpdate ? config.mainRefreshInterval : Infinity,
  });

  useEffect(() => {
    if (liveUpdate) {
      refetch();
    }
  }, [liveUpdate, refetch]);

  const checkTemporaryHeadBlockNumber = async () => {
    return await fetchingService.getHeadBlockNum();
  };

  return {
    headBlockNumberData,
    headBlockNumberDataLoading,
    headBlockNumberDataError,
    checkTemporaryHeadBlockNumber,
    refetch,
  };
};

export default useHeadBlockNumber;
