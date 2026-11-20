import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adjustDynamicGlobalBlockData } from "@/utils/QueryDataSelectors";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import fetchingService from "@/services/FetchingService";

// For callers that read only the VESTS <-> HP ratio, which moves by about
// 3 ppm an hour: a newly mounted one need not refetch the globals.
export const VESTING_RATIO_STALE_MS = 5 * 60 * 1000;

const getGlobalBlockData = () =>
  Promise.all([
    fetchingService.getDynamicGlobalProperties(),
    fetchingService.getCurrentPriceFeed(),
    fetchingService.getRewardFunds(),
  ]);
type GlobalBlockData = Awaited<ReturnType<typeof getGlobalBlockData>>;

// React Query runs `select` once per component using this hook, and the wax
// formatting in adjustDynamicGlobalBlockData is heavy: with one hook per card,
// the proposals page spent seconds formatting the same payload hundreds of
// times (#876). Each fetched payload is formatted once and shared.
const adjustedByPayload = new WeakMap<
  GlobalBlockData,
  ReturnType<typeof adjustDynamicGlobalBlockData>
>();
export const selectGlobalBlockData = (
  data: GlobalBlockData,
  hiveChain: Parameters<typeof adjustDynamicGlobalBlockData>[3]
) => {
  let adjusted = adjustedByPayload.get(data);
  if (!adjusted) {
    adjusted = adjustDynamicGlobalBlockData(
      data[0],
      data[1],
      data[2].funds,
      hiveChain
    );
    adjustedByPayload.set(data, adjusted);
  }
  return adjusted;
};

const useDynamicGlobal = (headBlockNum?: number, staleTime?: number) => {
  const { hiveChain } = useHiveChainContext();

  const {
    data: dynamicGlobalData,
    isPending: dynamicGlobalLoading,
    isError: dynamicGlobalError,
  } = useQuery({
    queryKey: [`global`, headBlockNum],
    queryFn: getGlobalBlockData,
    select: (dynamicGlobalBlockData) =>
      selectGlobalBlockData(dynamicGlobalBlockData, hiveChain!),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    // Only when given: an explicit undefined would replace the app default.
    ...(staleTime !== undefined ? { staleTime } : {}),
  });

  return { dynamicGlobalData, dynamicGlobalLoading, dynamicGlobalError };
};

export default useDynamicGlobal;
