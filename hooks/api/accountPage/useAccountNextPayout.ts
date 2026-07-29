import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import fetchingService from "@/services/FetchingService";
import { convertToUTCDate } from "@/utils/TimeUtils";

const useAccountNextPayout = (accountName: string) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["account_posts_cashout", accountName],
    // Approximation: hivemind caps the page size at 20 and only offers
    // newest-first, so for a prolific author (hundreds of pending posts) the
    // oldest unpaid post — whose cashout is actually soonest — isn't in this
    // window, and the countdown can read later than reality. A precise value
    // needs the API to expose a next-cashout time. Accurate for the vast
    // majority of accounts (< 20 posts in the 7-day pending window).
    queryFn: () => fetchingService.getAccountPosts(accountName, 20),
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  const nextPayoutDate = useMemo(() => {
    if (!posts) return null;
    const now = Date.now();
    // Hive cashout_time is ISO without a zone marker; parse as UTC, not local.
    const future = posts
      .map((p) => convertToUTCDate(p.cashout_time).getTime())
      .filter((t) => t > now);
    if (future.length === 0) return null;
    return new Date(Math.min(...future));
  }, [posts]);

  return { nextPayoutDate, isLoading };
};

export default useAccountNextPayout;
