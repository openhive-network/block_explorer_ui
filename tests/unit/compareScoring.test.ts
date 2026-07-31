import { CompareRow, CompareSection } from "@/utils/compare/types";
import {
  winnerOf,
  deltaRatio,
  sparkScale,
  sectionWins,
  overallWins,
} from "@/utils/compare/scoring";

const row = (over: Partial<CompareRow>): CompareRow => ({
  id: "r",
  labelKey: "k",
  format: "number",
  scored: true,
  aValue: null,
  bValue: null,
  ...over,
});

describe("compare scoring — winnerOf", () => {
  it("higher value wins by default", () => {
    expect(winnerOf(row({ aValue: 1_240_000, bValue: 512_000 }))).toBe("a");
    expect(winnerOf(row({ aValue: 70_000, bValue: 160_000 }))).toBe("b");
  });

  it("lowerWins flips it (rank, power-down)", () => {
    expect(winnerOf(row({ aValue: 182, bValue: 1_204, lowerWins: true }))).toBe(
      "a"
    );
  });

  it("equal values tie", () => {
    expect(winnerOf(row({ aValue: 4_100, bValue: 4_100 }))).toBe("tie");
  });

  it("unscored or missing data is not scorable (null)", () => {
    expect(winnerOf(row({ aValue: 5, bValue: 3, scored: false }))).toBeNull();
    expect(winnerOf(row({ aValue: 5, bValue: null }))).toBeNull();
  });
});

describe("compare scoring — deltaRatio (matches the demo PDF)", () => {
  it("formats larger ÷ smaller with one decimal, or integer when ≥ 10", () => {
    expect(deltaRatio(row({ aValue: 1_240_000, bValue: 512_000 }))).toBe(
      "2.4×"
    ); // Total HP
    expect(deltaRatio(row({ aValue: 70_000, bValue: 160_000 }))).toBe("2.3×"); // Received
    expect(
      deltaRatio(row({ aValue: 182, bValue: 1_204, lowerWins: true }))
    ).toBe("6.6×"); // Top-holder rank
    expect(deltaRatio(row({ aValue: 120_000, bValue: 2_300 }))).toBe("52×"); // Savings
    expect(deltaRatio(row({ aValue: 1_240_000, bValue: 286_000 }))).toBe(
      "4.3×"
    ); // headline value
  });

  // "1.0×" next to a winner caret asserts sameness and difference at once.
  it("omits a ratio that rounds to 1.0", () => {
    expect(deltaRatio(row({ aValue: 80, bValue: 79 }))).toBeNull();
    expect(
      deltaRatio(row({ aValue: 99_020_000, bValue: 98_350_000 }))
    ).toBeNull();
    expect(deltaRatio(row({ aValue: 27, bValue: 24 }))).toBe("1.1×");
  });

  it("returns 'tie' when equal and null when not comparable / one side ≤ 0", () => {
    expect(deltaRatio(row({ aValue: 5, bValue: 5 }))).toBe("tie");
    expect(deltaRatio(row({ aValue: 0, bValue: 8_000 }))).toBeNull(); // delegated-out 0
    expect(deltaRatio(row({ aValue: 2_100_000, bValue: 0 }))).toBeNull(); // proxy 0
    expect(deltaRatio(row({ aValue: 5, bValue: null }))).toBeNull();
  });
});

describe("compare scoring — sparkScale", () => {
  it("normalizes both bars to the row max", () => {
    expect(sparkScale(row({ aValue: 512_000, bValue: 1_240_000 }))).toEqual({
      a: 512_000 / 1_240_000,
      b: 1,
    });
  });

  it("both zero → both empty", () => {
    expect(sparkScale(row({ aValue: 0, bValue: 0 }))).toEqual({ a: 0, b: 0 });
  });

  // The bar has to agree with the winner arrow: on a lowerWins row the smaller
  // value is the better one, so it gets the full bar.
  it("inverts on lowerWins so the winner always draws the longer bar", () => {
    const rank = row({ aValue: 182, bValue: 1_204, lowerWins: true });
    const { a, b } = sparkScale(rank);
    expect(a).toBe(1);
    expect(b).toBeCloseTo(182 / 1_204);
    expect(winnerOf(rank)).toBe("a");
    expect(a).toBeGreaterThan(b);
  });

  it("treats zero as the best possible value on a lowerWins row", () => {
    expect(
      sparkScale(row({ aValue: 0, bValue: 8_000, lowerWins: true }))
    ).toEqual({ a: 1, b: 0 });
  });
});

describe("compare scoring — section & overall wins", () => {
  const wealth: CompareSection = {
    id: "wealth",
    titleKey: "t",
    rows: [
      row({ id: "1", aValue: 1_240_000, bValue: 512_000 }), // a
      row({ id: "2", aValue: 70_000, bValue: 160_000 }), // b
      row({ id: "3", aValue: 120_000, bValue: 2_300 }), // a
      row({ id: "4", aValue: 0, bValue: 8_000, scored: false }), // neutral
      row({ id: "5", aValue: 4_100, bValue: 4_100 }), // tie
    ],
  };

  it("counts only decisive scored rows", () => {
    expect(sectionWins(wealth)).toEqual({ a: 2, b: 1 });
  });

  it("overall sums across sections", () => {
    expect(overallWins([wealth, wealth])).toEqual({ a: 4, b: 2 });
  });
});
