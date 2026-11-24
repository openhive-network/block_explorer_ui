import { governanceVests, governanceWeight } from "@/utils/governanceVests";

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

describe("governanceWeight", () => {
  const now = new Date("2026-11-14T12:00:00Z");
  // 1 HP = 2000 VESTS, so 2,000,000 VESTS (raw 2e12) is 1,000 HP.
  const hivePerVests = 1 / 2000;
  const account = {
    vesting_shares: vests("2000000000000"),
    delayed_votes: [],
    proxied_vsf_votes: [0, 0, 0, 0],
  };

  it("counts own and proxied VESTS in HP while votes are active", () => {
    // blocktrades on 2026-11-14: a proxy for others, votes active a year out.
    const weight = governanceWeight(
      {
        ...account,
        proxied_vsf_votes: ["2000000000000", 0, 0, 0],
        proxy: "",
        governance_vote_expiration_ts: "2027-11-04T19:07:39",
      },
      hivePerVests,
      now
    );
    expect(weight).toEqual({
      status: "active",
      hp: 2000,
      expires: new Date("2027-11-04T19:07:39Z"),
    });
  });

  it("is inactive when the votes expired or the account never voted", () => {
    // hived leaves 1969-12-31T23:59:59 on an account with no governance votes.
    for (const ts of ["1969-12-31T23:59:59", "2026-11-14T11:59:59"]) {
      expect(
        governanceWeight(
          { ...account, proxy: "", governance_vote_expiration_ts: ts },
          hivePerVests,
          now
        )
      ).toEqual({ status: "inactive", hp: 1000 });
    }
  });

  it("names the proxy, which casts the votes, whatever the expiry", () => {
    expect(
      governanceWeight(
        {
          ...account,
          proxy: "someproxy",
          governance_vote_expiration_ts: "1969-12-31T23:59:59",
        },
        hivePerVests,
        now
      )
    ).toEqual({
      status: "proxy",
      hp: 1000,
      proxy: "someproxy",
      expires: null,
    });
  });

  it("gives a proxy setting's own expiry while it is in the future", () => {
    const expires = new Date("2027-07-09T00:00:00Z");
    expect(
      governanceWeight(
        {
          ...account,
          proxy: "someproxy",
          governance_vote_expiration_ts: expires,
        },
        hivePerVests,
        now
      )
    ).toEqual({ status: "proxy", hp: 1000, proxy: "someproxy", expires });
  });

  it("leaves out power-ups still in their delay and reads a Date expiry", () => {
    const expires = new Date("2027-01-01T00:00:00Z");
    expect(
      governanceWeight(
        {
          ...account,
          delayed_votes: [{ val: "1000000000000" }],
          proxy: "",
          governance_vote_expiration_ts: expires,
        },
        hivePerVests,
        now
      )
    ).toEqual({ status: "active", hp: 500, expires });
  });

  it("counts a proxy's own proxied votes, which flow on to its proxy", () => {
    expect(
      governanceWeight(
        {
          ...account,
          proxied_vsf_votes: ["2000000000000", 0, 0, 0],
          proxy: "someproxy",
        },
        hivePerVests,
        now
      )
    ).toMatchObject({ status: "proxy", hp: 2000, proxy: "someproxy" });
  });

  it("reads VESTS at chain precision when the asset leaves it out", () => {
    expect(
      governanceWeight(
        { vesting_shares: { amount: "2000000000000" } },
        hivePerVests,
        now
      )
    ).toEqual({ status: "active", hp: 1000, expires: null });
  });
});
