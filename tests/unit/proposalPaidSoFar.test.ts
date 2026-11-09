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

  it("uses the locale's separators and digits", () => {
    expect(formatMilliHbd("75667680", "de-DE", true)).toBe("75.667,680");
    // Arabic-Indic digits in the fraction too, not just the whole part.
    expect(formatMilliHbd("75667680", "ar-EG", true)).toBe("٧٥٬٦٦٧٫٦٨٠");
  });

  it("stays exact at the largest real total", () => {
    // Proposal #0 (the return proposal), about 2.7e11 milli-HBD.
    expect(formatMilliHbd("271796249074", "en-US", true)).toBe(
      "271,796,249.074"
    );
  });

  it("rejects anything that is not a whole number of milli-HBD", () => {
    expect(formatMilliHbd("12.5")).toBeNull();
    expect(formatMilliHbd("")).toBeNull();
    expect(formatMilliHbd("-3")).toBeNull();
  });
});
