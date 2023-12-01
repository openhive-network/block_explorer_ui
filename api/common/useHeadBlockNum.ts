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

  return { headBlockNumberData, headBlockNumberDataLoading, headBlockNumberDataError };
};

export default useHeadBlockNumber;
