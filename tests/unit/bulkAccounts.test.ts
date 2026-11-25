import {
  MAX_NAMES,
  buildRow,
  chunk,
  namesFromFile,
  parseAccountList,
  runLimited,
} from "@/utils/bulkAccounts";

const getProfiles = jest.fn();
const findAccounts = jest.fn();
const getDynamicGlobalProperties = jest.fn();
jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: {
    getProfiles: (names: string[]) => getProfiles(names),
    findAccounts: (names: string[]) => findAccounts(names),
    getDynamicGlobalProperties: () => getDynamicGlobalProperties(),
  },
}));

import {
  fetchProfiles,
  lookUp,
  missingAccounts,
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

  it("reads quoted spreadsheet cells", () => {
    expect(parseAccountList(`"alice","@bob"\n'carol'`).names).toEqual([
      "alice",
      "bob",
      "carol",
    ]);
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

describe("namesFromFile", () => {
  it("takes a CSV's first column and skips its header row", () => {
    const csv =
      '﻿Account,Own HP,HIVE\r\nalice,600.000,1.000\r\n"bob",1.000,2.000\r\n';
    expect(parseAccountList(namesFromFile(csv, true, "Account")).names).toEqual(
      ["alice", "bob"]
    );
  });

  it("knows common header words, and keeps a first row that is a name", () => {
    expect(namesFromFile("username;score\ngtg;1", true)).toBe("gtg");
    expect(namesFromFile("gtg,1\nalice,2", true)).toBe("gtg\nalice");
  });

  it("reads plain text, and a one-column CSV, as typed", () => {
    expect(namesFromFile("alice, bob", false)).toBe("alice, bob");
    expect(namesFromFile("alice\nbob", true)).toBe("alice\nbob");
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

  it("starts nothing more once a task fails, or the signal aborts", async () => {
    const started: number[] = [];
    const tasks = [0, 1, 2, 3, 4].map((i) => async () => {
      started.push(i);
      if (i === 0) throw new Error("node down");
      return i;
    });
    await expect(runLimited(tasks, 1)).rejects.toThrow("node down");
    expect(started).toEqual([0]);

    const controller = new AbortController();
    controller.abort();
    started.length = 0;
    await expect(
      runLimited(tasks.slice(1), 2, controller.signal)
    ).rejects.toBeDefined();
    expect(started).toEqual([]);
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

  it("asks again without the accounts hivemind doesn't know yet", async () => {
    getProfiles.mockImplementation(async (names: string[]) => {
      if (names.includes("newbie")) throw missing("newbie");
      return names.map((name) => ({ name, reputation: 25 }));
    });
    const result = await fetchProfiles(["a1a", "b2b", "newbie", "c3c"]);
    expect(result.failed).toBe(false);
    expect(result.profiles.map((p) => p.name)).toEqual(["a1a", "b2b", "c3c"]);
    expect(getProfiles).toHaveBeenCalledTimes(2);
  });

  it("splits the batch, one half at a time, when the error names nobody", async () => {
    let inFlight = 0;
    let most = 0;
    getProfiles.mockImplementation(async (names: string[]) => {
      inFlight++;
      most = Math.max(most, inFlight);
      await Promise.resolve();
      inFlight--;
      if (names.includes("newbie"))
        throw new Error("Assert Exception: account does not exist");
      return names.map((name) => ({ name }));
    });
    const result = await fetchProfiles(["a1a", "b2b", "newbie", "c3c"]);
    expect(result.profiles.map((p) => p.name)).toEqual(["a1a", "b2b", "c3c"]);
    expect(most).toBe(1);
  });

  it("gives up on the batch, and says so, when hivemind itself fails", async () => {
    getProfiles.mockRejectedValue(new Error("timeout"));
    const result = await fetchProfiles(["a1a", "b2b"]);
    expect(result).toEqual({ profiles: [], failed: true });
    expect(getProfiles).toHaveBeenCalledTimes(1);
  });

  it("reads the missing names from the message or the error's response", () => {
    expect(missingAccounts(missing("new.bie"))).toEqual(["new.bie"]);
    const error = Object.assign(new Error("Chain API returned an error"), {
      response: {
        error: {
          message:
            'Assert Exception:[{"a1a": "account does not exist"}, {"b-2": "account does not exist"}]',
        },
      },
    });
    expect(missingAccounts(error)).toEqual(["a1a", "b-2"]);
    expect(missingAccounts(new Error("timeout"))).toEqual([]);
  });
});

describe("lookUp", () => {
  const names = Array.from({ length: 250 }, (_, i) => `user${i}`);
  const gone = new Set(["user5", "user150", "user249"]);

  beforeEach(() => {
    getProfiles.mockReset();
    getProfiles.mockImplementation(async (list: string[]) =>
      list.map((name) => ({
        name,
        reputation: 50.5,
        active: "2026-11-01T00:00:00",
      }))
    );
    findAccounts.mockReset();
    findAccounts.mockImplementation(async (batch: string[]) => ({
      accounts: batch
        .filter((name) => !gone.has(name))
        .map((name) => ({ name, vesting_shares: vests("2000000000") })),
    }));
    getDynamicGlobalProperties.mockResolvedValue({
      total_vesting_fund_hive: hive("600000000"),
      total_vesting_shares: vests("1000000000000"),
    });
  });

  it("looks a long list up in batches of 100 and keeps its order", async () => {
    const progress: number[] = [];
    const result = await lookUp(names, (done) => progress.push(done));
    expect(findAccounts.mock.calls.map(([batch]) => batch.length)).toEqual([
      100, 100, 50,
    ]);
    expect(result.rows).toHaveLength(247);
    expect(result.rows.slice(0, 6).map((row) => row.account)).toEqual([
      "user0",
      "user1",
      "user2",
      "user3",
      "user4",
      "user6",
    ]);
    expect(result.notFound).toEqual(["user5", "user150", "user249"]);
    // 600,000 HIVE over 1,000,000 VESTS.
    expect(result.hivePerVests).toBeCloseTo(0.6);
    expect(result.rows[0].ownVests).toBe(2000);
    expect(result.rows[0].reputation).toBe(50.5);
    expect(result.profilesFailed).toBe(false);
    expect(progress[progress.length - 1]).toBe(250);
  });

  it("marks the result when hivemind fails for a batch, and keeps the rest", async () => {
    getProfiles.mockImplementation(async (list: string[]) => {
      if (list.includes("user100")) throw new Error("hivemind down");
      return list.map((name) => ({ name, reputation: 60 }));
    });
    const result = await lookUp(names, () => undefined);
    expect(result.profilesFailed).toBe(true);
    expect(
      result.rows.find((row) => row.account === "user100")?.reputation
    ).toBe(null);
    expect(result.rows[0].reputation).toBe(60);
  });

  it("doesn't report progress for a run that was abandoned", async () => {
    const controller = new AbortController();
    const progress: number[] = [];
    findAccounts.mockImplementation(async (batch: string[]) => {
      controller.abort();
      return { accounts: batch.map((name) => ({ name })) };
    });
    await expect(
      lookUp(names, (done) => progress.push(done), controller.signal)
    ).rejects.toBeDefined();
    expect(progress).toEqual([]);
  });
});
