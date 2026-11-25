import { convertBooleanArrayToIds } from "@/lib/utils";
import { URLToData } from "@/utils/URLutils";
import { accountActions, blockNumberActions } from "@/utils/searchActions";

const NOW = new Date(2026, 10, 25, 12, 30, 15, 500);
const WEEK_AGO = new Date(2026, 10, 18, 12, 30, 15, 0);

// The query of an action's link, read the way the pages read it.
const queryOf = (href: string) => {
  const [path, search] = href.split("?");
  const query: Record<string, unknown> = {};
  new URLSearchParams(search).forEach((value, key) => {
    query[key] = URLToData(value);
  });
  return { path, query };
};

const keysOf = (actions: { key: string }[]) => actions.map((a) => a.key);

describe("accountActions", () => {
  it("offers the common searches, without the witness and proposal ones by default", () => {
    expect(keysOf(accountActions("gtg", { now: NOW }))).toEqual([
      "operations",
      "transfers",
      "comments",
      "balanceHistory",
    ]);
  });

  it("adds blocks produced for a witness and proposals when that section is on", () => {
    expect(
      keysOf(
        accountActions("gtg", { now: NOW, isWitness: true, proposals: true })
      )
    ).toEqual([
      "operations",
      "transfers",
      "comments",
      "balanceHistory",
      "proposals",
      // Last, so the witness list arriving late can't shift a highlight.
      "blocksProduced",
    ]);
  });

  it("opens operations on the last 7 days, as the range picker would", () => {
    const [operations] = accountActions("gtg", { now: NOW });
    expect(operations.recent).toBe(true);
    const { path, query } = queryOf(operations.href);
    expect(path).toBe("/@gtg");
    expect(query).toEqual({
      rangeSelectKey: "lastTime",
      lastTime: 7,
      timeUnit: "days",
      fromDate: WEEK_AGO,
    });
  });

  it("filters transfers to the transfer operation", () => {
    const transfers = accountActions("gtg", { now: NOW })[1];
    const { query } = queryOf(transfers.href);
    expect(convertBooleanArrayToIds(query.filters as boolean[])).toEqual([2]);
    expect(query.fromDate).toEqual(WEEK_AGO);
  });

  it("links the comments and balance history tabs", () => {
    const actions = accountActions("gtg", { now: NOW });
    expect(actions[2].href).toBe("/@gtg?activeTab=comments");
    expect(actions[3].href).toBe("/@gtg?activeTab=balance-history");
  });

  it("lists the blocks the account produced, with the blocks page's date key", () => {
    const produced = accountActions("gtg", { now: NOW, isWitness: true })[4];
    const { path, query } = queryOf(produced.href);
    expect(path).toBe("/blocks");
    expect(query).toMatchObject({
      accountName: "gtg",
      rangeSelectKey: "lastTime",
      startDate: WEEK_AGO,
    });
    // The account filter alone also matches blocks gtg only appears in;
    // producer_reward_operation is the producer's alone.
    expect(convertBooleanArrayToIds(query.filters as boolean[])).toEqual([64]);
  });

  it("searches proposals by the name", () => {
    const actions = accountActions("gtg", { now: NOW, proposals: true });
    expect(actions[actions.length - 1].href).toBe("/proposals?q=gtg");
  });
});

describe("blockNumberActions", () => {
  it("lists the blocks up to the number", () => {
    const [upTo] = blockNumberActions("110298000");
    expect(queryOf(upTo.href)).toEqual({
      path: "/blocks",
      query: { rangeSelectKey: "blockRange", toBlock: 110298000 },
    });
  });

  it("offers the proposal only for numbers in proposal range", () => {
    expect(keysOf(blockNumberActions("123", { proposals: true }))).toEqual([
      "blocksUpTo",
      "proposal",
    ]);
    expect(blockNumberActions("123", { proposals: true })[1].href).toBe(
      "/proposals?q=123"
    );
    expect(keysOf(blockNumberActions("5000", { proposals: true }))).toEqual([
      "blocksUpTo",
    ]);
    expect(
      keysOf(blockNumberActions("110298000", { proposals: true }))
    ).toEqual(["blocksUpTo"]);
    expect(keysOf(blockNumberActions("123"))).toEqual(["blocksUpTo"]);
  });
});
