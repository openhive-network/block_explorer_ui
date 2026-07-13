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

  // A report sticks for the session by design — only DEFINITIVE failures reach
  // the store (transient/status-less failures are retried first, see
  // classifyEndpointError.transient + the retry policy), and a node switch does a
  // full page reload which resets this module.
  it("a report persists for the session (node switch reloads the module)", () => {
    nodeSupportStore.report("https://nodeE", "permanent");
    expect(nodeSupportStore.isReported("https://nodeE", "permanent")).toBe(
      true
    );
  });
});
