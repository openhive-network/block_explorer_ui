import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useWitnesses = (
  witnessesLimit: number,
  orderBy: string,
  orderIs: "asc" | "desc",
  enabled: boolean = true 
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
    enabled: enabled,
  });

  return { witnessesData, isWitnessDataLoading, isWitnessDataError };
};

export default useWitnesses;
