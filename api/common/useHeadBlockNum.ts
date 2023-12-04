import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useHeadBlockNumber = () => {
  const {
    data: headBlockNumberData,
    isLoading: headBlockNumberDataLoading,
    isError: headBlockNumberDataError,
  } = useQuery({
    queryKey: ["headBlockNum"],
    queryFn: () => fetchingService.getHeadBlockNum(),
    refetchOnWindowFocus: false,
  });

  const checkTemporaryHeadBlockNumber = async () => {
    return await fetchingService.getHeadBlockNum();
  }

  return { headBlockNumberData, headBlockNumberDataLoading, headBlockNumberDataError, checkTemporaryHeadBlockNumber };
};

export default useHeadBlockNumber;
