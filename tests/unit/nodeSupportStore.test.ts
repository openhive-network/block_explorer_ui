import { nodeSupportStore } from "@/utils/nodeSupportStore";

describe("nodeSupportStore", () => {
  it("records a report and reads it back for the same node", () => {
    const before = nodeSupportStore.getVersion();
    nodeSupportStore.report("https://nodeA", "balance-api:tvl");
    expect(
      nodeSupportStore.isReported("https://nodeA", "balance-api:tvl")
    ).toBe(true);
    expect(nodeSupportStore.getVersion()).toBeGreaterThan(before);
  });

  it("keeps nodes isolated (a report on A doesn't affect B)", () => {
    nodeSupportStore.report("https://nodeA", "shared-key");
    expect(nodeSupportStore.isReported("https://nodeB", "shared-key")).toBe(
      false
    );
  });

  it("ignores an empty node (no bump, nothing recorded)", () => {
    const before = nodeSupportStore.getVersion();
    nodeSupportStore.report("", "ignored");
    expect(nodeSupportStore.getVersion()).toBe(before);
    expect(nodeSupportStore.isReported("", "ignored")).toBe(false);
  });

  it("dedups duplicate reports (no extra version bump)", () => {
    nodeSupportStore.report("https://nodeC", "dup");
    const after = nodeSupportStore.getVersion();
    nodeSupportStore.report("https://nodeC", "dup");
    expect(nodeSupportStore.getVersion()).toBe(after);
  });

  it("notifies subscribers on a NEW report and stops after unsubscribe", () => {
    let calls = 0;
    const unsub = nodeSupportStore.subscribe(() => {
      calls += 1;
    });
    nodeSupportStore.report("https://nodeD", "first");
    expect(calls).toBe(1);
    nodeSupportStore.report("https://nodeD", "first"); // dup -> no notify
    expect(calls).toBe(1);
    unsub();
    nodeSupportStore.report("https://nodeD", "second");
    expect(calls).toBe(1);
  });

  // A DEFINITIVE report (route missing, 404/501) persists for the session and a
  // node switch reloads the module. TRANSIENT reports (5xx/timeout) also land
  // here but are cleared periodically so a recovered node's widgets come back.
  it("a definitive report persists for the session", () => {
    nodeSupportStore.report("https://nodeE", "permanent");
    expect(nodeSupportStore.isReported("https://nodeE", "permanent")).toBe(
      true
    );
  });

  it("clearTransient drops transient reports but keeps definitive ones", () => {
    nodeSupportStore.report("https://nodeF", "transient-key", true);
    nodeSupportStore.report("https://nodeF", "definitive-key", false);
    nodeSupportStore.clearTransient("https://nodeF");
    expect(nodeSupportStore.isReported("https://nodeF", "transient-key")).toBe(
      false
    );
    expect(nodeSupportStore.isReported("https://nodeF", "definitive-key")).toBe(
      true
    );
  });

  it("clearTransient bumps the version only when it removed something", () => {
    nodeSupportStore.report("https://nodeG", "t", true);
    const withTransient = nodeSupportStore.getVersion();
    nodeSupportStore.clearTransient("https://nodeG");
    const afterClear = nodeSupportStore.getVersion();
    expect(afterClear).toBeGreaterThan(withTransient);
    nodeSupportStore.clearTransient("https://nodeG"); // nothing left -> no bump
    expect(nodeSupportStore.getVersion()).toBe(afterClear);
  });

  it("a definitive report is not downgraded by a later transient one", () => {
    nodeSupportStore.report("https://nodeH", "k", false);
    nodeSupportStore.report("https://nodeH", "k", true); // ignored, stays definitive
    nodeSupportStore.clearTransient("https://nodeH");
    expect(nodeSupportStore.isReported("https://nodeH", "k")).toBe(true);
  });

  it("isTransient is true only for a reported transient report", () => {
    nodeSupportStore.report("https://nodeI", "transient-key", true);
    nodeSupportStore.report("https://nodeI", "definitive-key", false);
    expect(nodeSupportStore.isTransient("https://nodeI", "transient-key")).toBe(
      true
    );
    // Definitive report -> reported, but not transient.
    expect(
      nodeSupportStore.isTransient("https://nodeI", "definitive-key")
    ).toBe(false);
    // Never reported -> not transient.
    expect(nodeSupportStore.isTransient("https://nodeI", "unknown")).toBe(
      false
    );
  });
});
