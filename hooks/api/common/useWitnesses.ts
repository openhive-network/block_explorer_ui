import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";

const useWitnesses = (
  witnessesLimit: number,
  orderBy: string,
  orderIs: "asc" | "desc",
  enabled: boolean = true,
  page: number = 1
) => {
  const {
    data: witnessesData,
    isLoading: isWitnessDataLoading,
    isError: isWitnessDataError,
  } = useQuery({
    queryKey: ["witnesses", witnessesLimit, orderBy, orderIs, page],
    queryFn: () =>
      fetchingService.getWitnesses(witnessesLimit, page, orderBy, orderIs),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: enabled,
  });

  return { witnessesData, isWitnessDataLoading, isWitnessDataError };
};

export default useWitnesses;
