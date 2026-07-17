import { RequiredApi } from "@/utils/nodeSupport";

// Node-support requirement for a home widget:
//   app      - the optional HAF app it needs (proactively probed; a whole-app
//              outage gates the widget before it ever fetches).
//   endpoint - an optional finer key for a specific route that can be missing
//              even when the app is present (reactively detected on a 404).
export interface WidgetNodeSupport {
  app: RequiredApi;
  endpoint?: string;
}

// Core apps (hafah-api) and widgets backed only by them (live-info, last-blocks,
// top-witnesses, top-communities, market data, searches, ...) are never gated.
export const WIDGET_NODE_SUPPORT: Record<string, WidgetNodeSupport> = {
  // haf-stats-api — proactively probed (whole app absent on non-stats nodes) AND
  // reactively gated per endpoint, so a partial/5xx outage on one route still
  // degrades that widget to the graceful card instead of a raw error.
  "daily-active-users": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:daily-active-users",
  },
  "voting-activity": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:vote-stats",
  },
  "network-hp-distribution": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:hp-distribution",
  },
  "network-content-volume": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:content-volume",
  },
  "network-engagement": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:engagement",
  },
  "account-retention-funnel": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:account-funnel",
  },
  "network-author-retention": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:author-retention",
  },
  "top-accounts": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:top-accounts",
  },
  "network-rc-utilization": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:rc-utilization",
  },

  // haf-stats-api account analytics — proactive app probe + reactive per endpoint.
  "my-content-activity": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:content-stats",
  },
  "my-rc-footprint": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:dapp-footprint",
  },
  "my-rc-consumption": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:rc-footprint",
  },
  "my-financial-summary": {
    app: "haf-stats-api",
    endpoint: "haf-stats-api:financial-summary",
  },

  // balance-api — analytics routes can be missing while the app itself is present.
  "transfer-volume": {
    app: "balance-api",
    endpoint: "balance-api:transfer-statistics",
  },
  tvl: { app: "balance-api", endpoint: "balance-api:tvl" },
  "hp-momentum": { app: "balance-api", endpoint: "balance-api:vesting-stats" },

  // balance-api account widgets — gate only on whole-app presence.
  "top-holders": { app: "balance-api" },
  "my-wallet": { app: "balance-api" },
  "my-balance-history": { app: "balance-api" },
  "my-recurring-transfers": { app: "balance-api" },
  "my-hp-delegations": { app: "balance-api" },
  "my-rc-delegations": { app: "balance-api" },

  // hafbe-api analytics routes — present-but-missing-endpoint case.
  "op-mix": {
    app: "hafbe-api",
    endpoint: "hafbe-api:operation-type-statistics",
  },
  "network-growth": { app: "hafbe-api", endpoint: "hafbe-api:wallet-stats" },
  "tx-stats": {
    app: "hafbe-api",
    endpoint: "hafbe-api:transaction-statistics",
  },

  // Core hafbe-backed widgets — gate on whole-app presence so a node whose
  // hafbe-api is down/unreachable maps the failure onto the widget (graceful
  // card) instead of leaving it blank + flooding toasts.
  "top-witnesses": { app: "hafbe-api" },
  "last-blocks": { app: "hafbe-api" },
};

export const getWidgetNodeSupport = (
  widgetId: string
): WidgetNodeSupport | undefined => WIDGET_NODE_SUPPORT[widgetId];

// Distinct apps to proactively probe (deduped from the map above).
export const PROBED_APPS: RequiredApi[] = Array.from(
  new Set(Object.values(WIDGET_NODE_SUPPORT).map((c) => c.app))
);
