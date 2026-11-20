/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import fs from "fs";
import path from "path";
import VoteRemovalCause, {
  removalCause,
  voteExportLabel,
} from "@/components/Witnesses/VoteRemovalCause";
import Hive from "@/types/Hive";

// Like Radix, the tooltip's content exists only while it is open; an open
// tooltip renders it inline, so the test can read it.
let mockTooltipOpen = false;
jest.mock("@/components/ui/hybrid-tooltip", () => {
  const Pass = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const Content = ({ children }: { children: React.ReactNode }) =>
    mockTooltipOpen ? <div data-testid="tooltip">{children}</div> : null;
  return {
    Tooltip: Pass,
    TooltipTrigger: Pass,
    TooltipPortal: Pass,
    TooltipContent: Content,
  };
});

// t() returns the key followed by its options, so the test sees which text is used.
const mockT = (key: string, options?: Record<string, string>) =>
  options ? `${key} ${JSON.stringify(options)}` : key;
jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({ locale: "en", t: mockT }),
}));

// The voter's current proxy chain and the witness votes at its end.
let mockChain = { proxyChain: [] as string[], witnessVotes: [] as string[] };
const mockChainCalls: string[] = [];
jest.mock("@/hooks/api/common/useWitnessVoteChain", () => (name: string) => {
  mockChainCalls.push(name);
  return { ...mockChain, isLoading: false };
});

const vote = (
  overrides: Partial<Hive.WitnessVotesHistory>
): Hive.WitnessVotesHistory => ({
  voter_name: "snapie",
  approve: false,
  vests: 1,
  account_vests: 1,
  proxied_vests: 0,
  timestamp: new Date("2026-11-19T18:45:33Z"),
  ...overrides,
});

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  mockChain = { proxyChain: [], witnessVotes: [] };
  mockChainCalls.length = 0;
  mockTooltipOpen = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const render = (v: Hive.WitnessVotesHistory) =>
  act(() => root.render(<VoteRemovalCause vote={v} witness="aliento" />));

describe("removalCause", () => {
  it("is null for approvals, rows from older nodes and unknown causes", () => {
    expect(removalCause(vote({ approve: true, cause: "votes_cast" }))).toBe(
      null
    );
    expect(removalCause(vote({}))).toBe(null);
    expect(removalCause(vote({ cause: null }))).toBe(null);
    expect(removalCause(vote({ cause: "votes_cast" }))).toBe(null);
    expect(
      removalCause(vote({ cause: "constructor" as Hive.WitnessVoteCause }))
    ).toBe(null);
  });

  it("returns each removal cause", () => {
    for (const cause of [
      "votes_removed",
      "proxy",
      "expired",
      "declined",
    ] as const)
      expect(removalCause(vote({ cause }))).toBe(cause);
  });
});

describe("voteExportLabel", () => {
  it("keeps Approve and Disapprove where there is no reason", () => {
    expect(voteExportLabel(vote({ approve: true }), mockT)).toBe(
      "votesHistoryDialog.approve"
    );
    expect(voteExportLabel(vote({}), mockT)).toBe(
      "votesHistoryDialog.disapprove"
    );
  });

  it("gives the reason, with the proxy's name", () => {
    expect(
      voteExportLabel(vote({ cause: "proxy", proxy_name: "meno" }), mockT)
    ).toBe("votesHistoryDialog.cause.proxy → meno");
    expect(voteExportLabel(vote({ cause: "expired" }), mockT)).toBe(
      "votesHistoryDialog.cause.expired"
    );
  });
});

describe("VoteRemovalCause", () => {
  it("renders nothing for an approval or a row without a cause", () => {
    render(vote({ approve: true, cause: "votes_cast" }));
    expect(container.innerHTML).toBe("");
    render(vote({}));
    expect(container.innerHTML).toBe("");
  });

  const button = () => container.querySelector("button");
  const tooltip = () => container.querySelector('[data-testid="tooltip"]');

  it("shows the reason on a button that opens its explanation", () => {
    render(vote({ cause: "expired" }));
    expect(button()?.getAttribute("type")).toBe("button");
    expect(button()?.textContent).toBe("votesHistoryDialog.cause.expired");
    expect(tooltip()?.textContent).toBe(
      "votesHistoryDialog.causeTooltip.expired"
    );
    expect(mockChainCalls).toEqual([]);
  });

  it("looks up the voter's proxy chain only while the tooltip is open", () => {
    mockTooltipOpen = false;
    render(vote({ cause: "proxy", proxy_name: "meno" }));
    expect(tooltip()).toBe(null);
    expect(mockChainCalls).toEqual([]);
  });

  it("links the proxy and says the weight still counts when it does", () => {
    mockChain = { proxyChain: ["meno"], witnessVotes: ["aliento", "x"] };
    render(vote({ cause: "proxy", proxy_name: "meno" }));
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/@meno");
    // The link is next to the tooltip's button, not inside it.
    expect(button()?.contains(link)).toBe(false);
    expect(button()?.textContent).toBe("votesHistoryDialog.cause.proxy");
    expect(mockChainCalls).toEqual(["snapie"]);
    expect(
      container.querySelector('[data-testid="vote-cause-proxy-still-counts"]')
        ?.textContent
    ).toBe(
      'votesHistoryDialog.causeTooltip.proxyStillCounts {"voter":"snapie","proxy":"meno","witness":"aliento"}'
    );
  });

  it("drops that sentence unless the voter still uses the proxy and the proxy votes for the witness itself", () => {
    const stillCounts = '[data-testid="vote-cause-proxy-still-counts"]';
    mockChain = { proxyChain: ["meno"], witnessVotes: ["x"] };
    render(vote({ cause: "proxy", proxy_name: "meno" }));
    expect(container.querySelector(stillCounts)).toBe(null);

    mockChain = { proxyChain: ["other"], witnessVotes: ["aliento"] };
    render(
      vote({ cause: "proxy", proxy_name: "meno", voter_name: "cguitars" })
    );
    expect(container.querySelector(stillCounts)).toBe(null);

    mockChain = { proxyChain: [], witnessVotes: ["aliento"] };
    render(
      vote({ cause: "proxy", proxy_name: "meno", voter_name: "cguitars" })
    );
    expect(container.querySelector(stillCounts)).toBe(null);

    // meno has a proxy of its own: its proxy votes for aliento, meno doesn't.
    mockChain = { proxyChain: ["meno", "other"], witnessVotes: ["aliento"] };
    render(
      vote({ cause: "proxy", proxy_name: "meno", voter_name: "cguitars" })
    );
    expect(container.querySelector(stillCounts)).toBe(null);
  });
});

describe("translations", () => {
  const dir = path.join(__dirname, "../../i18n");
  const locales = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

  it("every locale has the reason texts and keeps the placeholders", () => {
    expect(locales).toContain("en.json");
    for (const file of locales) {
      const strings = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      for (const cause of ["votes_removed", "proxy", "expired", "declined"]) {
        expect(strings[`votesHistoryDialog.cause.${cause}`]).toBeTruthy();
        expect(
          strings[`votesHistoryDialog.causeTooltip.${cause}`]
        ).toBeTruthy();
      }
      const stillCounts =
        strings["votesHistoryDialog.causeTooltip.proxyStillCounts"];
      for (const name of ["{{voter}}", "{{proxy}}", "{{witness}}"])
        expect(stillCounts).toContain(name);
    }
  });
});
