/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "require", "default"]}
 */
import { restoreEnv, setDeployEnv } from "./support/deployEnv";

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
  };

  const withFakeChain = (settings: Record<string, string>) => {
    const service = load<{ default: Record<string, unknown> }>(
      "@/services/FetchingService",
      settings
    ).default;
    service.extendedHiveChain = { restApi: { "haf-stats-api": statsApi } };
    return service as unknown as {
      getWitnessMissedBlocks: (p: object) => Promise<unknown>;
      getGovernanceInfluenceConcentration: () => Promise<unknown>;
    };
  };

  beforeEach(() => {
    statsApi.witnessMissedBlocks.mockClear();
    statsApi.governanceInfluenceConcentration.mockClear();
  });
  afterEach(restoreEnv);

  it("are refused in classic mode without reaching the API", async () => {
    const service = withFakeChain({ EXPLORER_MODE: "classic" });
    const { EndpointUnsupportedError } = require("@/utils/nodeSupport");
    await expect(service.getWitnessMissedBlocks({})).rejects.toBeInstanceOf(
      EndpointUnsupportedError
    );
    // Not wrapped in the node-support helper, so it relies on the guard alone.
    await expect(
      service.getGovernanceInfluenceConcentration()
    ).rejects.toBeInstanceOf(EndpointUnsupportedError);
    expect(statsApi.witnessMissedBlocks).not.toHaveBeenCalled();
    expect(statsApi.governanceInfluenceConcentration).not.toHaveBeenCalled();
  });

  it("go through in full mode", async () => {
    const service = withFakeChain({});
    await service.getWitnessMissedBlocks({});
    await service.getGovernanceInfluenceConcentration();
    expect(statsApi.witnessMissedBlocks).toHaveBeenCalledTimes(1);
    expect(statsApi.governanceInfluenceConcentration).toHaveBeenCalledTimes(1);
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
