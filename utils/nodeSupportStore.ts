// Module-level store of endpoints observed to be missing per REST node (Layer 2,
// reactive). It lives outside React because it's written from the React Query
// `queryCache.onError` handler (created in providers, above the context) and read
// by NodeSupportContext via useSyncExternalStore.

type Listener = () => void;

const reportedByNode: Record<string, Set<string>> = {};
const listeners = new Set<Listener>();
let version = 0;

export const nodeSupportStore = {
  report(node: string, supportKey: string) {
    if (!node) return;
    const set = reportedByNode[node] ?? (reportedByNode[node] = new Set());
    if (set.has(supportKey)) return;
    set.add(supportKey);
    version += 1;
    listeners.forEach((l) => l());
  },
  isReported(node: string, supportKey: string): boolean {
    return reportedByNode[node]?.has(supportKey) ?? false;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getVersion(): number {
    return version;
  },
};
