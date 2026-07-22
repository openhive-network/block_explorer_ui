// Module-level store of endpoints observed to be missing per REST node (Layer 2,
// reactive). It lives outside React because it's written from the React Query
// `queryCache.onError` handler (created in providers, above the context) and read
// by NodeSupportContext via useSyncExternalStore.

type Listener = () => void;

// Per node: endpoint supportKey -> transient. A definitive report (404/501, i.e.
// the route is genuinely absent) sticks; a transient one (5xx/timeout/network)
// can be cleared periodically so a recovered node's widgets come back.
const reportedByNode: Record<string, Map<string, boolean>> = {};
const listeners = new Set<Listener>();
let version = 0;

const notify = () => {
  version += 1;
  listeners.forEach((l) => l());
};

export const nodeSupportStore = {
  report(node: string, supportKey: string, transient = false) {
    if (!node) return;
    const map = reportedByNode[node] ?? (reportedByNode[node] = new Map());
    const prev = map.get(supportKey);
    // Already recorded with the same (or a stickier, definitive) severity.
    if (prev === false || prev === transient) return;
    map.set(supportKey, transient);
    notify();
  },
  isReported(node: string, supportKey: string): boolean {
    return reportedByNode[node]?.has(supportKey) ?? false;
  },
  // True only when the endpoint is reported AND its report is transient (a
  // recoverable 5xx/timeout/network blip), not a definitive route-missing gap.
  isTransient(node: string, supportKey: string): boolean {
    return reportedByNode[node]?.get(supportKey) === true;
  },
  // Drop transient reports for a node so its widgets retry; definitive
  // (route-missing) reports are kept.
  clearTransient(node: string) {
    const map = reportedByNode[node];
    if (!map) return;
    let changed = false;
    for (const [key, transient] of map) {
      if (transient) {
        map.delete(key);
        changed = true;
      }
    }
    if (changed) notify();
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getVersion(): number {
    return version;
  },
};
