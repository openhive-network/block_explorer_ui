// The hook module pulls in the fetching service and wax; neither is needed here.
jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: {},
}));
jest.mock(
  "@hiveio/wax",
  () => ({
    WaxError: class WaxError extends Error {},
    WaxRequestAbortedByUser: class WaxRequestAbortedByUser extends Error {},
  }),
  { virtual: true }
);

import { formatMilliHbd } from "@/hooks/api/proposals/useProposalPaidAmounts";

describe("formatMilliHbd", () => {
  it("rounds to whole HBD for the headline", () => {
    // #373 Hive Keychain: 75,667.680 HBD
    expect(formatMilliHbd("75667680", "en-US")).toBe("75,668");
    expect(formatMilliHbd("120450374", "en-US")).toBe("120,450");
    expect(formatMilliHbd("499", "en-US")).toBe("0");
    expect(formatMilliHbd("500", "en-US")).toBe("1");
  });

  it("keeps all three decimals when exact", () => {
    expect(formatMilliHbd("75667680", "en-US", true)).toBe("75,667.680");
    expect(formatMilliHbd("5", "en-US", true)).toBe("0.005");
    expect(formatMilliHbd("0", "en-US", true)).toBe("0.000");
  });

  it("uses the locale's separators", () => {
    expect(formatMilliHbd("75667680", "de-DE", true)).toBe("75.667,680");
  });

  it("stays exact past Number's safe range", () => {
    expect(formatMilliHbd("9007199254740993123", "en-US", true)).toBe(
      "9,007,199,254,740,993.123"
    );
  });

  it("rejects anything that is not a whole number of milli-HBD", () => {
    expect(formatMilliHbd("12.5")).toBeNull();
    expect(formatMilliHbd("")).toBeNull();
    expect(formatMilliHbd("-3")).toBeNull();
  });
});
