/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "require", "default"]}
 */
import { restoreEnv, setDeployEnv } from "./support/deployEnv";

// Each case loads the app modules afresh, which is slow on a cold transform cache.
jest.setTimeout(30000);

// Classic mode must never contact haf-stats-api (#836).
jest.mock(
  "@hiveio/wax",
  () => ({
    WaxError: class WaxError extends Error {},
    WaxRequestAbortedByUser: class WaxRequestAbortedByUser extends Error {},
  }),
  { virtual: true }
);

const mockProbe = jest.fn();
jest.mock("@/utils/nodeSupport", () => ({
  ...jest.requireActual("@/utils/nodeSupport"),
  probeAppSupported: (...args: unknown[]) => mockProbe(...args),
}));
jest.mock("@/utils/ApiAddresses", () => () => ({
  apiAddress: "https://node.example",
}));
// The gate only needs a widget title; the full registry pulls in every widget.
jest.mock("@/components/dashboard/lib/widgetRegistry", () => ({
  WIDGET_REGISTRY: {},
}));
jest.mock("@/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// Loads the module from a fresh registry, so the settings are read again.
const load = <T,>(path: string, settings: Record<string, string>): T => {
  setDeployEnv(settings);
  jest.resetModules();
  return require(path);
};

describe("haf-stats-api calls", () => {
  const statsApi = {
    witnessMissedBlocks: jest.fn().mockResolvedValue([]),
    governanceInfluenceConcentration: jest.fn().mockResolvedValue([]),
    accountRcFootprintTimeline: jest.fn().mockResolvedValue([]),
  };
  type Service = Record<string, (...args: unknown[]) => Promise<unknown>>;
  // The first goes through the node-support wrapper; the other two skip it and
  // rely on the guard alone.
  const CALLS: [string, unknown[]][] = [
    ["getWitnessMissedBlocks", [{}]],
    ["getGovernanceInfluenceConcentration", []],
    ["getAccountRcFootprintTimeline", ["alice", {}]],
  ];

  const withFakeChain = (settings: Record<string, string>) => {
    const service = load<{ default: Record<string, unknown> }>(
      "@/services/FetchingService",
      settings
    ).default;
    service.extendedHiveChain = { restApi: { "haf-stats-api": statsApi } };
    return service as unknown as Service;
  };

  beforeEach(() => Object.values(statsApi).forEach((fn) => fn.mockClear()));
  afterEach(restoreEnv);

  it("are refused in classic mode without reaching the API", async () => {
    const service = withFakeChain({ EXPLORER_MODE: "classic" });
    const { AppDisabledError } = require("@/utils/nodeSupport");
    for (const [method, args] of CALLS) {
      await expect(service[method](...args)).rejects.toBeInstanceOf(
        AppDisabledError
      );
    }
    Object.values(statsApi).forEach((fn) => expect(fn).not.toHaveBeenCalled());
  });

  it("go through in full mode", async () => {
    const service = withFakeChain({});
    for (const [method, args] of CALLS) await service[method](...args);
    Object.values(statsApi).forEach((fn) =>
      expect(fn).toHaveBeenCalledTimes(1)
    );
  });
});

describe("widgets and reports that need haf-stats-api", () => {
  afterEach(restoreEnv);

  it("are left out in classic mode and kept in full mode", () => {
    const classic = load<typeof import("@/utils/deploySettings")>(
      "@/utils/deploySettings",
      { EXPLORER_MODE: "classic" }
    );
    expect(classic.isWidgetEnabled("daily-active-users")).toBe(false);
    expect(classic.isReportEnabled("financialSummary")).toBe(false);
    // Widgets on the core APIs stay.
    expect(classic.isWidgetEnabled("last-blocks")).toBe(true);
    expect(classic.isReportEnabled("influenceMap")).toBe(true);

    const full = load<typeof import("@/utils/deploySettings")>(
      "@/utils/deploySettings",
      {}
    );
    expect(full.isWidgetEnabled("daily-active-users")).toBe(true);
    expect(full.isReportEnabled("financialSummary")).toBe(true);
  });
});

describe("node support probe", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    mockProbe.mockReset().mockResolvedValue(true);
  });
  afterEach(restoreEnv);

  // Mounts the provider and returns what it says about haf-stats-api.
  const mount = async (settings: Record<string, string>) => {
    const { NodeSupportContextProvider, useNodeSupport } = load<
      typeof import("@/contexts/NodeSupportContext")
    >("@/contexts/NodeSupportContext", settings);
    const React = require("react");
    const { createRoot } = require("react-dom/client");
    let supported: boolean | undefined;
    const Probe = () => {
      supported = useNodeSupport().isSupported("haf-stats-api");
      return null;
    };
    const root = createRoot(document.createElement("div"));
    await React.act(async () => {
      root.render(
        React.createElement(
          NodeSupportContextProvider,
          null,
          React.createElement(Probe)
        )
      );
    });
    await React.act(async () => root.unmount());
    const probedApps = mockProbe.mock.calls.map(([, app]) => app);
    return { supported, probedApps };
  };

  it("never probes haf-stats-api in classic mode and reports it missing", async () => {
    const { supported, probedApps } = await mount({ EXPLORER_MODE: "classic" });
    expect(probedApps).not.toContain("haf-stats-api");
    expect(supported).toBe(false);
  });

  it("probes haf-stats-api in full mode", async () => {
    const { supported, probedApps } = await mount({});
    expect(probedApps).toContain("haf-stats-api");
    expect(supported).toBe(true);
  });
});

describe("widget gate", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    mockProbe.mockReset().mockResolvedValue(true);
  });
  afterEach(restoreEnv);

  // Renders a haf-stats widget behind the gate and returns the page text.
  const renderGated = async (settings: Record<string, string>) => {
    const { NodeSupportContextProvider } = load<
      typeof import("@/contexts/NodeSupportContext")
    >("@/contexts/NodeSupportContext", settings);
    const NodeSupportGate =
      require("@/components/dashboard/ui/NodeSupportGate").default;
    const React = require("react");
    const { createRoot } = require("react-dom/client");
    const container = document.createElement("div");
    const root = createRoot(container);
    await React.act(async () => {
      root.render(
        React.createElement(
          NodeSupportContextProvider,
          null,
          React.createElement(
            NodeSupportGate,
            { widgetId: "daily-active-users" },
            React.createElement("span", null, "widget body")
          )
        )
      );
    });
    const text = container.textContent;
    await React.act(async () => root.unmount());
    return text;
  };

  it("renders nothing in classic mode, not an unavailable card", async () => {
    expect(await renderGated({ EXPLORER_MODE: "classic" })).toBe("");
  });

  it("renders the widget in full mode on a node that has haf-stats-api", async () => {
    expect(await renderGated({})).toBe("widget body");
  });
});
