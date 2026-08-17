import { useQuery } from "@tanstack/react-query";

import Hive from "@/types/Hive";
import { config } from "@/Config";
import fetchingService from "@/services/FetchingService";

// One page is enough: the widget filters by category client-side.
const useAccountNotifications = (
  accountName: string | undefined,
  liveDataEnabled: boolean,
  limit: number = 50
) => {
  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery<Hive.AccountNotification[]>({
    queryKey: ["account_notifications", accountName, limit, liveDataEnabled],
    queryFn: () => fetchingService.getAccountNotifications(accountName!, limit),
    refetchInterval: liveDataEnabled ? config.accountRefreshInterval : false,
    refetchOnWindowFocus: false,
    enabled: !!accountName,
  });

  return { notifications, isLoading, isError };
};

export default useAccountNotifications;
