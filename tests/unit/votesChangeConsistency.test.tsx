/**
 * @jest-environment jsdom
 */
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import fs from "fs";
import path from "path";
import {
  VotesChangeBadge,
  formatAsOfTime,
  todayVotesChange,
  votesChangeExportColumns,
} from "@/components/Witnesses/VotesChange";
import TopWitnessesCard from "@/components/home/TopWitnessesCard";
import Hive from "@/types/Hive";

// lucide-react ships ESM only, which Jest doesn't transform; the icons don't matter here.
jest.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      { get: (_target, name) => (name === "__esModule" ? false : () => null) }
    )
);

// The tooltip's content is rendered inline, so the test can read it without hovering.
jest.mock("@/components/ui/hybrid-tooltip", () => {
  const Pass = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return {
    Tooltip: Pass,
    TooltipTrigger: Pass,
    TooltipPortal: Pass,
    TooltipProvider: Pass,
    TooltipContent: Pass,
  };
});

// t() returns the key followed by its options, so the test sees which text is used.
jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({
    locale: "en",
    t: (key: string, options?: Record<string, string>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}));

// The as-of block's time, as the block endpoint returns it; null = not loaded.
let mockBlockCreatedAt: string | null = null;
jest.mock("@/hooks/api/blockPage/useBlockData", () => () => ({
  blockDetails: mockBlockCreatedAt ? { created_at: mockBlockCreatedAt } : null,
}));

jest.mock("@/components/ui/HiveAvatar", () => () => null);
jest.mock("@/components/ui/CardHeaderWithLink", () => () => null);
jest.mock("@/contexts/HiveChainContext", () => ({
  useHiveChainContext: () => ({ hiveChain: {} }),
}));
jest.mock("@/hooks/api/homePage/useDynamicGlobal", () => () => ({
  dynamicGlobalData: {
    headBlockDetails: {
      rawTotalVestingFundHive: "1",
      rawTotalVestingShares: "1",
    },
  },
}));
// 1 HP per 1,000,000 VESTS. wax's formatter misplaces the decimal point of a
// negative amount, so the card must pass only unsigned amounts: this one throws.
jest.mock("@/utils/Calculations", () => ({
  convertVestsToHP: (_chain: unknown, vests: string) => {
    if (String(vests).startsWith("-"))
      throw new Error(`signed amount reached the formatter: ${vests}`);
    return `${(Number(vests) / 1_000_000).toFixed(3)} HP`;
  },
}));

const window_ = (
  overrides: Partial<Hive.WitnessVotesChangeWindow>
): Hive.WitnessVotesChangeWindow => ({
  total: "0",
  voters: 0,
  rank_start: 1,
  votes_cast: "0",
  votes_removed: "0",
  power_down: "0",
  power_up: "0",
  producer_reward: "0",
  claimed_reward: "0",
  proxy: "0",
  expired: "0",
  declined: "0",
  ...overrides,
});

const breakdown = (
  today: Partial<Hive.WitnessVotesChangeWindow>
): Hive.WitnessVotesChangeBreakdown => ({
  as_of_block: 100,
  today: window_(today),
  "7d": window_({}),
});

const toHp = (vests: string) => `${vests} VESTS`;

describe("votes change: one figure everywhere", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderBadge = (b: Hive.WitnessVotesChangeBreakdown) =>
    act(() => {
      root.render(
        <VotesChangeBadge
          window="today"
          breakdown={b}
          selection="total"
          toHp={toHp}
        />
      );
    });

  const note = () =>
    container.querySelector('[data-testid="votes-change-drops"]')?.textContent;

  it("explains where the history's removals went whenever voters moved the witness", () => {
    for (const cause of ["proxy", "expired", "declined"] as const) {
      renderBadge(breakdown({ total: "-5", voters: 2, [cause]: "-5" }));
      expect(note()).toBe("witnesses.votesChangeDropsNote");
    }
    // Accounts that moved to a proxy who votes the witness: the history shows
    // removals, but every cause nets to 0. The note matters most here.
    renderBadge(breakdown({ total: "0", voters: 5 }));
    expect(note()).toBe("witnesses.votesChangeDropsNote");
    expect(container.textContent).toContain("witnesses.votesChangeNone");
  });

  it("states when the breakdown was computed, so newer votes are recognisable", () => {
    const asOf = () =>
      container.querySelector('[data-testid="votes-change-as-of"]')
        ?.textContent;
    // Not looked up yet (or failed): the block number alone.
    mockBlockCreatedAt = null;
    renderBadge(breakdown({ total: "-5", voters: 1, expired: "-5" }));
    expect(asOf()).toBe('witnesses.votesChangeAsOf {"block":"100"}');
    // The chain's zoneless time is UTC.
    mockBlockCreatedAt = "2020-01-02T21:35:00";
    renderBadge(breakdown({ total: "-5", voters: 1, expired: "-5" }));
    expect(asOf()).toBe(
      'witnesses.votesChangeAsOfTime {"time":"2020/01/02 21:35 UTC","block":"100"}'
    );
    mockBlockCreatedAt = null;
  });

  it("formats the as-of time without the date when it is today (UTC)", () => {
    const now = new Date(Date.UTC(2026, 10, 19, 23, 50));
    expect(formatAsOfTime(new Date(Date.UTC(2026, 10, 19, 21, 35)), now)).toBe(
      "21:35 UTC"
    );
    expect(formatAsOfTime(new Date(Date.UTC(2026, 10, 18, 23, 59)), now)).toBe(
      "2026/11/18 23:59 UTC"
    );
  });

  it("leaves the note out when no voter moved the witness", () => {
    renderBadge(breakdown({ total: "0", voters: 0 }));
    expect(note()).toBeUndefined();
  });

  it("states the voter count without a plural form", () => {
    renderBadge(breakdown({ total: "-5", voters: 301, proxy: "-5" }));
    expect(container.textContent).toContain(
      'witnesses.votesChangeVoters {"count":"301"}'
    );
  });

  it("words the voter count without a (s)-style plural in every locale", () => {
    const dir = path.join(__dirname, "../../i18n");
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const dict = JSON.parse(
        fs.readFileSync(path.join(dir, file), "utf8").replace(/^﻿/, "")
      );
      const text: string = dict["witnesses.votesChangeVoters"];
      expect(text).toContain("{{count}}");
      expect(text).not.toMatch(/\([a-z]+\)|\/i\b/);
      expect(dict["witnesses.votesChangeDropsNote"]).toBeTruthy();
    }
  });

  it("takes today's change from the breakdown total, falling back to votes_daily_change", () => {
    expect(
      todayVotesChange({
        votes_daily_change: "-36537151733969",
        votes_change_breakdown: breakdown({ total: "-52826894153469" }),
      })
    ).toBe("-52826894153469");
    expect(
      todayVotesChange({
        votes_daily_change: "-36537151733969",
        votes_change_breakdown: null,
      })
    ).toBe("-36537151733969");
    expect(todayVotesChange({})).toBe("0");
    // A real net change of 0 stays 0, not the old figure.
    expect(
      todayVotesChange({
        votes_daily_change: "-36537151733969",
        votes_change_breakdown: breakdown({ total: "0" }),
      })
    ).toBe("0");
  });

  it("shows the breakdown total on the home Top Witnesses card", () => {
    const witness = {
      witness_name: "aliento",
      rank: 54,
      vests: "21825915419747476",
      votes_daily_change: "-36537151733969",
      votes_change_breakdown: breakdown({ total: "-52826894153469" }),
    } as unknown as Hive.Witness;
    act(() => {
      root.render(
        <TopWitnessesCard
          witnessesData={{ witnesses: [witness] }}
          isLoading={false}
        />
      );
    });
    // -52,826,894 HP at 1 HP per 1M VESTS, not the old -36.5M. The figure is
    // a focusable button, so it reads without a mouse, and it says "today".
    const label = 'home.votesChangeToday {"change":"-52.8M HP"}';
    const change = container.querySelector(
      'button[data-testid="top-witness-votes-change"]'
    );
    expect(change?.getAttribute("aria-label")).toBe(label);
    expect(container.textContent).toContain(label);
  });

  describe("CSV columns", () => {
    const t = (key: string) => key;
    const hp = (vests: string) => `hp:${vests}`;
    const vests = (v: string) => `vests:${v}`;
    const total = "witnesses.votesChangeCause.total (witnesses.windowToday)";

    it("exports only the old change columns on a node without the breakdown", () => {
      expect(
        votesChangeExportColumns(
          { votes_daily_change: "-7" },
          false,
          t,
          hp,
          vests
        )
      ).toEqual({
        "witnesses.votesChange": "hp:-7",
        "common.vestsChange": "vests:-7",
      });
    });

    it("exports the cause columns, not the old ones, with the breakdown", () => {
      const columns = votesChangeExportColumns(
        {
          votes_daily_change: "-36537151733969",
          votes_change_breakdown: breakdown({
            total: "-52826894153469",
            proxy: "-59385631861256",
          }),
        },
        true,
        t,
        hp,
        vests
      );
      expect(columns).not.toHaveProperty("witnesses.votesChange");
      expect(columns).not.toHaveProperty("common.vestsChange");
      // Two windows, each with All causes and the nine causes.
      expect(Object.keys(columns)).toHaveLength(20);
      expect(columns[total]).toBe("hp:-52826894153469");
      expect(
        columns["witnesses.votesChangeCause.proxy (witnesses.windowToday)"]
      ).toBe("hp:-59385631861256");
    });

    it("keeps a not-yet-refreshed witness's figure under All causes (Today)", () => {
      const columns = votesChangeExportColumns(
        { votes_daily_change: "-7", votes_change_breakdown: null },
        true,
        t,
        hp,
        vests
      );
      expect(columns[total]).toBe("hp:-7");
      expect(
        columns["witnesses.votesChangeCause.proxy (witnesses.windowToday)"]
      ).toBe("");
    });
  });
});
