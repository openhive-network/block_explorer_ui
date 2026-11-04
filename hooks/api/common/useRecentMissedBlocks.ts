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

const utcDay = () => moment.utc().format("YYYY-MM-DD");

const toMap = (rows?: Hive.WitnessMissedBlocksResponse[]) =>
  new Map((rows ?? []).map((row) => [row.producer ?? "", row]));

// The API counts whole UTC days and reads only the date of from_date, so the
// windows are UTC calendar days: today, and today plus the previous 6 days.
// One call per window covers the whole table, or one witness when named.
const useRecentMissedBlocks = (witness?: string) => {
  const [today, setToday] = useState(utcDay);
  useEffect(() => {
    const id = setInterval(() => setToday(utcDay()), 60_000);
    return () => clearInterval(id);
  }, []);
  // Derived from the UTC day alone, so every caller shares one query key.
  const todayStart = useMemo(() => moment.utc(today).toDate(), [today]);
  const weekStart = useMemo(
    () => moment.utc(today).subtract(6, "days").toDate(),
    [today]
  );

  const { isSupported, isEndpointUnsupported } = useNodeSupport();
  const cap = getWidgetNodeSupport("witness-missed-blocks");
  const isAvailable =
    isSupported(cap?.app) !== false && !isEndpointUnsupported(cap?.endpoint);

  // to_date is left out: the API defaults it to now, which keeps today live.
  const options = {
    witness,
    limitCount: witness ? undefined : config.witnessMissedBlocksLimit,
    enabled: isAvailable,
    refetchInterval: config.witnessMissedBlocksRefreshInterval,
  };
  const day = useWitnessMissedBlocks({ ...options, fromDate: todayStart });
  const week = useWitnessMissedBlocks({ ...options, fromDate: weekStart });

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
    // A failed refresh keeps the cached rows, so only a window with no data is unknown.
    isDayUnknown: day.missedBlocksData === undefined,
    isWeekUnknown: week.missedBlocksData === undefined,
    getRecentMissed,
  };
};

export type RecentMissedBlocksState = ReturnType<typeof useRecentMissedBlocks>;

export default useRecentMissedBlocks;
