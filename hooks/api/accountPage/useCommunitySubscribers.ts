// hooks/api/accountPage/useCommunitySubscribers.ts

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import { useInfiniteQuery } from "@tanstack/react-query";
import type Hive from "@/types/Hive";

const SUBSCRIBERS_PAGE_LIMIT = config.standardPaginationSize;

const useCommunitySubscribers = (communityName: string ) => {
  const {
    data,
    isLoading : isCommunitySubscribersLoading,
    isError :isCommunitySubscribersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Hive.CommunitySubscriber[]>({
    queryKey: ["communitySubscribers", communityName],
    queryFn: async ({ pageParam }) => {
      try {
        const rawResult = await fetchingService.getCommunitySubscribers(
          communityName,
          pageParam,
          SUBSCRIBERS_PAGE_LIMIT
        );

        // 1. Check if the result is a valid array.
        if (!Array.isArray(rawResult)) {
          return [];
        }

        // 2. Transform the array of arrays into an array of objects.
        const transformedSubscribers = rawResult.map((subscriberTuple: any[]): Hive.CommunitySubscriber => {
          return {
            name: subscriberTuple[0],
            created_at: subscriberTuple[3],
          };
        });

        return transformedSubscribers;

      } catch (error: any) {
        return [];
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < SUBSCRIBERS_PAGE_LIMIT) {
        return undefined;
      }
      const lastSubscriber = lastPage[lastPage.length - 1];
      const nextCursor = lastSubscriber?.name;
      return nextCursor;
    },
    enabled: !!communityName,
    refetchOnWindowFocus: false,
  });

  const subscribersData = data?.pages.flatMap((page) => page) || [];

  return {
    subscribersData,
    isCommunitySubscribersLoading,
    isCommunitySubscribersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useCommunitySubscribers;