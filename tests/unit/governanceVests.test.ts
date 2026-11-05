import { governanceVests } from "@/utils/governanceVests";

const vests = (amount: string) => ({
  amount,
  precision: 6,
  nai: "@@000000037",
});

describe("governanceVests", () => {
  it("leaves out VESTS still in their 30-day delay, matching hafbe", () => {
    // rozioo on 2026-11-06: find_accounts, and hafbe's direct_vests for the same
    // account from /hafbe-api/proposals/votes?voter=rozioo.
    const rozioo = {
      vesting_shares: vests("744292436581049"),
      delayed_votes: [{ time: "2026-11-02T18:37:48", val: 80280454724807 }],
      proxied_vsf_votes: [0, 0, 0, 0],
    };
    expect(governanceVests(rozioo)).toEqual({
      direct: 664011981856242,
      proxied: 0,
      total: 664011981856242,
    });
  });

  it("handles delayed and proxied votes together, matching hafbe", () => {
    // arcange on 2026-11-06, against hafbe's direct_vests and proxied_vests.
    expect(
      governanceVests({
        vesting_shares: vests("106900392879289"),
        delayed_votes: [{ val: 22126384561322 }],
        proxied_vsf_votes: [82853069657, 0, 0, 0],
      })
    ).toEqual({
      direct: 84774008317967,
      proxied: 82853069657,
      total: 84774008317967 + 82853069657,
    });
  });

  it("adds every level of proxied votes", () => {
    const { direct, proxied, total } = governanceVests({
      vesting_shares: vests("1000"),
      delayed_votes: [],
      proxied_vsf_votes: [300, "200", 0, 0],
    });
    expect(direct).toBe(1000);
    expect(proxied).toBe(500);
    expect(total).toBe(1500);
  });

  it("sums several delayed power-ups", () => {
    const { direct } = governanceVests({
      vesting_shares: vests("1000"),
      delayed_votes: [{ val: 100 }, { val: "250" }],
    });
    expect(direct).toBe(650);
  });

  it("gives zero for missing fields, never a negative weight", () => {
    expect(governanceVests({})).toEqual({ direct: 0, proxied: 0, total: 0 });
    expect(
      governanceVests({
        vesting_shares: vests("100"),
        delayed_votes: [{ val: 500 }],
      }).direct
    ).toBe(0);
  });
});
