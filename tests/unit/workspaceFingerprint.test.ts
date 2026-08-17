import { WorkspaceBundle, bundleFingerprint } from "@/utils/workspaceSync";

const baseBundle = (): WorkspaceBundle => ({
  version: 1,
  theme: "dark",
  locale: "en",
  settings: {} as WorkspaceBundle["settings"],
  dashboard: {
    layout: { lg: [{ i: "a", x: 0, y: 0, w: 3, h: 2 }] },
    widgets: [{ i: "a", type: "my-wallet" }],
    widgetStates: { a: { isCollapsed: false, text: "hello" } },
  },
  watchlist: {},
  proposalChanges: [],
  witnessHealthSort: null,
});

describe("bundleFingerprint", () => {
  // savedAt is regenerated on every buildBundle call. If it reached the
  // fingerprint, a bundle would never match itself and the unsynced dot would
  // be stuck on for every user.
  it("ignores savedAt, so two builds of the same workspace match", () => {
    const a = { ...baseBundle(), savedAt: "2026-01-01T00:00:00.000Z" };
    const b = { ...baseBundle(), savedAt: "2026-11-12T09:30:00.000Z" };
    expect(bundleFingerprint(a)).toBe(bundleFingerprint(b));
  });

  // Bundles synced before savedAt existed must keep their stored fingerprint,
  // or every user would be prompted once for no reason.
  it("fingerprints a pre-savedAt bundle the same as one carrying savedAt", () => {
    const without = baseBundle();
    const withSaved = { ...baseBundle(), savedAt: "2026-11-12T09:30:00.000Z" };
    expect(bundleFingerprint(without)).toBe(bundleFingerprint(withSaved));
  });

  it("still ignores isCollapsed, which is UI state", () => {
    const collapsed = baseBundle();
    collapsed.dashboard.widgetStates.a.isCollapsed = true;
    expect(bundleFingerprint(collapsed)).toBe(bundleFingerprint(baseBundle()));
  });

  it("still reacts to a real change", () => {
    const edited = baseBundle();
    edited.dashboard.widgetStates.a.text = "goodbye";
    expect(bundleFingerprint(edited)).not.toBe(bundleFingerprint(baseBundle()));

    const removed = baseBundle();
    removed.dashboard.widgets = [];
    expect(bundleFingerprint(removed)).not.toBe(
      bundleFingerprint(baseBundle())
    );
  });
});
