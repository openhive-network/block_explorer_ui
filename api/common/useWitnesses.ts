import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";


const useWitnesses = (
  witnessesLimit: number,
  orderBy: string,
  orderIs: string
) => {
  const {
    data: witnessesData,
    isLoading: isWitnessDataLoading,
    isError: isWitnessDataError,
  } = useQuery({
    queryKey: ["witnesses", witnessesLimit, orderBy, orderIs],
    queryFn: () =>
      fetchingService.getWitnesses(witnessesLimit, 0, orderBy, orderIs),
    refetchOnWindowFocus: false,
  });

  return { witnessesData, isWitnessDataLoading, isWitnessDataError };
};

export default useWitnesses;
