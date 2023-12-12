import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Hive from "@/types/Hive";
import Explorer from "@/types/Explorer";

const useManabars = (accountName: string) => {
  const {
    data: manabarsData,
    isLoading: manabarsDataLoading,
    isError: manabarsDataError,
  }: UseQueryResult<Hive.AccountDetailsQueryResponse> = useQuery({
    queryKey: ["manabars", accountName],
    queryFn: () => getManabars(accountName),
    refetchOnWindowFocus: false,
  });

  const getManabars = async (accountName: string): Promise<Explorer.Manabars | null> => {
    if (!accountName) {return null}
    const manabars = await fetchingService.getManabars(accountName);
    const processedManabars: Explorer.Manabars = {
      upvote: {
        max: manabars.upvote.max.toNumber(),
        current: manabars.upvote.current.toNumber(),
      },
      downvote: {
        max: manabars.downvote.max.toNumber(),
        current: manabars.downvote.current.toNumber(),
      },
      rc: {
        max: manabars.rc.max.toNumber(),
        current: manabars.rc.current.toNumber(),
      },
    }
    return processedManabars;
  }

  return { manabarsData, manabarsDataLoading, manabarsDataError };
};

export default useManabars;
