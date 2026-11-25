/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import VotingPowerTool from "@/components/tools/VotingPowerTool";

jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

// The app Button reads the theme context; a plain button is enough here.
jest.mock("@/components/ui/button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

// t() returns the key followed by its options, so the test sees which text is used.
jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({
    locale: "en-US",
    t: (key: string, options?: Record<string, string>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

let mockQuery: Record<string, string> = {};
const mockReplace = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    query: mockQuery,
    isReady: true,
    pathname: "/tools/voting-power",
    replace: mockReplace,
  }),
}));

// What the data hook returns for the account being looked up.
let mockResult: Record<string, unknown> = {};
const mockLookups: string[] = [];
jest.mock("@/hooks/api/common/useVotingPower", () => ({
  __esModule: true,
  default: (account: string) => {
    mockLookups.push(account);
    return account ? mockResult : { isLoading: false, isError: false };
  },
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// The bozz figures from voteValue.test.ts: 1e9 VESTS of mana at full power.
const rates = {
  rewardBalanceHive: 1137471.597,
  recentClaims: "786311183678338194",
  hbdPerHive: 0.034,
  hivePerVests: 0.0006,
  votePowerReserveRate: 10,
  headBlock: 111900000,
  asOf: new Date("2026-11-24T12:00:00Z"),
};
const found = (overrides: Record<string, unknown> = {}) => ({
  account: { name: "alice" },
  governance: { status: "active", hp: 1234.5, expires: new Date("2027-05-01") },
  mana: {
    current: BigInt("500000000000000"),
    max: BigInt("1000000000000000"),
    percent: 50,
  },
  rates,
  isLoading: false,
  isError: false,
  ...overrides,
});

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  mockQuery = {};
  mockResult = found();
  mockLookups.length = 0;
  mockReplace.mockClear();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = () => act(() => root.render(<VotingPowerTool />));
const text = (testId: string) =>
  container.querySelector(`[data-testid="${testId}"]`)?.textContent ?? "";

describe("VotingPowerTool", () => {
  it("looks up the account from a shared link and shows both figures", () => {
    mockQuery = { account: "alice" };
    render();
    expect(mockLookups).toContain("alice");
    expect(text("voting-power-governance")).toContain("1,234.500 HP");
    expect(text("voting-power-governance")).toContain(
      "tools.votingPower.governanceActiveUntil"
    );
    // Half the mana of 1e9 VESTS: 1e13 - 5e7 rshares -> about 0.492 HBD.
    expect(text("voting-power-upvote-value")).toContain("0.492 HBD");
    // The HP it votes with: 1e9 VESTS of max mana at 0.0006 HP per VESTS.
    expect(text("voting-power-upvote-hp")).toContain("600,000.000 HP");
    expect(text("voting-power-upvote")).toContain(
      "tools.votingPower.upvoteHpExplain"
    );
    expect(text("voting-power-upvote")).toContain('"power":"50%"');
    // At full power the same vote is worth about twice as much.
    expect(text("voting-power-upvote")).toContain("0.984 HBD");
    expect(text("voting-power-rates")).toContain('"block":"111,900,000"');
  });

  it("follows the weight slider", () => {
    mockQuery = { account: "alice", weight: "50" };
    render();
    const slider = container.querySelector<HTMLInputElement>(
      "#voting-power-weight"
    )!;
    expect(slider.value).toBe("50");
    expect(text("voting-power-upvote-value")).toContain("0.246 HBD");
    act(() => {
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )!.set!;
      setValue.call(slider, "100");
      slider.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(text("voting-power-upvote-value")).toContain("0.492 HBD");
  });

  it("says where the weight goes for a proxied or expired account", () => {
    mockQuery = { account: "alice" };
    mockResult = found({
      governance: { status: "proxy", hp: 10, proxy: "bob" },
    });
    render();
    expect(text("voting-power-governance")).toContain(
      "tools.votingPower.governanceProxy"
    );
    expect(container.querySelector('a[href="/@bob"]')).not.toBe(null);

    mockResult = found({
      governance: {
        status: "proxy",
        hp: 10,
        proxy: "bob",
        expires: new Date("2027-07-09T00:00:00Z"),
      },
    });
    render();
    expect(text("voting-power-governance")).toContain(
      "tools.votingPower.governanceProxyUntil"
    );

    mockResult = found({ governance: { status: "inactive", hp: 10 } });
    render();
    expect(text("voting-power-governance")).toContain(
      "tools.votingPower.governanceInactive"
    );
  });

  it("flags a vote too small to count", () => {
    mockQuery = { account: "alice", weight: "1" };
    mockResult = found({
      mana: { current: BigInt(1000000), max: BigInt(1000000), percent: 100 },
    });
    render();
    expect(text("voting-power-upvote")).toContain(
      "tools.votingPower.upvoteDust"
    );
  });

  it("says so when the account has no Hive Power, not that the vote is too small", () => {
    mockQuery = { account: "alice" };
    mockResult = found({
      mana: { current: BigInt(0), max: BigInt(0), percent: 0 },
    });
    render();
    expect(text("voting-power-upvote")).toContain(
      "tools.votingPower.upvoteNoPower"
    );
    expect(text("voting-power-upvote-hp")).toContain("0.000 HP");
    expect(text("voting-power-upvote")).not.toContain(
      "tools.votingPower.upvoteDust"
    );
  });

  it("reads a name typed or linked in capitals as the lower-case account", () => {
    mockQuery = { account: "Alice" };
    render();
    expect(mockLookups).toContain("alice");
    expect(mockLookups).not.toContain("Alice");
  });

  it("doesn't flip back to the old account while the address is updating", () => {
    jest.useFakeTimers();
    try {
      mockQuery = { account: "alice" };
      render();
      const input = container.querySelector<HTMLInputElement>(
        "#voting-power-account"
      )!;
      act(() => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )!.set!.call(input, "bob");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      act(() => {
        container
          .querySelector("form")!
          .dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(mockReplace).toHaveBeenCalledTimes(1);
      expect(mockReplace.mock.calls[0][0].query).toEqual({ account: "bob" });

      // A render while router.query still says alice (the replace hasn't
      // landed yet) must keep bob.
      mockLookups.length = 0;
      render();
      expect(mockLookups.every((name) => name === "bob")).toBe(true);
      expect(input.value).toBe("bob");

      // The replace lands: nothing changes and nothing is written again.
      mockQuery = { account: "bob" };
      render();
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(input.value).toBe("bob");
      expect(mockReplace).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("reports an unknown account and an invalid name", () => {
    mockQuery = { account: "nobody" };
    mockResult = found({ account: null, governance: null, mana: null });
    render();
    expect(container.textContent).toContain(
      'tools.votingPower.notFound {"account":"nobody"}'
    );

    mockQuery = { account: "a" };
    render();
    expect(container.textContent).toContain("tools.votingPower.invalid");
  });
});
