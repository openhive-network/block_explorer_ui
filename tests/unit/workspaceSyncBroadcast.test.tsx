/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions": ["node", "require", "default"]}
 */
import { restoreEnv, setDeployEnv } from "./support/deployEnv";

const mockBroadcast = jest.fn();
const mockGetAccount = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ username: "alice", method: "keychain" }),
}));
jest.mock("@/lib/smart-signer", () => ({
  SmartSigner: { broadcast: (...args: unknown[]) => mockBroadcast(...args) },
}));
jest.mock("@/lib/smart-signer/providers/hivesigner", () => ({
  buildWorkspaceSyncSignUrl: jest.fn(),
}));
jest.mock("@/utils/waxClient", () => ({
  getAccount: (...args: unknown[]) => mockGetAccount(...args),
}));

// Renders the hook from a fresh module registry, so the settings are read again.
const runSync = async (settings: Record<string, string>) => {
  setDeployEnv(settings);
  jest.resetModules();
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const { useWorkspaceSync } = require("@/hooks/api/useWorkspaceSync");
  let sync: () => Promise<void> = async () => {};
  const Probe = () => {
    sync = useWorkspaceSync().syncWorkspace;
    return null;
  };
  const root = createRoot(document.createElement("div"));
  await React.act(async () => {
    root.render(React.createElement(Probe));
  });
  await React.act(async () => {
    await sync();
  });
  await React.act(async () => root.unmount());
};

describe("workspace sync broadcast", () => {
  beforeEach(() => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
    mockBroadcast.mockReset().mockResolvedValue({ success: true });
    mockGetAccount.mockReset().mockResolvedValue({ posting_json_metadata: "{}" });
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "no_key_configured" }),
    }) as unknown as typeof fetch;
    localStorage.clear();
  });
  afterEach(restoreEnv);

  it("broadcasts nothing when sync is off", async () => {
    await runSync({ DASHBOARD_SYNC: "false" });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockGetAccount).not.toHaveBeenCalled();
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it("broadcasts nothing when the dashboard is off", async () => {
    await runSync({ DASHBOARD: "false" });
    expect(mockBroadcast).not.toHaveBeenCalled();
  });

  it("broadcasts when sync is on", async () => {
    await runSync({});
    expect(mockBroadcast).toHaveBeenCalledTimes(1);
  });
});
