import {
  MAX_NAMES,
  buildRow,
  chunk,
  parseAccountList,
  runLimited,
} from "@/utils/bulkAccounts";

const getProfiles = jest.fn();
jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: { getProfiles: (names: string[]) => getProfiles(names) },
}));

import {
  fetchProfiles,
  missingAccount,
} from "@/hooks/api/common/useBulkAccounts";

const vests = (amount: string) => ({
  amount,
  precision: 6,
  nai: "@@000000037",
});
const hive = (amount: string) => ({ amount, precision: 3, nai: "@@000000021" });

describe("parseAccountList", () => {
  it("reads names split by lines, commas, semicolons and spaces, with or without @", () => {
    expect(parseAccountList("alice\n@Bob, carol;dave  eve\r\n").names).toEqual([
      "alice",
      "bob",
      "carol",
      "dave",
      "eve",
    ]);
  });

  it("drops repeats and keeps the first-seen order", () => {
    expect(parseAccountList("bob alice @bob ALICE").names).toEqual([
      "bob",
      "alice",
    ]);
  });

  it("lists impossible names separately, as typed", () => {
    const parsed = parseAccountList("alice ab 1abc toolongaccountname1 gtg");
    expect(parsed.names).toEqual(["alice", "gtg"]);
    expect(parsed.invalid).toEqual(["ab", "1abc", "toolongaccountname1"]);
  });

  it("caps the list and counts what was left out", () => {
    const text = Array.from(
      { length: MAX_NAMES + 5 },
      (_, i) => `user${i}`
    ).join("\n");
    const parsed = parseAccountList(text);
    expect(parsed.names).toHaveLength(MAX_NAMES);
    expect(parsed.overLimit).toBe(5);
  });
});

describe("chunk and runLimited", () => {
  it("splits into batches", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("keeps results in order and never runs more than the limit at once", async () => {
    let running = 0;
    let most = 0;
    const tasks = [30, 5, 20, 1, 10].map((ms, i) => async () => {
      running++;
      most = Math.max(most, running);
      await new Promise((resolve) => setTimeout(resolve, ms));
      running--;
      return i;
    });
    expect(await runLimited(tasks, 2)).toEqual([0, 1, 2, 3, 4]);
    expect(most).toBe(2);
  });
});

describe("buildRow", () => {
  it("turns a find_accounts entry and a hivemind profile into a row", () => {
    const row = buildRow(
      {
        name: "alice",
        created: "2020-01-02T03:04:05",
        balance: hive("12345"),
        hbd_balance: hive("500"),
        savings_balance: hive("1000"),
        savings_hbd_balance: hive("2000"),
        vesting_shares: vests("5000000000"),
        delegated_vesting_shares: vests("1000000000"),
        received_vesting_shares: vests("250000000"),
      },
      { name: "alice", reputation: 61.97, active: "2026-11-20T10:00:00" }
    );
    expect(row).toEqual({
      account: "alice",
      ownVests: 5000,
      effectiveVests: 4250,
      hive: 12.345,
      hbd: 0.5,
      savingsHive: 1,
      savingsHbd: 2,
      reputation: 61.97,
      lastActivity: new Date("2026-11-20T10:00:00Z"),
      created: new Date("2020-01-02T03:04:05Z"),
    });
  });

  it("leaves reputation and last activity empty without a profile", () => {
    const row = buildRow({ name: "bob" }, undefined);
    expect(row.reputation).toBe(null);
    expect(row.lastActivity).toBe(null);
  });
});

describe("fetchProfiles", () => {
  beforeEach(() => getProfiles.mockReset());

  const missing = (name: string) =>
    new Error(
      `[Hivemind Error] Assert Exception: [{"${name}": "account does not exist"}]`
    );

  it("splits a batch around an account hivemind doesn't know yet", async () => {
    getProfiles.mockImplementation(async (names: string[]) => {
      if (names.includes("newbie")) throw missing("newbie");
      return names.map((name) => ({ name, reputation: 25 }));
    });
    const result = await fetchProfiles(["a1a", "b2b", "newbie", "c3c"]);
    expect(result.failed).toBe(false);
    expect(result.profiles.map((p) => p.name).sort()).toEqual([
      "a1a",
      "b2b",
      "c3c",
    ]);
  });

  it("gives up on the batch, and says so, when hivemind itself fails", async () => {
    getProfiles.mockRejectedValue(new Error("timeout"));
    const result = await fetchProfiles(["a1a", "b2b"]);
    expect(result).toEqual({ profiles: [], failed: true });
    expect(getProfiles).toHaveBeenCalledTimes(1);
  });

  it("finds the node's reason in the error's response too", () => {
    const error = Object.assign(new Error("Chain API returned an error"), {
      response: { error: { message: "account does not exist" } },
    });
    expect(missingAccount(error)).toBe(true);
    expect(missingAccount(new Error("Chain API returned an error"))).toBe(
      false
    );
  });
});
