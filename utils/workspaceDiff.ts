// Compares the chain copy against this device's. Typed structurally and free of
// app imports so it stays unit-testable without a circular dependency.

interface DiffableLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiffableBundle {
  theme: string;
  locale: string;
  settings: unknown;
  dashboard: {
    layout: Record<string, DiffableLayoutItem[] | undefined>;
    widgets: Array<{ i: string; type: string }>;
    widgetStates: Record<string, any>;
  };
  watchlist: Record<string, Array<number | string>>;
  proposalChanges: number[];
  witnessHealthSort: unknown;
}

export interface WorkspaceDiff {
  /** Widget types the chain copy has that this device does not. */
  added: string[];
  /** Widget types this device has that the chain copy does not — what a restore costs. */
  removed: string[];
  /** Total instances, so "Top Holders ×2" is not reported as one. */
  addedCount: number;
  removedCount: number;
  /** Position or size moved, for widgets both copies share. */
  layoutChanged: boolean;
  /** Widget content — note text, links, titles — for widgets both copies share. */
  contentChanged: boolean;
  settingsChanged: boolean;
  watchlistChanged: boolean;
  /** Nothing worth reporting. Should not happen, but the caller can degrade. */
  identical: boolean;
}

const countByType = (widgets: Array<{ type: string }>): Map<string, number> => {
  const counts = new Map<string, number>();
  widgets.forEach((w) => counts.set(w.type, (counts.get(w.type) ?? 0) + 1));
  return counts;
};

// Order is not meaningful in these, so compare them as sets.
const sameUnordered = (a: unknown, b: unknown): boolean =>
  JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return [...value].map(normalize).sort((x, y) => {
      const xs = JSON.stringify(x);
      const ys = JSON.stringify(y);
      return xs < ys ? -1 : xs > ys ? 1 : 0;
    });
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0))
        .map(([k, v]) => [k, normalize(v)])
    );
  }
  return value;
};

// isCollapsed is UI state, not authorship — the sync fingerprint ignores it too.
const meaningfulState = (state: unknown): unknown => {
  if (!state || typeof state !== "object") return state;
  const { isCollapsed: _ignored, ...rest } = state as Record<string, unknown>;
  return rest;
};

const placement = (item: DiffableLayoutItem) =>
  `${item.x},${item.y},${item.w},${item.h}`;

export function diffBundles(
  local: DiffableBundle,
  chain: DiffableBundle
): WorkspaceDiff {
  const localTypes = countByType(local.dashboard.widgets);
  const chainTypes = countByType(chain.dashboard.widgets);

  const added: string[] = [];
  const removed: string[] = [];
  let addedCount = 0;
  let removedCount = 0;

  const allTypes = new Set([...localTypes.keys(), ...chainTypes.keys()]);
  allTypes.forEach((type) => {
    const delta = (chainTypes.get(type) ?? 0) - (localTypes.get(type) ?? 0);
    if (delta > 0) {
      added.push(type);
      addedCount += delta;
    } else if (delta < 0) {
      removed.push(type);
      removedCount += -delta;
    }
  });
  added.sort();
  removed.sort();

  // Only widgets present in both: an added or removed one is already reported,
  // and counting it again as "layout changed" would be noise.
  const localById = new Map(local.dashboard.widgets.map((w) => [w.i, w.type]));
  const shared = chain.dashboard.widgets
    .filter((w) => localById.get(w.i) === w.type)
    .map((w) => w.i);

  const localLayout = new Map(
    (local.dashboard.layout?.lg ?? []).map((item) => [item.i, item])
  );
  const chainLayout = new Map(
    (chain.dashboard.layout?.lg ?? []).map((item) => [item.i, item])
  );
  const layoutChanged = shared.some((id) => {
    const a = localLayout.get(id);
    const b = chainLayout.get(id);
    if (!a || !b) return false;
    return placement(a) !== placement(b);
  });

  const contentChanged = shared.some(
    (id) =>
      !sameUnordered(
        meaningfulState(local.dashboard.widgetStates?.[id]),
        meaningfulState(chain.dashboard.widgetStates?.[id])
      )
  );

  const settingsChanged =
    local.theme !== chain.theme ||
    local.locale !== chain.locale ||
    !sameUnordered(local.settings, chain.settings) ||
    !sameUnordered(local.witnessHealthSort, chain.witnessHealthSort);

  const watchlistChanged =
    !sameUnordered(local.watchlist, chain.watchlist) ||
    !sameUnordered(local.proposalChanges, chain.proposalChanges);

  return {
    added,
    removed,
    addedCount,
    removedCount,
    layoutChanged,
    contentChanged,
    settingsChanged,
    watchlistChanged,
    identical:
      !added.length &&
      !removed.length &&
      !layoutChanged &&
      !contentChanged &&
      !settingsChanged &&
      !watchlistChanged,
  };
}
