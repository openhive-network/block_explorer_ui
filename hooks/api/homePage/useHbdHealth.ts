import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { config } from "@/Config";
import Hive from "@/types/Hive";
import {
  buildHbdHealth,
  HbdHealthGranularity,
  TREASURY_ACCOUNT,
  treasuryGranularity,
} from "@/utils/hbdHealth";

// HBD supply, gross share and interest rate from hafbe, joined with the DHF
// treasury's HBD from balance-api for the protocol (treasury-adjusted) ratio.
// The treasury query is optional: without it the protocol ratio is left empty.
const useHbdHealth = (
  granularity: HbdHealthGranularity,
  fromDate?: Date | number,
  toDate?: Date | number,
  liveDataEnabled?: boolean
) => {
  const refetchInterval = liveDataEnabled ? config.mainRefreshInterval : false;

  const statusQuery = useQuery({
    queryKey: ["hbd_status", granularity, fromDate, toDate],
    queryFn: () =>
      fetchingService.getHbdStatus(granularity, "asc", fromDate, toDate),
    refetchInterval,
    refetchOnWindowFocus: false,
  });

  const treasuryQuery = useQuery({
    queryKey: [
      "hbd_treasury",
      treasuryGranularity(granularity),
      fromDate,
      toDate,
    ],
    // The route returns an array; the fetcher's declared type predates that.
    queryFn: () =>
      fetchingService.geAccountAggregatedtBalanceHistory(
        TREASURY_ACCOUNT,
        "HBD",
        treasuryGranularity(granularity),
        "asc",
        fromDate,
        toDate
      ) as unknown as Promise<Hive.AccountAggregatedBalanceHistoryResponse[]>,
    refetchInterval,
    refetchOnWindowFocus: false,
  });

  const points = useMemo(
    () => buildHbdHealth(statusQuery.data, treasuryQuery.data),
    [statusQuery.data, treasuryQuery.data]
  );

  return {
    points,
    // The chart waits for both, so the protocol line doesn't pop in later.
    isLoading: statusQuery.isPending || treasuryQuery.isPending,
    isError: statusQuery.isError,
    isTreasuryError: treasuryQuery.isError,
  };
};

export default useHbdHealth;
