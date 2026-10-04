import { findRankInTieGroup, TieGroupPage } from "@/utils/topHolderLocate";

// A tie group of `count` accounts named in byte order, starting at global rank `start`.
const group = (count: number, pageSize: number, start = 1000) => {
  const names = Array.from(
    { length: count },
    (_, i) => `acc${String(i).padStart(5, "0")}`
  );
  const calls: number[] = [];
  const fetchPage = async (page: number): Promise<TieGroupPage> => {
    calls.push(page);
    const slice = names.slice((page - 1) * pageSize, page * pageSize);
    return {
      totalPages: Math.ceil(count / pageSize),
      rows: slice.map((account, i) => ({
        account,
        rank: start + (page - 1) * pageSize + i,
      })),
    };
  };
  return { names, calls, fetchPage };
};

describe("findRankInTieGroup", () => {
  it("returns the exact global rank of an account deep in a large tie group", async () => {
    const { fetchPage, calls } = group(50_000, 1000);
    expect(await findRankInTieGroup("acc43210", fetchPage)).toBe(1000 + 43210);
    expect(calls.length).toBeLessThanOrEqual(8);
  });

  it("finds an account on the first page without extra requests", async () => {
    const { fetchPage, calls } = group(30, 1000);
    expect(await findRankInTieGroup("acc00007", fetchPage)).toBe(1007);
    expect(calls).toEqual([1]);
  });

  it("returns null for an account that is not in the group", async () => {
    const { fetchPage } = group(5_000, 1000);
    expect(await findRankInTieGroup("zzz", fetchPage)).toBeNull();
    expect(await findRankInTieGroup("acc00500x", fetchPage)).toBeNull();
  });
});
