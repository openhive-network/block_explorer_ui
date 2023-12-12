import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";

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
    const processedManabars: Explorer.Manabars = {
      upvote: {
        max: manabars.upvote.max.toString(),
        current: manabars.upvote.current.toString(),
        percentageValue: manabars.upvote.current.mul(100).div(manabars.upvote.max).toNumber()
      },
      downvote: {
        max: manabars.downvote.max.toString(),
        current: manabars.downvote.current.toString(),
        percentageValue: manabars.downvote.current.mul(100).div(manabars.downvote.max).toNumber()
      },
      rc: {
        max: manabars.rc.max.toString(),
        current: manabars.rc.current.toString(),
        percentageValue: manabars.rc.current.mul(100).div(manabars.rc.max).toNumber()
      },
    }
    return processedManabars;
  }

  return { manabarsData, manabarsDataLoading, manabarsDataError };
};

export default useManabars;
