import { keepPreviousData, useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useHeadBlock = (headBlockNum?: number) => {
  const {
    data: headBlockData,
    isPending: headBlockDataLoading,
    isError: headBlockDataError,
  } = useQuery({
    queryKey: ["headBlockData", headBlockNum],
    queryFn: () => fetchBlockGlobalState(headBlockNum),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const fetchBlockGlobalState = async (headBlockNum: number | undefined) => {
    if (!headBlockNum) return null;
    const response = await fetchingService.getBlockGlobalState(headBlockNum);
    return response;
  };

  return { headBlockData, headBlockDataLoading, headBlockDataError };
};

export default useHeadBlock;
