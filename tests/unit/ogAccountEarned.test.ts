import type { NextApiRequest, NextApiResponse } from "next";
import { restGet, rpc, fetchWithTimeout } from "@/utils/seo/serverRpc";
import { buildAccountCardData } from "@/components/account/accountCard/accountCardData";
import handler from "@/pages/api/og/account/[accountName]";

jest.mock("@/utils/seo/serverRpc", () => ({
  rpc: jest.fn(),
  restGet: jest.fn(),
  fetchWithTimeout: jest.fn(),
}));
jest.mock("@/utils/og/rasterize", () => ({
  svgToPng: jest.fn(async () => Buffer.from("png")),
  fallbackPng: jest.fn(() => null),
}));
jest.mock("@/components/account/accountCard/accountCardData", () => {
  const actual = jest.requireActual(
    "@/components/account/accountCard/accountCardData"
  );
  return { ...actual, buildAccountCardData: jest.fn(actual.buildAccountCardData) };
});

const FINANCIAL_SUMMARY = /^\/haf-stats-api\/account\/blocktrades\/financial-summary\?from_date=[^&]+&granularity=month$/;

// 1 VEST == 0.5 HP with these globals.
const RPC_RESULTS: Record<string, unknown> = {
  "condenser_api.get_accounts": [
    {
      name: "blocktrades",
      vesting_shares: "2000000.000000 VESTS",
      received_vesting_shares: "0.000000 VESTS",
      delegated_vesting_shares: "0.000000 VESTS",
      vesting_withdraw_rate: "0.000000 VESTS",
      post_count: 1,
      created: "2016-03-30T00:00:00",
      reputation: "0",
    },
  ],
  "condenser_api.get_dynamic_global_properties": {
    total_vesting_fund_hive: "500.000 HIVE",
    total_vesting_shares: "1000.000000 VESTS",
  },
  "condenser_api.get_follow_count": { follower_count: 0 },
  "condenser_api.get_current_median_history_price": null,
};

const callHandler = async () => {
  const res = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    end: jest.fn(),
  };
  await handler(
    { query: { accountName: "blocktrades" } } as unknown as NextApiRequest,
    res as unknown as NextApiResponse
  );
  return res;
};

describe("OG account card earned HP", () => {
  beforeEach(() => {
    jest.mocked(rpc).mockImplementation(
      async (method: string) => RPC_RESULTS[method]
    );
    jest.mocked(fetchWithTimeout).mockRejectedValue(new Error("no avatar"));
    // Unknown routes 404, as PostgREST does for unmatched haf_stats paths.
    jest.mocked(restGet).mockImplementation(async (route: string) => {
      if (FINANCIAL_SUMMARY.test(route)) {
        return [
          { category: "author_reward_operation", direction: "incoming", vests_nai: 3_000_000 },
          { category: "curation_reward_operation", direction: "incoming", vests_nai: "1000000" },
          { category: "transfer_operation", direction: "incoming", vests_nai: 9_000_000 },
        ];
      }
      throw new Error(`REST 404 for ${route}`);
    });
    jest.mocked(buildAccountCardData).mockClear();
  });

  it("requests haf_stats' singular account path with from_date", async () => {
    await callHandler();
    const routes = jest
      .mocked(restGet)
      .mock.calls.map(([route]) => route)
      .filter((route) => route.startsWith("/haf-stats-api/"));
    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatch(FINANCIAL_SUMMARY);
    const fromDate = new URL(routes[0], "http://x").searchParams.get("from_date");
    expect(Number.isNaN(Date.parse(fromDate!))).toBe(false);
  });

  it("feeds the summed author + curation rewards into the card", async () => {
    const res = await callHandler();
    expect(res.status).toHaveBeenCalledWith(200);
    // (3e6 + 1e6) raw vests / 1e6 = 4 VESTS -> 2 HP
    expect(jest.mocked(buildAccountCardData).mock.calls[0][0].earnedHp).toBe(2);
  });
});
