import { config } from "@/Config";

// Demand-based, not route-based: the witness schedule renders both at /schedule
// and as a dashboard widget, and a pathname check only covered the first.
export const headBlockRefreshInterval = (
  liveData: boolean,
  liveConsumers: number
): number | false => {
  if (liveData) return config.mainRefreshInterval;
  if (liveConsumers > 0) return config.scheduleRefreshInterval;
  return false;
};
