import {
  RECENT_LIMIT,
  addRecentEntry,
  pathToRecentEntry,
  recentViewsKey,
} from "@/utils/recentlyViewed";

const TX = "a".repeat(40);

describe("pathToRecentEntry", () => {
  it("recognises accounts, blocks and transactions", () => {
    expect(pathToRecentEntry("/@gtg?section=wallet")).toEqual({
      kind: "account",
      id: "gtg",
    });
    expect(pathToRecentEntry("/%40gtg")).toEqual({
      kind: "account",
      id: "gtg",
    });
    expect(pathToRecentEntry("/block/110298000")).toEqual({
      kind: "block",
      id: "110298000",
    });
    expect(pathToRecentEntry(`/tx/${TX.toUpperCase()}`)).toEqual({
      kind: "tx",
      id: TX,
    });
  });

  it("ignores every other page", () => {
    expect(pathToRecentEntry("/witnesses")).toBeNull();
    expect(pathToRecentEntry("/block/abc")).toBeNull();
    expect(pathToRecentEntry("/tx/short")).toBeNull();
  });
});

describe("addRecentEntry", () => {
  it("moves a repeat visit to the front instead of duplicating it", () => {
    const list = addRecentEntry(
      [
        { kind: "account", id: "bob" },
        { kind: "account", id: "gtg" },
      ],
      { kind: "account", id: "gtg" }
    );
    expect(list.map((e) => e.id)).toEqual(["gtg", "bob"]);
  });

  it("keeps only the most recent entries", () => {
    let list: ReturnType<typeof addRecentEntry> = [];
    for (let i = 0; i < RECENT_LIMIT + 3; i++) {
      list = addRecentEntry(list, { kind: "block", id: String(i) });
    }
    expect(list).toHaveLength(RECENT_LIMIT);
    expect(list[0].id).toBe(String(RECENT_LIMIT + 2));
  });
});

it("keys the list per user", () => {
  expect(recentViewsKey("gtg")).toBe("hivescan_recent_views_gtg");
  expect(recentViewsKey(null)).toBe("hivescan_recent_views_guest");
});
