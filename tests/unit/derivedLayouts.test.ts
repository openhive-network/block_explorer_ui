import { Layout } from "react-grid-layout";
import {
  MASTHEAD_MOBILE_HEIGHT,
  generateDerivedLayouts,
} from "@/components/dashboard/lib/dashboard.config";

const item = (i: string, over: Partial<Layout> = {}): Layout => ({
  i,
  x: 0,
  y: 0,
  w: 12,
  h: 2,
  ...over,
});

describe("generateDerivedLayouts mobile ordering", () => {
  // A board can carry both mastheads, and only the upper one sits at y 0.
  // Keying off position left the lower one sorting to the end of the phone.
  it("leads with every masthead, in the order they stack on desktop", () => {
    const master = [
      item("live-info-1", { y: 4.4, w: 3 }),
      item("board-header-1723456789", { y: 2.4 }),
      item("top-witnesses-1", { x: 9, y: 0, w: 3, h: 14 }),
      item("me-profile-banner-0", { y: 0, h: 2.4 }),
    ];

    const order = generateDerivedLayouts(master).xs.map((l) => l.i);

    expect(order.slice(0, 2)).toEqual([
      "me-profile-banner-0",
      "board-header-1723456789",
    ]);
    expect(order).toHaveLength(4);
  });

  it("gives a masthead the taller stacked height on phones only", () => {
    const master = [item("board-header-1", { h: 2 })];
    const layouts = generateDerivedLayouts(master);

    expect(layouts.xs[0].h).toBe(MASTHEAD_MOBILE_HEIGHT);
    expect(layouts.sm[0].h).toBe(MASTHEAD_MOBILE_HEIGHT);
    // lg is the master layout untouched.
    expect(layouts.lg[0].h).toBe(2);
  });

  it("never shrinks a masthead the user dragged taller", () => {
    const tall = MASTHEAD_MOBILE_HEIGHT + 3;
    const layouts = generateDerivedLayouts([
      item("board-header-1", { h: tall }),
    ]);

    expect(layouts.xs[0].h).toBe(tall);
  });

  it("stacks mobile items without gaps", () => {
    const master = [
      item("board-header-1", { y: 0 }),
      item("live-info-1", { y: 2, w: 3 }),
      item("top-holders-1", { x: 9, y: 0, w: 3, h: 8 }),
    ];

    const xs = generateDerivedLayouts(master).xs;
    let expectedY = 0;
    for (const l of xs) {
      expect(l.y).toBeCloseTo(expectedY);
      expect(l.x).toBe(0);
      expectedY += l.h;
    }
  });
});
