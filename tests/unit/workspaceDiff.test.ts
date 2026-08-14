import { diffBundles, DiffableBundle } from "@/utils/workspaceDiff";

const bundle = (over: Partial<DiffableBundle> = {}): DiffableBundle => ({
  theme: "light",
  locale: "en",
  settings: { liveData: false },
  dashboard: { layout: { lg: [] }, widgets: [], widgetStates: {} },
  watchlist: {},
  proposalChanges: [],
  witnessHealthSort: null,
  ...over,
});

const board = (
  widgets: Array<{ i: string; type: string }>,
  layout: Array<{ i: string; x: number; y: number; w: number; h: number }> = [],
  widgetStates: Record<string, any> = {}
) => bundle({ dashboard: { layout: { lg: layout }, widgets, widgetStates } });

describe("diffBundles", () => {
  it("reports nothing for two identical boards", () => {
    const w = [{ i: "a", type: "my-wallet" }];
    const d = diffBundles(board(w), board(w));
    expect(d.identical).toBe(true);
    expect(d.added).toEqual([]);
    expect(d.removed).toEqual([]);
  });

  it("names what a restore would add and remove", () => {
    const local = board([
      { i: "a", type: "my-wallet" },
      { i: "b", type: "op-mix" },
    ]);
    const chain = board([
      { i: "a", type: "my-wallet" },
      { i: "c", type: "top-holders" },
    ]);
    const d = diffBundles(local, chain);
    expect(d.added).toEqual(["top-holders"]);
    expect(d.removed).toEqual(["op-mix"]);
    expect(d.identical).toBe(false);
  });

  // Ids are minted from Date.now(), so the same widget added on two devices
  // never shares an id. Matching by type is the only thing that works.
  it("matches by type, not by id", () => {
    const local = board([{ i: "my-wallet-111", type: "my-wallet" }]);
    const chain = board([{ i: "my-wallet-999", type: "my-wallet" }]);
    const d = diffBundles(local, chain);
    expect(d.added).toEqual([]);
    expect(d.removed).toEqual([]);
  });

  it("counts duplicate instances of a repeatable widget", () => {
    const local = board([{ i: "n1", type: "note" }]);
    const chain = board([
      { i: "n1", type: "note" },
      { i: "n2", type: "note" },
      { i: "n3", type: "note" },
    ]);
    const d = diffBundles(local, chain);
    expect(d.added).toEqual(["note"]);
    expect(d.addedCount).toBe(2);
    expect(d.removedCount).toBe(0);
  });

  it("flags a moved widget the two boards share", () => {
    const w = [{ i: "a", type: "my-wallet" }];
    const local = board(w, [{ i: "a", x: 0, y: 0, w: 3, h: 5 }]);
    const chain = board(w, [{ i: "a", x: 6, y: 0, w: 3, h: 5 }]);
    expect(diffBundles(local, chain).layoutChanged).toBe(true);
  });

  // An added or removed widget is already named; counting its absent position
  // as a layout change too would be noise.
  it("does not call an added widget a layout change", () => {
    const local = board([], []);
    const chain = board(
      [{ i: "a", type: "my-wallet" }],
      [{ i: "a", x: 0, y: 0, w: 3, h: 5 }]
    );
    const d = diffBundles(local, chain);
    expect(d.added).toEqual(["my-wallet"]);
    expect(d.layoutChanged).toBe(false);
  });

  it("flags edited widget content but ignores collapse state", () => {
    const w = [{ i: "n1", type: "note" }];
    const edited = diffBundles(
      board(w, [], { n1: { text: "hello" } }),
      board(w, [], { n1: { text: "goodbye" } })
    );
    expect(edited.contentChanged).toBe(true);

    const collapsed = diffBundles(
      board(w, [], { n1: { text: "hello", isCollapsed: false } }),
      board(w, [], { n1: { text: "hello", isCollapsed: true } })
    );
    expect(collapsed.contentChanged).toBe(false);
    expect(collapsed.identical).toBe(true);
  });

  it("flags theme, locale and settings", () => {
    expect(
      diffBundles(bundle(), bundle({ theme: "dark" })).settingsChanged
    ).toBe(true);
    expect(
      diffBundles(bundle(), bundle({ locale: "fr" })).settingsChanged
    ).toBe(true);
    expect(
      diffBundles(bundle(), bundle({ settings: { liveData: true } }))
        .settingsChanged
    ).toBe(true);
  });

  it("flags the watchlist", () => {
    const d = diffBundles(
      bundle(),
      bundle({ watchlist: { proposals: [1, 2] } })
    );
    expect(d.watchlistChanged).toBe(true);
  });

  // Watchlist order is not meaningful, so a reorder must not read as a change.
  it("ignores ordering in the watchlist and proposal changes", () => {
    const d = diffBundles(
      bundle({ watchlist: { proposals: [1, 2, 3] }, proposalChanges: [9, 8] }),
      bundle({ watchlist: { proposals: [3, 1, 2] }, proposalChanges: [8, 9] })
    );
    expect(d.watchlistChanged).toBe(false);
    expect(d.identical).toBe(true);
  });

  it("survives a bundle with no lg layout", () => {
    const local = bundle({
      dashboard: {
        layout: {},
        widgets: [{ i: "a", type: "note" }],
        widgetStates: {},
      },
    });
    const chain = bundle({
      dashboard: {
        layout: {},
        widgets: [{ i: "a", type: "note" }],
        widgetStates: {},
      },
    });
    expect(() => diffBundles(local, chain)).not.toThrow();
    expect(diffBundles(local, chain).layoutChanged).toBe(false);
  });
});
