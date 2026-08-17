import { Layout } from "react-grid-layout";
import { generateDerivedLayouts } from "@/components/dashboard/lib/dashboard.config";

const item = (over: Partial<Layout> & { i: string }): Layout => ({
  x: 0,
  y: 0,
  w: 3,
  h: 4,
  minW: 2,
  minH: 2,
  ...over,
});

// The md breakpoint (768-1023px) packs into two 5-column halves of a 10-column
// grid. Nothing covered it before, which is how the masthead regression landed.
describe("generateDerivedLayouts md (tablet) packing", () => {
  const md = (master: Layout[]) => generateDerivedLayouts(master).md!;
  const find = (master: Layout[], id: string) =>
    md(master).find((l) => l.i === id)!;

  // The regression: mastheads carry a small minW so they stay resizable, which
  // dropped them into a half-width column and squished them on tablet.
  it("gives a board-header the full width despite its small minW", () => {
    const master = [item({ i: "board-header-0", w: 12, minW: 4 })];
    const row = find(master, "board-header-0");

    expect(row.w).toBe(10);
    expect(row.x).toBe(0);
  });

  it("gives a profile-banner the full width too", () => {
    const master = [item({ i: "profile-banner-0", w: 12, minW: 3 })];
    const row = find(master, "profile-banner-0");

    expect(row.w).toBe(10);
    expect(row.x).toBe(0);
  });

  it("still treats a genuinely wide widget as full width", () => {
    const master = [item({ i: "last-blocks-1", w: 6, minW: 6 })];
    expect(find(master, "last-blocks-1").w).toBe(10);
  });

  it("packs narrow widgets into two side-by-side halves", () => {
    const master = [item({ i: "a-1", minW: 2 }), item({ i: "b-2", minW: 2 })];
    const rows = md(master);

    expect(rows.map((r) => r.w)).toEqual([5, 5]);
    expect(rows.map((r) => r.x).sort()).toEqual([0, 5]);
    // Same row: they fill the two columns rather than stacking.
    expect(rows[0].y).toBe(rows[1].y);
  });

  it("puts a full-width band below both columns, not across them", () => {
    const master = [
      item({ i: "a-1", minW: 2, h: 4 }),
      item({ i: "b-2", minW: 2, h: 6 }),
      item({ i: "wide-3", minW: 6, h: 3 }),
    ];
    const rows = md(master);
    const wide = rows.find((r) => r.i === "wide-3")!;
    const tallest = Math.max(
      ...rows.filter((r) => r.i !== "wide-3").map((r) => r.y + r.h)
    );

    expect(wide.w).toBe(10);
    expect(wide.y).toBeGreaterThanOrEqual(tallest);
  });

  it("leads with the masthead, above the widgets that follow it", () => {
    const master = [
      item({ i: "a-1", minW: 2 }),
      item({ i: "board-header-0", w: 12, minW: 4, y: 0 }),
    ];
    const rows = md(master);
    const header = rows.find((r) => r.i === "board-header-0")!;
    const other = rows.find((r) => r.i === "a-1")!;

    expect(header.y).toBeLessThan(other.y + other.h);
    expect(header.y).toBe(0);
  });

  it("keeps every item inside the 10-column tablet grid", () => {
    const master = [
      item({ i: "board-header-0", w: 12, minW: 4 }),
      item({ i: "a-1", minW: 2 }),
      item({ i: "b-2", minW: 2 }),
      item({ i: "wide-3", minW: 6 }),
    ];

    md(master).forEach((row) => {
      expect(row.x).toBeGreaterThanOrEqual(0);
      expect(row.x + row.w).toBeLessThanOrEqual(10);
    });
  });
});
