import { MANA_REGEN_SECONDS, secondsUntilFull } from "@/utils/manaRecharge";
import { formatShortDuration } from "@/utils/TimeUtils";

describe("secondsUntilFull", () => {
  it("scales the 5-day regeneration by the missing share", () => {
    expect(secondsUntilFull(0)).toBe(MANA_REGEN_SECONDS);
    expect(secondsUntilFull(50)).toBe(MANA_REGEN_SECONDS / 2);
    expect(secondsUntilFull(100)).toBe(0);
  });

  it("clamps values outside 0-100", () => {
    expect(secondsUntilFull(120)).toBe(0);
    expect(secondsUntilFull(-5)).toBe(MANA_REGEN_SECONDS);
  });
});

describe("formatShortDuration", () => {
  it("keeps the two largest units", () => {
    expect(formatShortDuration(3 * 3600 + 20 * 60, "en")).toBe("3h 20m");
    expect(formatShortDuration(26 * 3600 + 5 * 60, "en")).toBe("1d 2h");
    expect(formatShortDuration(12 * 60, "en")).toBe("12m");
    expect(formatShortDuration(75, "en")).toBe("1m 15s");
    expect(formatShortDuration(3, "en")).toBe("3s");
  });
});
