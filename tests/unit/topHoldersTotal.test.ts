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

import Hive from "@/types/Hive";
import {
  isOptionRejected,
  resolveBalanceType,
} from "@/hooks/api/common/useTopHolders";
import { getAccountBalanceRaw } from "@/utils/accountBalanceForCoin";

describe("resolveBalanceType", () => {
  it("asks for total once the node is known to support it", () => {
    expect(resolveBalanceType("HIVE", "total", true)).toEqual({
      balanceType: "total",
      ready: true,
    });
  });

  it("falls back to liquid on a node without total", () => {
    expect(resolveBalanceType("HBD", "total", false)).toEqual({
      balanceType: "balance",
      ready: true,
    });
  });

  it("waits while support is unknown", () => {
    expect(resolveBalanceType("HIVE", "total", undefined).ready).toBe(false);
  });

  it("does not wait for liquid or savings", () => {
    expect(resolveBalanceType("HIVE", "savings_balance", undefined)).toEqual({
      balanceType: "savings_balance",
      ready: true,
    });
    expect(resolveBalanceType("HBD", "balance", undefined).ready).toBe(true);
  });

  it("always ranks VESTS by its single balance", () => {
    expect(resolveBalanceType("VESTS", "total", true)).toEqual({
      balanceType: "balance",
      ready: true,
    });
  });
});

describe("isOptionRejected", () => {
  const withStatus = (status: number) => ({ response: { status } });

  it("treats a 400 as the node rejecting balance-type=total", () => {
    expect(isOptionRejected(withStatus(400))).toBe(true);
  });

  it("does not treat rate limits, timeouts, server errors or network failures as unsupported", () => {
    expect(isOptionRejected(withStatus(429))).toBe(false);
    expect(isOptionRejected(withStatus(408))).toBe(false);
    expect(isOptionRejected(withStatus(502))).toBe(false);
    expect(isOptionRejected(new Error("network"))).toBe(false);
  });
});

describe("getAccountBalanceRaw with total", () => {
  const balances = {
    hive_balance: 1000,
    hive_savings: 250,
    hbd_balance: 6567,
    hbd_savings: 2639048627,
    vesting_shares: "5000000",
  } as unknown as Hive.AccountBalancesResponse;

  it("adds liquid and savings", () => {
    expect(getAccountBalanceRaw(balances, "HIVE", "total")).toBe(1250);
    expect(getAccountBalanceRaw(balances, "HBD", "total")).toBe(2639055194);
  });

  it("keeps liquid and savings separate", () => {
    expect(getAccountBalanceRaw(balances, "HBD", "balance")).toBe(6567);
    expect(getAccountBalanceRaw(balances, "HBD", "savings_balance")).toBe(
      2639048627
    );
  });

  it("uses vesting shares for VESTS", () => {
    expect(getAccountBalanceRaw(balances, "VESTS", "total")).toBe(5000000);
  });
});
