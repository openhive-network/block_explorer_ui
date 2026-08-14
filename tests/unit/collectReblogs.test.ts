import { collectReblogs } from "@/hooks/api/accountPage/reblogWalk";

const PAGE_SIZE = 20;

type Entry = { author: string; permlink: string; reblogged_by?: string[] };

const own = (n: number): Entry => ({ author: "me", permlink: `own-${n}` });
const reblog = (n: number): Entry => ({
  author: "someone",
  permlink: `reblog-${n}`,
  reblogged_by: ["me"],
});

// bridge echoes the cursor entry back as the first row of the next page, so a
// fake feed has to repeat it or the walk would look like it skipped an entry.
const pagedFeed = (feed: Entry[]) => {
  const calls: Array<{ author: string; permlink: string } | undefined> = [];
  const fetchPage = async (cursor?: { author: string; permlink: string }) => {
    calls.push(cursor);
    const start = cursor
      ? feed.findIndex((e) => e.permlink === cursor.permlink)
      : 0;
    return feed.slice(start, start + PAGE_SIZE) as any;
  };
  return { fetchPage, calls };
};

describe("collectReblogs", () => {
  it("walks past a full page of own posts to find reblogs", async () => {
    const feed = [
      ...Array.from({ length: 20 }, (_, i) => own(i)),
      ...Array.from({ length: 5 }, (_, i) => reblog(i)),
      ...Array.from({ length: 20 }, (_, i) => own(100 + i)),
    ];
    const { fetchPage, calls } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.entries).toHaveLength(5);
    expect(result.entries.every((e) => e.reblogged_by?.length)).toBe(true);
    expect(calls.length).toBeGreaterThan(1);
  });

  it("stops as soon as the limit is filled", async () => {
    const feed = Array.from({ length: 60 }, (_, i) => reblog(i));
    const { fetchPage, calls } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.entries).toHaveLength(10);
    expect(result.truncated).toBe(false);
    expect(calls).toHaveLength(1);
  });

  it("reports truncated when the page cap is hit with room left", async () => {
    const feed = Array.from({ length: 200 }, (_, i) => own(i));
    const { fetchPage, calls } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.entries).toHaveLength(0);
    expect(result.truncated).toBe(true);
    expect(calls).toHaveLength(3);
    // 20 then 19 each: the echoed cursor row is not a new entry.
    expect(result.scanned).toBe(58);
  });

  it("counts only what it actually read when the blog ends early", async () => {
    const feed = Array.from({ length: 7 }, (_, i) => own(i));
    const { fetchPage } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.truncated).toBe(false);
    expect(result.scanned).toBe(7);
  });

  // A short page means the blog ended, so the list is complete, not cut off.
  it("is not truncated when the blog runs out", async () => {
    const feed = [...Array.from({ length: 5 }, (_, i) => own(i)), reblog(0)];
    const { fetchPage } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.entries).toHaveLength(1);
    expect(result.truncated).toBe(false);
  });

  it("handles an empty blog", async () => {
    const result = await collectReblogs(async () => [], 10, 3, PAGE_SIZE);

    expect(result.entries).toEqual([]);
    expect(result.truncated).toBe(false);
  });

  it("never counts the echoed cursor entry twice", async () => {
    const feed = [
      ...Array.from({ length: 19 }, (_, i) => own(i)),
      reblog(0),
      ...Array.from({ length: 19 }, (_, i) => own(100 + i)),
    ];
    const { fetchPage } = pagedFeed(feed);

    const result = await collectReblogs(fetchPage, 10, 3, PAGE_SIZE);

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].permlink).toBe("reblog-0");
  });
});
