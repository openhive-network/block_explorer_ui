import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useHeadBlock = (headBlockNum?: number) => {
  const {
    data: headBlockData,
    isLoading: headBlockDataLoading,
    isError: headBlockDataError,
  } = useQuery({
    queryKey: ["headBlockData", headBlockNum],
    queryFn: () => fetchingService.getBlock(headBlockNum || 0),
    refetchOnWindowFocus: false,
  });

  return { headBlockData, headBlockDataLoading, headBlockDataError };
};

export default useHeadBlock;
