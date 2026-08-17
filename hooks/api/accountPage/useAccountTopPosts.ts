import { useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

// bridge caps a page at 20, so 20 is the widest net for a 10-post list.
const OVER_FETCH = 2;

const useAccountTopPosts = (
  accountName: string | undefined,
  liveDataEnabled: boolean,
  limit: number = 10
) => {
  const {
    data: topPosts,
    isLoading,
    isError,
  } = useQuery<Hive.AccountPostSummary[]>({
    // Poll interval only — see useAccountNotifications.
    queryKey: ["account_top_posts", accountName, limit],
    queryFn: async () => {
      // bridge ranks posts and comments together, so over-fetch then filter.
      const posts = await fetchingService.getAccountTopPosts(
        accountName!,
        limit * OVER_FETCH
      );
      return (posts ?? []).filter((post) => post.depth === 0).slice(0, limit);
    },
    refetchInterval: liveDataEnabled ? config.contentRefreshInterval : false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!accountName,
  });

  return { topPosts, isLoading, isError };
};

export default useAccountTopPosts;
