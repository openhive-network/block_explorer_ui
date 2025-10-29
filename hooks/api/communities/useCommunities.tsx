import { useInfiniteQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import type Hive from "@/types/Hive";

const DEFAULT_COMMUNITIES_LIMIT = config.standardPaginationSize;

export type CommunitySortOrder = "rank" | "new" | "subs";



const useCommunities = (
  query: string = "",
  sort: CommunitySortOrder = "rank",
  limit: number = DEFAULT_COMMUNITIES_LIMIT,
  enabled: boolean = true 
) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Hive.CommunityList, Error>({
    queryKey: ["communities", query, sort, limit],
    queryFn: ({ pageParam }) =>
      fetchingService.getCommunitiesList(pageParam, limit, query, sort),
    enabled: enabled,
    getNextPageParam: (lastPage) => {
      const pageAsArray = Object.values(lastPage);
      if (pageAsArray.length < limit) {
        return undefined; // No more pages
      }

      const lastCommunity = pageAsArray[pageAsArray.length - 1];
      return lastCommunity?.name;
    },

    refetchOnWindowFocus: false,
  });

  const communities =
    data?.pages.flatMap((pageObject) => Object.values(pageObject)) || [];

  return {
    communities,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useCommunities;
