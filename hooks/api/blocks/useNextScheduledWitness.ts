import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import {
  isScheduleStale,
  nextScheduledAfterProducer,
} from "@/utils/nextScheduledWitness";

// Anchored on the row the caller passes rather than on a head-block query, so
// the name always describes the newest block the table is actually showing.
const useNextScheduledWitness = (
  enabled: boolean,
  headProducer?: string,
  headBlockNumber?: number
) => {
  // Shares the cache with /schedule.
  const { data: schedule, refetch: refetchSchedule } = useQuery({
    queryKey: ["witness_schedule"],
    queryFn: () => fetchingService.getWitnessSchedule(),
    enabled,
    refetchOnWindowFocus: false,
  });

  const stale = isScheduleStale(
    headBlockNumber,
    schedule?.next_shuffle_block_num
  );

  useEffect(() => {
    if (enabled && stale) refetchSchedule();
  }, [enabled, stale, refetchSchedule]);

  return {
    nextWitness: nextScheduledAfterProducer(
      schedule?.current_shuffled_witnesses,
      headProducer,
      schedule?.future_shuffled_witnesses
    ),
  };
};

export default useNextScheduledWitness;
