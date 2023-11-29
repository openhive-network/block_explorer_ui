import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";

const useWitnesses = () => {
  const {
    data: witnessData,
    isLoading: isWitnessDataLoading,
    isError: isWitnessDataError,
  } = useQuery({
    queryKey: ["witnesses"],
    queryFn: () => fetchingService.getWitnesses(200, 0, "votes", "desc"),
    refetchOnWindowFocus: false,
  });

  return { witnessData, isWitnessDataLoading, isWitnessDataError };
};

export default useWitnesses;
