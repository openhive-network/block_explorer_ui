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

  const getPercentage = (max: Long, current: Long) => {
    return max.toNumber() === 0 ? 0 : current.mul(100).div(max).toNumber();
  }

  const getManabars = async (accountName: string): Promise<Explorer.Manabars | null> => {
    if (!accountName) return null;
    const manabars = await fetchingService.getManabars(accountName);
    if (!manabars) return null;
    const {upvote, downvote, rc} = manabars;
    const processedManabars: Explorer.Manabars = {
      upvote: {
        max: upvote.max.toString(),
        current: upvote.current.toString(),
        percentageValue: getPercentage(upvote.max, upvote.current)
      },
      downvote: {
        max: downvote.max.toString(),
        current: downvote.current.toString(),
        percentageValue: getPercentage(downvote.max, downvote.current)
      },
      rc: {
        max: rc.max.toString(),
        current: rc.current.toString(),
        percentageValue: getPercentage(rc.max, rc.current)
      },
    }
    return processedManabars;
  }

  return { manabarsData, manabarsDataLoading, manabarsDataError };
};

export default useManabars;
