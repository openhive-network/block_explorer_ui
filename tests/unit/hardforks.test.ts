import { eraDuration, hardforkDate, hardforkForBlock } from "@/utils/hardforks";

const HARDFORKS = [
  { hardfork_num: 0, block_num: 1, timestamp: "2016-03-24T16:05:00" },
  { hardfork_num: 23, block_num: 41818752, timestamp: "2020-03-20T14:00:00" },
  { hardfork_num: 24, block_num: 47797680, timestamp: "2020-10-14T19:31:24" },
];

describe("hardforkForBlock", () => {
  it("picks the last hardfork activated before the block", () => {
    expect(hardforkForBlock(HARDFORKS, 45000000)?.hardfork_num).toBe(23);
    expect(hardforkForBlock(HARDFORKS, 111600000)?.hardfork_num).toBe(24);
  });

  // hived applies the hardfork after the activation block's transactions.
  it("keeps the activation block in the previous era", () => {
    expect(hardforkForBlock(HARDFORKS, 47797680)?.hardfork_num).toBe(23);
    expect(hardforkForBlock(HARDFORKS, 47797681)?.hardfork_num).toBe(24);
  });

  it("puts block 1 in HF0", () => {
    expect(hardforkForBlock(HARDFORKS, 1)?.hardfork_num).toBe(0);
  });

  it("returns nothing before the list has loaded", () => {
    expect(hardforkForBlock(undefined, 45000000)).toBeUndefined();
  });
});

describe("hardforkDate", () => {
  it("reads the zone-less timestamp as UTC", () => {
    expect(hardforkDate(HARDFORKS[2]).toISOString()).toBe(
      "2020-10-14T19:31:24.000Z"
    );
  });
});

describe("eraDuration", () => {
  const MINUTE = 60000;

  it("uses days for eras of a day or more", () => {
    expect(eraDuration(1122 * 24 * 60 * MINUTE)).toEqual({
      value: 1122,
      unit: "day",
    });
  });

  it("falls back to hours, then minutes, for short eras", () => {
    expect(eraDuration(5 * 60 * MINUTE)).toEqual({ value: 5, unit: "hour" });
    expect(eraDuration(2 * MINUTE + 12000)).toEqual({
      value: 2,
      unit: "minute",
    });
  });

  it("rounds before picking the unit", () => {
    expect(eraDuration(59.6 * MINUTE)).toEqual({ value: 1, unit: "hour" });
    expect(eraDuration(23.7 * 60 * MINUTE)).toEqual({ value: 1, unit: "day" });
  });

  it("never shows zero", () => {
    expect(eraDuration(3000)).toEqual({ value: 1, unit: "minute" });
  });
});
