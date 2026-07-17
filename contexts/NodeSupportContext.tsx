import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import useApiAddresses from "@/utils/ApiAddresses";
import { probeAppSupported, RequiredApi } from "@/utils/nodeSupport";
import { nodeSupportStore } from "@/utils/nodeSupportStore";
import { PROBED_APPS } from "@/components/dashboard/lib/widgetNodeSupport";

// Detects which optional HAF apps/endpoints the active REST node supports.
//   isSupported(app):            true / false / undefined(pending) — proactive
//                                whole-app probe (Layer 1).
//   isEndpointUnsupported(key):  a specific route was observed missing on this
//                                node (Layer 2, reactive via nodeSupportStore).
interface NodeSupportContextValue {
  isSupported: (app?: RequiredApi | null) => boolean | undefined;
  isEndpointUnsupported: (endpoint?: string | null) => boolean;
}

const NodeSupportContext = createContext<NodeSupportContextValue | undefined>(
  undefined
);

// How often to re-probe apps still marked unsupported/unresolved, so a node that
// was transiently down or 5xx-ing recovers without a manual page reload.
const RE_PROBE_INTERVAL_MS = 30000;

export const NodeSupportContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { apiAddress } = useApiAddresses();
  const node = apiAddress ?? "";

  // Layer 1 — proactive probe results, keyed `${node}::${app}`.
  const [supportMap, setSupportMap] = useState<Record<string, boolean>>({});
  // Keys with a probe in flight. Used only to avoid launching duplicate probes;
  // freed on resolve/abort so a remount (StrictMode / fast nav) can re-probe.
  const inFlight = useRef<Set<string>>(new Set());
  const supportMapRef = useRef(supportMap);
  supportMapRef.current = supportMap;

  useEffect(() => {
    if (!node) return;
    const controller = new AbortController();
    const startedHere: string[] = [];
    const inFlightSet = inFlight.current;

    PROBED_APPS.forEach(async (app) => {
      const key = `${node}::${app}`;
      if (supportMapRef.current[key] !== undefined || inFlightSet.has(key)) {
        return;
      }
      inFlightSet.add(key);
      startedHere.push(key);
      try {
        const ok = await probeAppSupported(node, app, controller.signal);
        setSupportMap((prev) => ({ ...prev, [key]: ok }));
      } catch {
        // aborted / threw — leave unresolved so a later run retries
      } finally {
        inFlightSet.delete(key);
      }
    });

    return () => {
      controller.abort();
      // Free the keys this run started SYNCHRONOUSLY (the aborted fetch's finally
      // runs later, in a microtask). Without this, a StrictMode/remount second
      // run early-returns on still-in-flight keys and the probe never restarts.
      startedHere.forEach((key) => inFlightSet.delete(key));
    };
  }, [node]);

  // Recovery: periodically re-probe apps currently unsupported (false) or still
  // unresolved (undefined), so a node that was down / 5xx-ing flips back to
  // supported on its own. Apps already known supported (true) are left alone.
  useEffect(() => {
    if (!node) return;
    const controller = new AbortController();
    const inFlightSet = inFlight.current;

    const id = setInterval(() => {
      // Reactive layer: drop transient endpoint reports so a healed node's
      // widgets remount and retry (definitive 404/501 reports are kept).
      nodeSupportStore.clearTransient(node);
      // Proactive layer: re-probe apps still unsupported/unresolved.
      PROBED_APPS.forEach(async (app) => {
        const key = `${node}::${app}`;
        if (supportMapRef.current[key] === true || inFlightSet.has(key)) return;
        inFlightSet.add(key);
        try {
          const ok = await probeAppSupported(node, app, controller.signal);
          setSupportMap((prev) => ({ ...prev, [key]: ok }));
        } catch {
          // aborted / threw — leave as-is for the next interval
        } finally {
          inFlightSet.delete(key);
        }
      });
    }, RE_PROBE_INTERVAL_MS);

    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [node]);

  // Layer 2 — subscribe to reactive endpoint reports.
  const storeVersion = useSyncExternalStore(
    nodeSupportStore.subscribe,
    nodeSupportStore.getVersion,
    nodeSupportStore.getVersion
  );

  const isSupported = useCallback(
    (app?: RequiredApi | null): boolean | undefined => {
      if (!app) return true;
      return supportMap[`${node}::${app}`];
    },
    [supportMap, node]
  );

  const isEndpointUnsupported = useCallback(
    (endpoint?: string | null): boolean =>
      !!endpoint && nodeSupportStore.isReported(node, endpoint),
    [node]
  );

  const value = useMemo(
    () => ({ isSupported, isEndpointUnsupported }),
    // storeVersion is an invalidation key: a new report bumps it, producing a new
    // context value so consumers (gates, library) re-render and re-read the store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSupported, isEndpointUnsupported, storeVersion]
  );

  return (
    <NodeSupportContext.Provider value={value}>
      {children}
    </NodeSupportContext.Provider>
  );
};

export const useNodeSupport = (): NodeSupportContextValue => {
  const ctx = useContext(NodeSupportContext);
  if (!ctx) {
    throw new Error(
      "useNodeSupport must be used within a NodeSupportContextProvider"
    );
  }
  return ctx;
};
