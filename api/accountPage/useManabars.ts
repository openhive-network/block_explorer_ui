import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import Long from "long";

const useManabars = (accountName: string) => {
  const {
    data: manabarsData,
    isLoading: manabarsDataLoading,
    isError: manabarsDataError,
  }: UseQueryResult<Explorer.Manabars | null> = useQuery({
    queryKey: ["manabars", accountName],
    queryFn: () => getManabars(accountName),
    refetchOnWindowFocus: false,
  });

  const getManabars = async (accountName: string): Promise<Explorer.Manabars | null> => {
    if (!accountName) return null;
    const manabars = await fetchingService.getManabars(accountName);
    if (!manabars) return null;
    const {upvote, downvote, rc} = manabars;
    const processedManabars: Explorer.Manabars = {
      upvote: {
        max: upvote.max.toString(),
        current: upvote.current.toString(),
        percentageValue: upvote.percent
      },
      downvote: {
        max: downvote.max.toString(),
        current: downvote.current.toString(),
        percentageValue: downvote.percent
      },
      rc: {
        max: rc.max.toString(),
        current: rc.current.toString(),
        percentageValue: rc.percent
      },
    }
    return processedManabars;
  }

  return { manabarsData, manabarsDataLoading, manabarsDataError };
};

export default useManabars;
