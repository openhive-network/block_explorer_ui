import { getLayoutStorageKey } from "@/components/dashboard/lib/dashboard.config";

const USER = "dimante";

/**
 * Storage that refuses one specific key, standing in for the real ways a write
 * is rejected part-way: quota exceeded, Safari private mode, an oversized
 * decompressed bundle.
 */
const makeStorage = (initial: Record<string, string> = {}, failOn?: string) => {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      if (k === failOn) {
        const err: any = new Error("QuotaExceededError");
        err.name = "QuotaExceededError";
        throw err;
      }
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
};

describe("applyBundle is all-or-nothing", () => {
  let storage: ReturnType<typeof makeStorage>;

  const install = (s: ReturnType<typeof makeStorage>) => {
    storage = s;
    jest.resetModules();
    (globalThis as any).localStorage = s;
    (globalThis as any).window = { dispatchEvent: () => true };
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
  };

  afterEach(() => {
    delete (globalThis as any).localStorage;
    delete (globalThis as any).window;
    delete (globalThis as any).CustomEvent;
    delete (globalThis as any).StorageEvent;
  });

  const bundle = {
    version: 1,
    theme: "dark",
    locale: "fr",
    settings: {} as any,
    dashboard: {
      layout: { lg: [{ i: "note-1", x: 0, y: 0, w: 3, h: 2 }] },
      widgets: [{ i: "note-1", type: "note" }],
      widgetStates: {},
    },
    watchlist: {},
    proposalChanges: [],
    witnessHealthSort: null,
  };

  const existing = {
    theme: "light",
    locale: "en",
    [getLayoutStorageKey(USER)]: JSON.stringify({ lg: ["original"] }),
  };

  it("commits and reports success when storage accepts the write", () => {
    install(makeStorage({ ...existing }));
    const { applyBundle } = require("@/utils/workspaceSync");

    expect(applyBundle(USER, bundle)).toBe(true);
    expect(storage.getItem("theme")).toBe("dark");
    expect(storage.getItem(getLayoutStorageKey(USER))).toContain("note-1");
  });

  // The regression this guards: a refused write part-way through used to leave
  // the board half overwritten, with no way back.
  it("leaves every key untouched when one write is refused", () => {
    install(makeStorage({ ...existing }, getLayoutStorageKey(USER)));
    const { applyBundle } = require("@/utils/workspaceSync");

    expect(applyBundle(USER, bundle)).toBe(false);

    // Nothing moved — not even the keys written before the failing one.
    expect(storage.getItem("theme")).toBe("light");
    expect(storage.getItem("locale")).toBe("en");
    expect(storage.getItem(getLayoutStorageKey(USER))).toBe(
      existing[getLayoutStorageKey(USER)]
    );
  });

  // Keys the bundle does not carry are cleared, and that clearing has to roll
  // back too or a failed restore would still have wiped them.
  it("restores keys it had cleared when a later write is refused", () => {
    const witnessSortKey = `witnessHealthSort_${USER}`;
    install(
      makeStorage(
        { ...existing, [witnessSortKey]: '{"key":"rank","dir":"asc"}' },
        getLayoutStorageKey(USER)
      )
    );
    const { applyBundle } = require("@/utils/workspaceSync");

    expect(applyBundle(USER, bundle)).toBe(false);
    expect(storage.getItem(witnessSortKey)).toBe('{"key":"rank","dir":"asc"}');
  });
});
