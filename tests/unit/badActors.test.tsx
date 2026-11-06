/**
 * @jest-environment jsdom
 */
import React from "react";
import { createRoot } from "react-dom/client";
import list from "@/utils/BadActorList";
import { ACCOUNT_LABELS } from "@/utils/accountLabels";
import {
  BadActors,
  isBadActor,
  loadBadActors,
  NEVER_FLAGGED,
  useBadActors,
} from "@/utils/badActors";

const names = (list as string[]).filter(Boolean);
const exempt = (name: string) =>
  !!ACCOUNT_LABELS[name] || Object.hasOwn(NEVER_FLAGGED, name);
// Hive's rule: 3-16 characters, each dot-separated part at least 3 long,
// starting with a letter and ending with a letter or digit.
const isAccountName = (name: string) =>
  name.length >= 3 &&
  name.length <= 16 &&
  name
    .split(".")
    .every(
      (part) => part.length >= 3 && /^[a-z][a-z0-9-]*[a-z0-9]$/.test(part)
    );

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("bad-actor list", () => {
  let badActors: BadActors;
  beforeAll(async () => {
    badActors = await loadBadActors();
  });

  it("flags every name on the shipped list except exempt accounts", () => {
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(isBadActor(badActors, name)).toBe(!exempt(name));
    }
  });

  it("never flags the exchange accounts on the never-flag list", () => {
    for (const name of ["upbitsusers", "bithumbrecv2"]) {
      expect(isBadActor(badActors, name)).toBe(false);
      expect(isBadActor(badActors, `@${name.toUpperCase()}`)).toBe(false);
    }
    // Look-alike squats stay flagged.
    expect(isBadActor(badActors, "upbitsusersa")).toBe(true);
    // Each entry must still be on Watchmen's list; drop it once it's gone.
    const gone = Object.keys(NEVER_FLAGGED).filter((n) => !names.includes(n));
    expect(gone).toEqual([]);
  });

  it("never flags an account we label, such as Upbit's hot wallets", () => {
    // Watchmen lists upbitshotwallet1-3; they hold millions of HIVE for Upbit.
    expect(names).toContain("upbitshotwallet1");
    for (const name of Object.keys(ACCOUNT_LABELS)) {
      expect(isBadActor(badActors, name)).toBe(false);
    }
  });

  it("holds Hive account names, sorted and without repeats", () => {
    expect(names.filter((name) => !isAccountName(name))).toEqual([]);
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort()).toEqual(names);
    expect(badActors.size).toBe(names.length - names.filter(exempt).length);
  });

  it("does not flag well-known legitimate accounts", () => {
    for (const name of ["gtg", "blocktrades", "arcange", "hive.fund"]) {
      expect(isBadActor(badActors, name)).toBe(false);
    }
  });

  it("matches case-insensitively and tolerates @ and whitespace", () => {
    expect(isBadActor(badActors, names[0].toUpperCase())).toBe(true);
    expect(isBadActor(badActors, `  @${names[0]}  `)).toBe(true);
  });

  it("flags nothing before the list loads, or for empty input", () => {
    expect(isBadActor(null, names[0])).toBe(false);
    expect(isBadActor(badActors, "")).toBe(false);
    expect(isBadActor(badActors, undefined)).toBe(false);
    expect(isBadActor(badActors, null)).toBe(false);
  });

  it("loads the list once", async () => {
    expect(await loadBadActors()).toBe(badActors);
  });
});

describe("useBadActors", () => {
  it("gives null first, then the list", async () => {
    // A fresh module registry, so the list isn't loaded yet. React comes from
    // the same registry, or the hook would run against a second copy.
    let R!: typeof React;
    let createFreshRoot!: typeof createRoot;
    let hook!: typeof useBadActors;
    jest.isolateModules(() => {
      R = require("react");
      createFreshRoot = require("react-dom/client").createRoot;
      hook = require("@/utils/badActors").useBadActors;
    });
    const seen: Array<BadActors | null> = [];
    const Probe = () => {
      seen.push(hook());
      return null;
    };
    const root = createFreshRoot(document.createElement("div"));
    await R.act(async () => {
      root.render(R.createElement(Probe));
    });
    await R.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(seen[0]).toBeNull();
    expect(seen.at(-1)?.has(names[0])).toBe(true);
    await R.act(async () => root.unmount());
  });
});

describe("useBadActorsState when the list fails to load", () => {
  // The list is imported after the render, outside any isolateModules
  // callback, so each run clears the whole registry instead. The mock factory
  // reads this shared state, so every run sees its own failure count.
  const mockLoad = { failures: 0, calls: 0 };

  // Loads the hook in a fresh registry whose list import fails `failures`
  // times, then renders it and runs through the retry delays.
  const run = async (failures: number) => {
    mockLoad.failures = failures;
    mockLoad.calls = 0;
    jest.useFakeTimers();
    let R!: typeof React;
    let createFreshRoot!: typeof createRoot;
    let hookState!: typeof import("@/utils/badActors").useBadActorsState;
    jest.resetModules();
    jest.doMock("@/utils/BadActorList", () => {
      mockLoad.calls += 1;
      if (mockLoad.calls <= mockLoad.failures) throw new Error("chunk failed");
      return { __esModule: true, default: ["scammer"] };
    });
    R = require("react");
    createFreshRoot = require("react-dom/client").createRoot;
    hookState = require("@/utils/badActors").useBadActorsState;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const seen: Array<{ list: BadActors | null; failed: boolean }> = [];
    const Probe = () => {
      seen.push(hookState());
      return null;
    };
    const root = createFreshRoot(document.createElement("div"));
    await R.act(async () => {
      root.render(R.createElement(Probe));
    });
    for (let i = 0; i < 4; i++) {
      await R.act(async () => {
        await jest.advanceTimersByTimeAsync(30000);
      });
    }
    await R.act(async () => root.unmount());
    jest.useRealTimers();
    warn.mockRestore();
    return { last: seen[seen.length - 1], calls: mockLoad.calls };
  };

  it("retries and recovers after a failed load", async () => {
    const { last, calls } = await run(1);
    expect(calls).toBe(2);
    expect(last.failed).toBe(false);
    expect(last.list?.has("scammer")).toBe(true);
  });

  it("reports failure after the last retry", async () => {
    const { last, calls } = await run(99);
    expect(calls).toBe(4);
    expect(last.failed).toBe(true);
    expect(last.list).toBeNull();
  });
});
