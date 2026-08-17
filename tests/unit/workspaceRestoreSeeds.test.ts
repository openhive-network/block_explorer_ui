import {
  WIDGET_SEEDS,
  seedStorageKey,
  watchedProposalsDismissedKey,
} from "@/components/dashboard/lib/widgetSeeds";

const USER = "dimante";
const DISMISSED_FLAG = "watched_proposals_dismissed";

const makeStorage = () => {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
};

describe("applyBundle restores widget seed flags", () => {
  let storage: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    jest.resetModules();
    storage = makeStorage();
    (globalThis as any).localStorage = storage;
    (globalThis as any).window = {
      dispatchEvent: () => true,
    };
    (globalThis as any).CustomEvent = class {
      constructor(
        public type: string,
        public init?: any
      ) {}
    };
    (globalThis as any).StorageEvent = class {
      constructor(
        public type: string,
        public init?: any
      ) {}
    };
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
    delete (globalThis as any).window;
    delete (globalThis as any).CustomEvent;
    delete (globalThis as any).StorageEvent;
  });

  const makeBundle = (autoAdd?: Record<string, string>) => ({
    version: 1,
    theme: "dark",
    locale: "en",
    settings: {} as any,
    dashboard: { layout: {}, widgets: [], widgetStates: {} },
    watchlist: {},
    proposalChanges: [],
    witnessHealthSort: null,
    ...(autoAdd ? { autoAdd } : {}),
  });

  const setAllSeeds = () =>
    WIDGET_SEEDS.forEach((seed) =>
      storage.setItem(seedStorageKey(seed.flag, USER), "true")
    );

  const stillSet = () =>
    WIDGET_SEEDS.filter((s) =>
      storage.getItem(seedStorageKey(s.flag, USER))
    ).map((s) => s.flag);

  // The board the user synced is the board they want. Re-seeding a widget it
  // omits would silently re-add something they had removed.
  it("keeps a seed settled when the bundle recorded it as already offered", () => {
    const { applyBundle } = require("@/utils/workspaceSync");
    const removed = WIDGET_SEEDS[1].flag;

    applyBundle(
      USER,
      makeBundle(
        Object.fromEntries(WIDGET_SEEDS.map((s) => [s.flag, "true"]))
      ) as any
    );

    expect(storage.getItem(seedStorageKey(removed, USER))).toBe("true");
    expect(stillSet().sort()).toEqual(WIDGET_SEEDS.map((s) => s.flag).sort());
  });

  // A bundle written before a widget shipped has no record of it, so that seed
  // must run again — otherwise the widget could never appear on this device.
  it("lets a seed the bundle never recorded run again", () => {
    const { applyBundle } = require("@/utils/workspaceSync");
    const shipped = WIDGET_SEEDS[WIDGET_SEEDS.length - 1].flag;
    setAllSeeds();

    const autoAdd = Object.fromEntries(
      WIDGET_SEEDS.filter((s) => s.flag !== shipped).map((s) => [
        s.flag,
        "true",
      ])
    );
    applyBundle(USER, makeBundle(autoAdd) as any);

    expect(storage.getItem(seedStorageKey(shipped, USER))).toBeNull();
    expect(stillSet()).not.toContain(shipped);
  });

  // Nothing to go on, so settle everything: the restored board wins over a
  // seeding pass that would add widgets it does not contain.
  it("settles every seed for a bundle written before autoAdd existed", () => {
    const { applyBundle } = require("@/utils/workspaceSync");

    applyBundle(USER, makeBundle() as any);

    expect(stillSet().sort()).toEqual(WIDGET_SEEDS.map((s) => s.flag).sort());
    expect(storage.getItem(watchedProposalsDismissedKey(USER))).toBe("true");
  });

  // Restoring while a template tab is open would otherwise leave the user
  // looking at the template, making the restore look like it did nothing.
  it("switches the open tab to My board", () => {
    const { applyBundle } = require("@/utils/workspaceSync");
    const {
      getActiveBoardStorageKey,
    } = require("@/components/dashboard/lib/boardSlots");
    const { MY_BOARD_KEY } = require("@/components/dashboard/templates");

    storage.setItem(getActiveBoardStorageKey(USER), "governance");
    applyBundle(USER, makeBundle() as any);

    expect(storage.getItem(getActiveBoardStorageKey(USER))).toBe(MY_BOARD_KEY);
  });

  it("round-trips the watched-proposals dismissal", () => {
    const { applyBundle } = require("@/utils/workspaceSync");
    const key = watchedProposalsDismissedKey(USER);

    storage.setItem(key, "true");
    applyBundle(USER, makeBundle({}) as any);
    expect(storage.getItem(key)).toBeNull();

    applyBundle(USER, makeBundle({ [DISMISSED_FLAG]: "true" }) as any);
    expect(storage.getItem(key)).toBe("true");
  });

  it("captures the local flags buildBundle writes", () => {
    const { buildBundle } = require("@/utils/workspaceSync");
    const seeded = WIDGET_SEEDS[0].flag;
    storage.setItem(seedStorageKey(seeded, USER), "true");
    storage.setItem(watchedProposalsDismissedKey(USER), "true");

    const bundle = buildBundle(USER);

    expect(bundle.autoAdd[seeded]).toBe("true");
    expect(bundle.autoAdd[DISMISSED_FLAG]).toBe("true");
    expect(bundle.autoAdd[WIDGET_SEEDS[1].flag]).toBeUndefined();
  });
});
