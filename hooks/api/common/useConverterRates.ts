import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { parseChainDate } from "@/utils/TimeUtils";
import { toConverterRates } from "@/utils/unitConverter";

// The feed moves hourly and the VESTS ratio by a few ppm an hour, so a
// minute keeps the "as of" line honest without hammering the node.
const REFRESH_MS = 60 * 1000;

// Rates for the Tools hub unit converter. The market ticker is optional: if
// it fails the converter still works off the chain's own figures.
const useConverterRates = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["converterRates"],
    queryFn: async () => {
      const [globals, feed, ticker] = await Promise.all([
        fetchingService.getDynamicGlobalProperties(),
        fetchingService.getCurrentPriceFeed(),
        fetchingService.getMarketTicker().catch(() => null),
      ]);
      return {
        rates: toConverterRates(
          globals.total_vesting_fund_hive,
          globals.total_vesting_shares,
          feed,
          ticker?.latest ?? null
        ),
        asOf: parseChainDate(globals.time),
      };
    },
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    staleTime: REFRESH_MS / 2,
    meta: { suppressErrorToast: true },
  });

  return {
    rates: data?.rates ?? null,
    asOf: data?.asOf ?? null,
    isRatesLoading: isPending,
    // A failed background refresh keeps the last rates on screen.
    isRatesError: isError && !data,
  };
};

export default useConverterRates;
