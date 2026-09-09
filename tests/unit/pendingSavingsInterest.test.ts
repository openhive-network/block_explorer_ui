import { IHiveChainInterface } from "@hiveio/wax";
import { calculatePendingSavingsInterest } from "@/utils/Calculations";
import { formatIntegerString } from "@/lib/utils";

const hbd = (amount: string) => ({
  nai: "@@000000013",
  amount,
  precision: 3,
});

// Stands in for wax: records what it was handed and echoes a marker asset, so
// the tests assert on our guards rather than on the chain arithmetic.
const makeChain = (impl?: jest.Mock) => {
  const estimateHbdInterest = impl ?? jest.fn(() => hbd("4794238"));
  return {
    chain: {
      estimateHbdInterest,
      hbdSatoshis: (amount: number) => hbd(String(amount)),
    } as unknown as IHiveChainInterface,
    estimateHbdInterest,
  };
};

const BASE = {
  savingsHbdSeconds: "62229186",
  savingsHbdBalanceSatoshis: 10371532,
  lastCompoundingDate: "2022-01-25T03:17:21",
  interestRateBasisPoints: 1000,
};

describe("calculatePendingSavingsInterest", () => {
  it("passes the chain values straight through to wax", () => {
    const { chain, estimateHbdInterest } = makeChain();

    const result = calculatePendingSavingsInterest(
      chain,
      BASE,
      new Date("2026-09-08T08:21:54Z")
    );

    expect(result).toEqual(hbd("4794238"));
    expect(estimateHbdInterest).toHaveBeenCalledWith(
      "62229186",
      hbd("10371532"),
      new Date("2022-01-25T03:17:21Z"),
      new Date("2026-09-08T08:21:54Z"),
      1000
    );
  });

  it("reads the zone-less chain timestamp as UTC, not local time", () => {
    const { chain, estimateHbdInterest } = makeChain();

    calculatePendingSavingsInterest(
      chain,
      BASE,
      new Date("2026-09-08T08:21:54Z")
    );

    const lastUpdate = estimateHbdInterest.mock.calls[0][2] as Date;
    expect(lastUpdate.toISOString()).toBe("2022-01-25T03:17:21.000Z");
  });

  it("accepts the display-formatted date as well as the raw chain shape", () => {
    const { chain, estimateHbdInterest } = makeChain();

    calculatePendingSavingsInterest(
      chain,
      { ...BASE, lastCompoundingDate: "2022/01/25 03:17:21 UTC" },
      new Date("2026-09-08T08:21:54Z")
    );

    const lastUpdate = estimateHbdInterest.mock.calls[0][2] as Date;
    expect(lastUpdate.toISOString()).toBe("2022-01-25T03:17:21.000Z");
  });

  it("clamps a browser clock that trails the last compounding date", () => {
    const { chain, estimateHbdInterest } = makeChain();

    calculatePendingSavingsInterest(
      chain,
      BASE,
      new Date("2020-01-01T00:00:00Z")
    );

    const [, , lastUpdate, now] = estimateHbdInterest.mock.calls[0];
    expect(now).toEqual(lastUpdate);
  });

  it("returns null when the account has never held HBD savings", () => {
    const { chain, estimateHbdInterest } = makeChain();

    const result = calculatePendingSavingsInterest(chain, {
      ...BASE,
      savingsHbdSeconds: "0",
      savingsHbdBalanceSatoshis: 0,
    });

    expect(result).toBeNull();
    expect(estimateHbdInterest).not.toHaveBeenCalled();
  });

  it("still reports interest accrued on a savings balance since emptied", () => {
    const { chain } = makeChain();

    const result = calculatePendingSavingsInterest(chain, {
      ...BASE,
      savingsHbdBalanceSatoshis: 0,
    });

    expect(result).toEqual(hbd("4794238"));
  });

  it("returns null without a rate, a date or a chain", () => {
    const { chain } = makeChain();

    expect(
      calculatePendingSavingsInterest(chain, {
        ...BASE,
        interestRateBasisPoints: 0,
      })
    ).toBeNull();
    expect(
      calculatePendingSavingsInterest(chain, {
        ...BASE,
        lastCompoundingDate: "not-a-date",
      })
    ).toBeNull();
    expect(calculatePendingSavingsInterest(undefined, BASE)).toBeNull();
  });

  it("returns null instead of propagating a wax assertion, but logs it", () => {
    const throwing = jest.fn(() => {
      throw new Error("Assert Exception");
    });
    const { chain } = makeChain(throwing);
    const logged = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(calculatePendingSavingsInterest(chain, BASE)).toBeNull();
    expect(logged).toHaveBeenCalled();

    logged.mockRestore();
  });
});

describe("formatIntegerString", () => {
  it("groups a chain counter without rounding it", () => {
    expect(formatIntegerString("3282007838238", "en-US")).toBe(
      "3,282,007,838,238"
    );
    expect(formatIntegerString("4013278129191", "en-US")).toBe(
      "4,013,278,129,191"
    );
  });

  it("keeps every digit past 2^53, where Number would corrupt them", () => {
    const raw = "9007199254740993";
    expect(Number(raw).toLocaleString("en-US")).toBe("9,007,199,254,740,992");
    expect(formatIntegerString(raw, "en-US")).toBe("9,007,199,254,740,993");
  });

  it("passes through anything that is not an integer", () => {
    expect(formatIntegerString("")).toBe("");
    expect(formatIntegerString(undefined)).toBe("");
    expect(formatIntegerString("12.5")).toBe("12.5");
    expect(formatIntegerString("n/a")).toBe("n/a");
  });
});
