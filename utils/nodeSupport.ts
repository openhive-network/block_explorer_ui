// Node-support detection for widgets whose data depends on a HAF app/endpoint that
// isn't present on every node. Two distinct real-world failure modes need two
// different detectors (both verified against real nodes):
//
//   1. Whole app missing (e.g. haf-stats-api on api.hive.blog): every route,
//      including /version, 404s through nginx with an HTML body and NO CORS
//      headers, so the browser blocks the response and fetch THROWS with no
//      readable status. Only a PROACTIVE probe can see this -> probeAppSupported.
//
//   2. App present but a specific endpoint missing (e.g. balance-api/tvl on
//      api.hive.blog): PostgREST answers with a readable JSON 404. This can only
//      be known once the request is made -> classifyEndpointError (REACTIVE).

import { WaxError, WaxRequestAbortedByUser } from "@hiveio/wax";

// Optional HAF app groups (core hafah-api is always assumed present).
export type RequiredApi = "haf-stats-api" | "balance-api" | "hafbe-api";

// ---- Layer 1: proactive whole-app probe ----

const PROBE_ATTEMPTS = 3;
const PROBE_TIMEOUT_MS = 6000;

// True if the node serves the app (/version 200), false if missing/unreachable.
// A per-attempt timeout keeps a hanging node from blocking forever, and a couple
// of retries stop a transient blip from mislabelling a present app as missing.
export const probeAppSupported = async (
  node: string,
  app: RequiredApi,
  outerSignal?: AbortSignal
): Promise<boolean> => {
  const url = `${node.replace(/\/+$/, "")}/${app}/version`;

  for (let attempt = 0; attempt < PROBE_ATTEMPTS; attempt++) {
    if (outerSignal?.aborted) throw new Error("probe aborted");

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
    const relayAbort = () => ctrl.abort();
    outerSignal?.addEventListener("abort", relayAbort);
    try {
      const res = await fetch(url, { method: "GET", signal: ctrl.signal });
      if (res.ok) return true;
      // A missing route is definitive — don't waste retries on it.
      if (res.status === 404 || res.status === 501) return false;
      // Anything else (5xx / 429 / timeout) may be transient → fall through to retry.
    } catch (err) {
      if (outerSignal?.aborted) throw err;
    } finally {
      clearTimeout(timer);
      outerSignal?.removeEventListener("abort", relayAbort);
    }

    if (attempt === PROBE_ATTEMPTS - 1) return false;
    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }
  return false;
};

// ---- Layer 2: reactive endpoint-missing detection ----

// Thrown in place of a raw REST rejection when a present app is missing the
// specific endpoint a widget needs. `supportKey` is the widget's endpoint key.
export class EndpointUnsupportedError extends Error {
  readonly supportKey: string;
  // transient = the failure had no HTTP status (timeout / network / CORS) and
  // might be a blip, so it's worth a couple of retries before it sticks. A
  // definitive 404/501/shape-mismatch is not transient.
  readonly transient: boolean;

  constructor(
    supportKey: string,
    options?: { transient?: boolean; cause?: unknown }
  ) {
    super(`Endpoint unavailable on the active node (${supportKey})`);
    this.name = "EndpointUnsupportedError";
    this.supportKey = supportKey;
    this.transient = options?.transient ?? false;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

// A HAF "Amount" is the NAI object { nai, amount, precision }. Older nodes serve
// a bare string for these fields (verified: hiveapi.actifit.io returns
// total_transfer_amount as "1537221848" instead of {nai, amount, precision}),
// which the UI can't read -> a silent $0. Detecting the wrong shape lets a widget
// degrade gracefully instead (version-skew / failure mode #2).
export const isNaiAmount = (value: unknown): boolean =>
  !!value &&
  typeof value === "object" &&
  "amount" in (value as object) &&
  "nai" in (value as object);

const getHttpStatus = (err: unknown): number | undefined => {
  const status = (err as { response?: { status?: unknown } } | null)?.response
    ?.status;
  return typeof status === "number" ? status : undefined;
};

// Decide whether a REST rejection on a WRAPPED optional endpoint means the node
// can't serve it (real nodes surface this as a JSON 404, a timeout, OR a
// network/CORS error — verified against api.hive.blog). Everything wrapped here
// is a gated analytics endpoint, so any hard failure that isn't a user/navigation
// abort or a plain server error (5xx) is treated as "endpoint unavailable".
export const classifyEndpointError = (
  err: unknown,
  supportKey: string
): unknown => {
  if (err instanceof EndpointUnsupportedError) return err;
  // Query cancellation / navigation / tab close — not a supportKey problem.
  if (err instanceof WaxRequestAbortedByUser) return err;

  // Every remaining failure on a gated optional endpoint degrades to the
  // graceful "Unavailable" card instead of a raw error. A missing route
  // (404 / 501) is a definitive gap; anything else (5xx, timeout, network, CORS)
  // is treated as transient — still gated, but retried and periodically re-checked
  // so a node that was merely erroring recovers on its own.
  const status = getHttpStatus(err);
  const definitive = status === 404 || status === 501;
  return new EndpointUnsupportedError(supportKey, {
    transient: !definitive,
    cause: err,
  });
};
