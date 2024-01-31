import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useHafbeLastSyncedBlock = () => {
  const {
    data: headBlockData,
    isLoading: headBlockDataLoading,
    isError: headBlockDataError,
  } = useQuery({
    queryKey: ["hafbeLastSyncedBlock"],
    queryFn: () => fetchingService.getHafbeLastSyncedBlock(),
    refetchOnWindowFocus: false,
  });

  return { headBlockData, headBlockDataLoading, headBlockDataError };
};

export default useHafbeLastSyncedBlock;
