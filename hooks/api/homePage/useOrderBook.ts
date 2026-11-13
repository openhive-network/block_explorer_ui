import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { ORDER_BOOK_START, toBookRows } from "@/utils/orderBook";

// 50 a side covers the visible depth; 1000 takes ~6s and trips the node timeout.
export const ORDER_BOOK_DEPTH = 50;
const REFRESH_MS = 30 * 1000;

// Every open order on the internal HIVE/HBD market, best price first per side.
const useOrderBook = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["orderBook", ORDER_BOOK_DEPTH],
    queryFn: async () => {
      const [asks, bids] = await Promise.all([
        fetchingService.getOrderBookSide(
          ORDER_BOOK_START.asks,
          ORDER_BOOK_DEPTH
        ),
        fetchingService.getOrderBookSide(
          ORDER_BOOK_START.bids,
          ORDER_BOOK_DEPTH
        ),
      ]);
      return { asks: toBookRows(asks, "asks"), bids: toBookRows(bids, "bids") };
    },
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: false,
    staleTime: REFRESH_MS / 2,
    meta: { suppressErrorToast: true },
  });

  return {
    asks: data?.asks ?? [],
    bids: data?.bids ?? [],
    isOrderBookLoading: isPending,
    isOrderBookError: isError,
  };
};

export default useOrderBook;
