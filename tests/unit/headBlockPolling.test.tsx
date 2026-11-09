/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "require", "default"]}
 */
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";

import { config } from "@/Config";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import ConvertedHiveTooltip from "@/components/ConvertedHiveTooltip";
import { useAggregatedVesting } from "@/components/home/hpMomentumUtils";
import useBlockchainSyncInfo from "@/hooks/common/useBlockchainSyncInfo";
import fetchingService from "@/services/FetchingService";

// With Live Data on, every new head block fans out into per-block requests.
// These tests count what one page asks the node for while it stays open.

jest.mock("@/services/FetchingService", () => ({
  __esModule: true,
  default: {
    getHafbeLastSyncedBlock: jest.fn(),
    getDynamicGlobalProperties: jest.fn(),
    getCurrentPriceFeed: jest.fn(),
    getRewardFunds: jest.fn(),
    getBlockGlobalState: jest.fn(),
    getHeadBlockNum: jest.fn(),
  },
}));

let mockLiveData = false;
const mockRouter = { pathname: "/@alice" };
const mockHiveChain = {};

jest.mock("@/contexts/SettingsContext", () => ({
  useSettings: () => ({ settings: { liveData: mockLiveData } }),
}));
jest.mock("next/router", () => ({ useRouter: () => mockRouter }));
jest.mock("@/contexts/HiveChainContext", () => ({
  useHiveChainContext: () => ({ hiveChain: mockHiveChain }),
}));
// The conversion itself is not under test here, only what it fetches.
jest.mock("@/utils/QueryDataSelectors", () => ({
  adjustDynamicGlobalBlockData: () => ({
    headBlockDetails: { rawTotalVestingFundHive: 1, rawTotalVestingShares: 1 },
  }),
}));
jest.mock("@/utils/Calculations", () => ({
  convertVestsToHP: () => "0.624 HP",
  computeVestingRatios: () => ({ hivePerVests: 0.0006, vestsPerHive: 1666 }),
}));
jest.mock("@/components/HiveTooltip", () => ({
  __esModule: true,
  default: ({ tooltipContent }: { tooltipContent: string }) => tooltipContent,
}));

const service = fetchingService as unknown as Record<string, jest.Mock>;
const INTERVAL = config.mainRefreshInterval;

const calls = (method: string) => service[method].mock.calls.length;

const advance = async (ms: number) => {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });
};

describe("head block polling", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;

  const render = async (children: React.ReactNode) => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <HeadBlockContextProvider>{children}</HeadBlockContextProvider>
        </QueryClientProvider>
      );
    });
    await advance(0);
  };

  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    let head = 100_000_000;
    Object.values(service).forEach((fn) => fn.mockReset());
    // A new block on every poll, as on a live chain.
    service.getHafbeLastSyncedBlock.mockImplementation(async () => ++head);
    service.getDynamicGlobalProperties.mockResolvedValue({
      head_block_number: head,
      time: "2026-11-09T12:00:00",
    });
    service.getCurrentPriceFeed.mockResolvedValue({});
    service.getRewardFunds.mockResolvedValue({ funds: [] });
    service.getBlockGlobalState.mockResolvedValue({
      created_at: "2026-11-09T12:00:00",
    });
    // Same defaults as components/providers.tsx, minus retries.
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 10000, refetchOnWindowFocus: false, retry: false },
      },
    });
    container = document.createElement("div");
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    queryClient.clear();
    focusManager.setFocused(undefined);
    jest.useRealTimers();
  });

  it("polls the head block while the tab is visible, not while it is hidden", async () => {
    mockLiveData = true;
    await render(null);

    const visibleStart = calls("getHafbeLastSyncedBlock");
    await advance(INTERVAL * 3);
    expect(calls("getHafbeLastSyncedBlock") - visibleStart).toBe(3);

    act(() => focusManager.setFocused(false));
    const hiddenStart = calls("getHafbeLastSyncedBlock");
    await advance(INTERVAL * 10);
    expect(calls("getHafbeLastSyncedBlock")).toBe(hiddenStart);

    // Shown again: catches up at once (the navbar's chain head does too), then
    // keeps the interval.
    act(() => focusManager.setFocused(true));
    await advance(0);
    expect(calls("getHafbeLastSyncedBlock")).toBe(hiddenStart + 1);
    await advance(INTERVAL);
    expect(calls("getHafbeLastSyncedBlock")).toBe(hiddenStart + 2);
  });

  it("leaves the head block alone with Live Data off, also when the tab is shown again", async () => {
    mockLiveData = false;
    await render(null);
    const start = calls("getHafbeLastSyncedBlock");
    expect(start).toBeGreaterThan(0);

    await advance(INTERVAL * 5);
    act(() => focusManager.setFocused(false));
    await advance(INTERVAL * 5);
    act(() => focusManager.setFocused(true));
    await advance(INTERVAL);
    expect(calls("getHafbeLastSyncedBlock")).toBe(start);
  });

  it("does not refetch the globals for a VESTS tooltip on every new block", async () => {
    mockLiveData = true;
    const tooltip = (key: string) => (
      <ConvertedHiveTooltip
        key={key}
        tooltipTrigger="1,000,000.000000 VESTS"
        supply={{ amount: "1000000000000", precision: 6, nai: "@@000000037" }}
      />
    );
    await render([tooltip("a")]);
    expect(container.textContent).toBe("0.624 HP");

    const blocksStart = calls("getHafbeLastSyncedBlock");
    await advance(INTERVAL * 5);
    expect(calls("getHafbeLastSyncedBlock") - blocksStart).toBe(5);

    // A row mounted later (past the app's 10 s default staleTime), as in a
    // list that grows with each block, reuses the same globals.
    await render([tooltip("a"), tooltip("b")]);
    expect(calls("getDynamicGlobalProperties")).toBe(1);
    expect(calls("getCurrentPriceFeed")).toBe(1);
    expect(calls("getRewardFunds")).toBe(1);
    expect(container.textContent).toBe("0.624 HP0.624 HP");
  });

  it("does not refetch the globals for a vesting chart on every new block", async () => {
    mockLiveData = true;
    let isReady = false;
    const Probe: React.FC = () => {
      isReady = useAggregatedVesting([], "hp").isReady;
      return null;
    };
    await render([<Probe key="a" />]);
    expect(isReady).toBe(true);

    const blocksStart = calls("getHafbeLastSyncedBlock");
    await advance(INTERVAL * 5);
    expect(calls("getHafbeLastSyncedBlock") - blocksStart).toBe(5);
    await render([<Probe key="a" />, <Probe key="b" />]);
    expect(calls("getDynamicGlobalProperties")).toBe(1);
    expect(isReady).toBe(true);
  });

  it("fetches the synced block's time only while the sync dialog is open", async () => {
    mockLiveData = true;
    let explorerTime: number | undefined;
    const Probe: React.FC<{ open: boolean }> = ({ open }) => {
      explorerTime = useBlockchainSyncInfo(open).explorerTime;
      return null;
    };

    await render(<Probe open={false} />);
    await advance(INTERVAL * 5);
    expect(calls("getBlockGlobalState")).toBe(0);
    expect(explorerTime).toBeUndefined();

    await render(<Probe open={true} />);
    expect(calls("getBlockGlobalState")).toBe(1);
    expect(explorerTime).toEqual(expect.any(Number));
  });
});
