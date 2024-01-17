import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useWitnesses = (witnessesLimit: number) => {
  const {
    data: witnessData,
    isLoading: isWitnessDataLoading,
    isError: isWitnessDataError,
  } = useQuery({
    queryKey: ["witnesses", witnessesLimit],
    queryFn: () => fetchingService.getWitnesses(witnessesLimit, 0, "votes", "desc"),
    refetchOnWindowFocus: false,
  });

  return { witnessData, isWitnessDataLoading, isWitnessDataError };
};

export default useWitnesses;
