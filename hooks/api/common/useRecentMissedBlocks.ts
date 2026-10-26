import { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";

import useWitnessMissedBlocks from "@/hooks/api/homePage/useWitnessMissedBlocks";
import { useNodeSupport } from "@/contexts/NodeSupportContext";
import { getWidgetNodeSupport } from "@/components/dashboard/lib/widgetNodeSupport";
import Hive from "@/types/Hive";
import { config } from "@/Config";

export interface RecentMissedBlocks {
  day?: Hive.WitnessMissedBlocksResponse;
  week?: Hive.WitnessMissedBlocksResponse;
}

const roundedNow = () => new Date(Math.floor(Date.now() / 60000) * 60000);

const toMap = (rows?: Hive.WitnessMissedBlocksResponse[]) =>
  new Map((rows ?? []).map((row) => [row.producer ?? "", row]));

// Missed blocks over the last 24 hours and 7 days: one grouped call per window
// for the whole table, or filtered to one witness when a name is given.
const useRecentMissedBlocks = (witness?: string) => {
  const [now, setNow] = useState(roundedNow);
  useEffect(() => {
    const id = setInterval(
      () => setNow(roundedNow()),
      config.witnessMissedBlocksRefreshInterval
    );
    return () => clearInterval(id);
  }, []);
  const dayAgo = useMemo(
    () => moment.utc(now).subtract(1, "day").toDate(),
    [now]
  );
  const weekAgo = useMemo(
    () => moment.utc(now).subtract(7, "days").toDate(),
    [now]
  );

  const { isSupported, isEndpointUnsupported } = useNodeSupport();
  const cap = getWidgetNodeSupport("witness-missed-blocks");
  const isAvailable =
    isSupported(cap?.app) !== false && !isEndpointUnsupported(cap?.endpoint);

  const options = {
    toDate: now,
    witness,
    limitCount: witness ? undefined : config.witnessMissedBlocksLimit,
    enabled: isAvailable,
  };
  const day = useWitnessMissedBlocks({ ...options, fromDate: dayAgo });
  const week = useWitnessMissedBlocks({ ...options, fromDate: weekAgo });

  const dayByProducer = useMemo(
    () => toMap(day.missedBlocksData),
    [day.missedBlocksData]
  );
  const weekByProducer = useMemo(
    () => toMap(week.missedBlocksData),
    [week.missedBlocksData]
  );

  const getRecentMissed = useCallback(
    (name: string): RecentMissedBlocks => ({
      day: dayByProducer.get(name),
      week: weekByProducer.get(name),
    }),
    [dayByProducer, weekByProducer]
  );

  return {
    isAvailable,
    isLoading: day.isMissedBlocksLoading || week.isMissedBlocksLoading,
    isError: day.isMissedBlocksError || week.isMissedBlocksError,
    isDayUnknown: day.isMissedBlocksLoading || day.isMissedBlocksError,
    isWeekUnknown: week.isMissedBlocksLoading || week.isMissedBlocksError,
    getRecentMissed,
  };
};

export type RecentMissedBlocksState = ReturnType<typeof useRecentMissedBlocks>;

export default useRecentMissedBlocks;
