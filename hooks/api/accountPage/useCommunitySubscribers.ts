import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type Hive from "@/types/Hive";

const SUBSCRIBERS_PAGE_LIMIT = config.standardPaginationSize;

// The list is alphabetical; `startAfter` begins it right after that subscriber.
const useCommunitySubscribers = (
  communityName: string,
  startAfter?: string
) => {
  const {
    data,
    isLoading: isCommunitySubscribersLoading,
    isError: isCommunitySubscribersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Hive.CommunitySubscriber[]>({
    queryKey: ["communitySubscribers", communityName, startAfter],
    queryFn: async ({ pageParam = startAfter }) => {
      try {
        const rawResult = await fetchingService.getCommunitySubscribers(
          communityName,
          pageParam,
          SUBSCRIBERS_PAGE_LIMIT
        );

        if (!Array.isArray(rawResult)) {
          return [];
        }

        // Each entry arrives as [name, role, title, subscribed at].
        return rawResult.map(
          (subscriberTuple: any[]): Hive.CommunitySubscriber => ({
            name: subscriberTuple[0],
            role: subscriberTuple[1],
            title: subscriberTuple[2],
            created_at: subscriberTuple[3],
          })
        );
      } catch (error: any) {
        return [];
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < SUBSCRIBERS_PAGE_LIMIT) {
        return undefined;
      }
      return lastPage[lastPage.length - 1]?.name;
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

// Answers "is this account subscribed?" in one request: the node rejects a
// list that starts after a name that is not a subscriber.
export const useCommunitySubscriberLookup = (
  communityName: string,
  accountName: string
) => {
  const {
    data: isSubscribed,
    isFetching: isLookupLoading,
    isError: isLookupError,
  } = useQuery<boolean>({
    queryKey: ["communitySubscriberLookup", communityName, accountName],
    queryFn: async () => {
      try {
        await fetchingService.getCommunitySubscribers(
          communityName,
          accountName,
          1
        );
        return true;
      } catch (error: any) {
        const text = `${error?.message ?? ""} ${JSON.stringify(error ?? {})}`;
        if (/does not exist|invalid account/i.test(text)) return false;
        throw error;
      }
    },
    enabled: !!communityName && !!accountName,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return { isSubscribed, isLookupLoading, isLookupError };
};

export default useCommunitySubscribers;
