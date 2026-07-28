import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import fetchingService from "@/services/FetchingService";

const useAccountNextPayout = (accountName: string) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["account_posts_cashout", accountName],
    queryFn: () => fetchingService.getAccountPosts(accountName, 20),
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  const nextPayoutDate = useMemo(() => {
    if (!posts) return null;
    const now = Date.now();
    const future = posts
      .map((p) => new Date(p.cashout_time).getTime())
      .filter((t) => t > now);
    if (future.length === 0) return null;
    return new Date(Math.min(...future));
  }, [posts]);

  return { nextPayoutDate, isLoading };
};

export default useAccountNextPayout;
