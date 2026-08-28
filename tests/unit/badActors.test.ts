import { isBadActor, badActorCount } from "@/utils/badActors";
import list from "@/utils/BadActorList";

describe("isBadActor", () => {
  const names = (list as string[]).filter(Boolean);

  it("flags every name on the shipped list", () => {
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(isBadActor(name)).toBe(true);
    }
  });

  it("does not flag well-known legitimate accounts", () => {
    for (const name of ["gtg", "blocktrades", "arcange", "hive.fund"]) {
      expect(isBadActor(name)).toBe(false);
    }
  });

  it("matches case-insensitively, since Hive names are lowercase", () => {
    expect(isBadActor(names[0].toUpperCase())).toBe(true);
  });

  it("tolerates leading @ and surrounding whitespace", () => {
    expect(isBadActor(`  @${names[0]}  `)).toBe(true);
  });

  it("returns false for empty or missing input", () => {
    expect(isBadActor("")).toBe(false);
    expect(isBadActor(undefined)).toBe(false);
    expect(isBadActor(null)).toBe(false);
  });

  it("counts distinct names, collapsing case and whitespace variants", () => {
    // Not new Set(names).size: that repeats the raw list back at itself and
    // would fail if the list ever carried "Foo" and " foo " as two entries.
    const distinct = new Set(names.map((name) => name.trim().toLowerCase()));

    expect(badActorCount()).toBe(distinct.size);
    expect(badActorCount()).toBeLessThanOrEqual(names.length);
    expect(badActorCount()).toBeGreaterThan(0);
  });
});
