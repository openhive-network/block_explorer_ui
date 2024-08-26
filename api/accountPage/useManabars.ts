import { useQuery, UseQueryResult } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import Explorer from "@/types/Explorer";
import Long from "long";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { config } from "@/Config";

const useManabars = (accountName: string, liveDataEnabled: boolean) => {
  const {
    data: manabarsData,
    isLoading: manabarsDataLoading,
    isError: manabarsDataError,
  }: UseQueryResult<Explorer.Manabars | null> = useQuery({
    queryKey: ["manabars", accountName],
    queryFn: () => getManabars(accountName),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
  });

  const { hiveChain } = useHiveChainContext();

  const getManabars = async (
    accountName: string
  ): Promise<Explorer.Manabars | null> => {
    if (!accountName || !hiveChain) return null;
    const manabars = await fetchingService.getManabars(accountName, hiveChain);
    if (!manabars) return null;
    const { upvote, downvote, rc } = manabars;
    const processedManabars: Explorer.Manabars = {
      upvote: {
        max: hiveChain.formatter.formatNumber(upvote.max),
        current: hiveChain.formatter.formatNumber(upvote.current),
        percentageValue: upvote.percent,
      },
      downvote: {
        max: hiveChain.formatter.formatNumber(downvote.max),
        current: hiveChain.formatter.formatNumber(downvote.current),
        percentageValue: downvote.percent,
      },
      rc: {
        max: hiveChain.formatter.formatNumber(rc.max),
        current: hiveChain.formatter.formatNumber(rc.current),
        percentageValue: rc.percent,
      },
    };
    return processedManabars;
  };

  return {
    manabarsData,
    manabarsDataLoading,
    manabarsDataError,
  };
};

export default useManabars;
