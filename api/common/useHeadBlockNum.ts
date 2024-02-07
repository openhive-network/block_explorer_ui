import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { useEffect } from "react";

const useHeadBlockNumber = (liveUpdate?: boolean) => {
  const {
    data: headBlockNumberData,
    isLoading: headBlockNumberDataLoading,
    isError: headBlockNumberDataError,
    refetch
  } = useQuery({
    queryKey: ["headBlockNum"],
    queryFn: () => fetchingService.getHafbeLastSyncedBlock(),
    refetchOnWindowFocus: false,
    refetchInterval: liveUpdate ? 3000 : Infinity
  });

  useEffect(() => {
    if(liveUpdate) {
      refetch();
    }
  }, [liveUpdate, refetch]);

  const checkTemporaryHeadBlockNumber = async () => {
    return await fetchingService.getHeadBlockNum();
  }

  return { headBlockNumberData, headBlockNumberDataLoading, headBlockNumberDataError, checkTemporaryHeadBlockNumber };
};

export default useHeadBlockNumber;
