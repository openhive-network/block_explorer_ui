import LZString from "lz-string";
import { AppSettings } from "@/contexts/SettingsContext";
import { Layouts } from "react-grid-layout";
import {
  getLayoutStorageKey,
  getWidgetsStorageKey,
  getWidgetStatesStorageKey,
  DEFAULT_WIDGETS,
  DEFAULT_MASTER_LAYOUT,
  generateDerivedLayouts,
} from "@/components/dashboard/lib/dashboard.config";
import { config } from "@/Config";

export const WORKSPACE_RESTORED_EVENT = "hivescan:workspace-restored";
export const WORKSPACE_CLOUD_DIFFERS_EVENT = "hivescan:workspace-cloud-differs";

// Each deployment (live site, localhost, custom instance) gets its own isolated
// workspace slot in posting_json_metadata. All localhost ports share one slot.
export function getInstanceMetadataKey(): string {
  if (typeof window === "undefined") return config.workspaceSync.metadataKey;
  const host = window.location.hostname;
  const normalized =
    host === "localhost" || host === "127.0.0.1" ? "localhost" : host;
  return `${config.workspaceSync.metadataKey}_${normalized}`;
}

const getLastSyncKey = (username: string) =>
  `hivescan_workspace_last_sync_${username}`;

// djb2 hash — fast sync fingerprint. Exclude widgetStates (UI state) from hash
// since expanded/collapsed state shouldn't trigger "unsynced" warning.
export function bundleFingerprint(bundle: WorkspaceBundle): string {
  // Strip only isCollapsed from each widget state — collapse/expand is UI-only and
  // shouldn't mark the workspace as unsynced. All other state (text, content, links,
  // url, backgroundColor, etc.) is meaningful and must be included in the hash.
  const strippedStates = Object.fromEntries(
    Object.entries(bundle.dashboard.widgetStates).map(([id, state]) => {
      const { isCollapsed: _ic, ...rest } =
        (state as Record<string, unknown>) || {};
      return [id, rest];
    })
  );
  const fingerprintBundle = {
    ...bundle,
    dashboard: {
      layout: bundle.dashboard.layout,
      widgets: bundle.dashboard.widgets,
      widgetStates: strippedStates,
    },
  };
  const json = JSON.stringify(fingerprintBundle);
  let hash = 5381;
  for (let i = 0; i < json.length; i++) {
    hash = ((hash << 5) + hash) ^ json.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

export function saveLastSync(username: string, bundle: WorkspaceBundle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getLastSyncKey(username), bundleFingerprint(bundle));
}

function getStoredFingerprint(username: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getLastSyncKey(username));
}

export function cloudMatchesLastSync(
  username: string,
  cloudBundle: WorkspaceBundle
): boolean {
  const stored = getStoredFingerprint(username);
  if (!stored) return false;
  return bundleFingerprint(cloudBundle) === stored;
}

export function hasLocalChanges(username: string): boolean {
  const stored = getStoredFingerprint(username);
  if (!stored) {
    // Never synced — treat as unsynced if local dashboard data exists
    return !!localStorage.getItem(getLayoutStorageKey(username));
  }
  const current = buildBundle(username);
  if (!current) return false;
  const currentFingerprint = bundleFingerprint(current);

  // If current local bundle matches last sync, user made no local changes
  // (even if cloud is different — that's a cloud-differs situation, not local-changes)
  return currentFingerprint !== stored;
}

const getWatchlistKey = (username: string) => `hivescan_watchlist_${username}`;
const getProposalChangesKey = (username: string) =>
  `hivescan_proposal_changes_${username}`;
const getWitnessHealthSortKey = (username: string) =>
  `witnessHealthSort_${username}`;

export interface WorkspaceBundle {
  version: number;
  theme: string;
  locale: string;
  settings: AppSettings;
  dashboard: {
    layout: Layouts;
    widgets: Array<{ i: string; type: string }>;
    widgetStates: Record<string, any>;
  };
  watchlist: Record<string, Array<number | string>>;
  proposalChanges: number[];
  witnessHealthSort: { key: string; dir: string } | null;
}

export function buildBundle(username: string): WorkspaceBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const settingsRaw = localStorage.getItem(
      config.workspaceSync.settingsStorageKey
    );
    const layoutRaw = localStorage.getItem(getLayoutStorageKey(username));
    const widgetsRaw = localStorage.getItem(getWidgetsStorageKey(username));
    const statesRaw = localStorage.getItem(getWidgetStatesStorageKey(username));
    const watchlistRaw = localStorage.getItem(getWatchlistKey(username));
    const proposalChangesRaw = localStorage.getItem(
      getProposalChangesKey(username)
    );
    const witnessHealthSortRaw = localStorage.getItem(
      getWitnessHealthSortKey(username)
    );

    return {
      version: config.workspaceSync.bundleVersion,
      theme: localStorage.getItem("theme") || "light",
      locale: localStorage.getItem("locale") || "en",
      settings: settingsRaw ? JSON.parse(settingsRaw) : {},
      dashboard: {
        // Fall back to hardcoded defaults when keys are absent (e.g. right after
        // "restore defaults" removes the keys before React re-saves them).
        layout: layoutRaw
          ? JSON.parse(layoutRaw)
          : generateDerivedLayouts(DEFAULT_MASTER_LAYOUT),
        widgets: widgetsRaw ? JSON.parse(widgetsRaw) : DEFAULT_WIDGETS,
        widgetStates: statesRaw ? JSON.parse(statesRaw) : {},
      },
      watchlist: watchlistRaw ? JSON.parse(watchlistRaw) : {},
      proposalChanges: proposalChangesRaw ? JSON.parse(proposalChangesRaw) : [],
      witnessHealthSort: witnessHealthSortRaw
        ? JSON.parse(witnessHealthSortRaw)
        : null,
    };
  } catch {
    return null;
  }
}

// Compressed strings prefixed with "D:" use native deflate-raw.
// Unprefixed strings are LZString (legacy or non-supporting browsers).
export async function compressBundle(bundle: WorkspaceBundle): Promise<string> {
  const json = JSON.stringify(bundle);
  if (typeof CompressionStream !== "undefined") {
    try {
      const stream = new Blob([json])
        .stream()
        .pipeThrough(new CompressionStream("deflate-raw"));
      const buf = await new Response(stream).arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(
          null,
          bytes.subarray(
            i,
            Math.min(i + CHUNK, bytes.length)
          ) as unknown as number[]
        );
      }
      return "D:" + btoa(binary);
    } catch {
      // fall through to LZString
    }
  }
  return LZString.compressToBase64(json);
}

export async function decompressBundle(
  compressed: string
): Promise<WorkspaceBundle | null> {
  try {
    if (
      compressed.startsWith("D:") &&
      typeof DecompressionStream !== "undefined"
    ) {
      const raw = atob(compressed.slice(2));
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const stream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream("deflate-raw"));
      const json = await new Response(stream).text();
      return JSON.parse(json) as WorkspaceBundle;
    }
    // LZString — legacy data from before migration, or browsers without CompressionStream
    const json = LZString.decompressFromBase64(compressed);
    if (!json) return null;
    return JSON.parse(json) as WorkspaceBundle;
  } catch {
    return null;
  }
}

// "ED:" = encrypted deflate bundle, "EL:" = encrypted LZString bundle (legacy browsers)
// Called during AuthContext.login() before the cloud-vs-local check so the
// fingerprint is in localStorage before cloudMatchesLastSync reads it.
export function consumePendingHivesignerSync(
  username: string
): "success" | "error" | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const returnedNonce = params.get("sync_nonce");
  if (!returnedNonce) return null;

  // Always clean the URL as soon as we see sync_nonce — never let it linger regardless of outcome.
  window.history.replaceState({}, document.title, window.location.pathname);

  const nonceKey = `hivescan_workspace_sync_nonce_${username}`;
  const expectedNonce = sessionStorage.getItem(nonceKey);
  if (!expectedNonce || returnedNonce !== expectedNonce) return null;

  sessionStorage.removeItem(nonceKey);

  if (params.get("error")) return "error";

  const fingerprintKey = `hivescan_workspace_sync_fingerprint_${username}`;
  const savedFingerprint = sessionStorage.getItem(fingerprintKey);
  if (savedFingerprint) {
    localStorage.setItem(
      `hivescan_workspace_last_sync_${username}`,
      savedFingerprint
    );
    sessionStorage.removeItem(fingerprintKey);
  }
  // Signal for useWorkspaceSync to pick up the outcome without re-processing the nonce
  sessionStorage.setItem(
    `hivescan_workspace_sync_result_${username}`,
    "success"
  );
  return "success";
}

export async function encryptBundle(compressed: string): Promise<string> {
  const isDFlate = compressed.startsWith("D:");
  // Strip the compression prefix so we encrypt raw bytes, not a re-encoded base64 string
  const rawBase64 = isDFlate ? compressed.slice(2) : compressed;
  const res = await fetch("/api/workspace/encrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: rawBase64 }),
  });
  if (!res.ok) {
    // Only fall back to plaintext when the server explicitly says no key is configured.
    // Any other failure (401 session expired, 429 rate-limited, 500 server error) means
    // encryption was expected but unavailable — abort so we never broadcast plaintext silently.
    const body = await res.json().catch(() => ({}));
    if (
      res.status === 400 &&
      (body as { error?: string }).error === "no_key_configured"
    )
      return compressed;
    throw new Error(`encrypt_failed_${res.status}`);
  }
  const { result } = await res.json();
  if (typeof result !== "string") throw new Error("encrypt_invalid_response");
  return (isDFlate ? "ED:" : "EL:") + result;
}

export async function decryptBundle(data: string): Promise<string> {
  const isED = data.startsWith("ED:");
  const isEL = data.startsWith("EL:");
  if (!isED && !isEL) return data;
  try {
    const res = await fetch("/api/workspace/decrypt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: data.slice(3) }),
    });
    if (!res.ok) return data;
    const { result } = await res.json();
    if (typeof result !== "string") return data;
    // Restore the original compression prefix
    return isED ? "D:" + result : result;
  } catch {
    return data;
  }
}

export function getBundleSizeBytes(compressed: string): number {
  return new Blob([compressed]).size;
}

export function isBundleOverLimit(compressed: string): boolean {
  return getBundleSizeBytes(compressed) > config.workspaceSync.sizeLimitBytes;
}

export function applyBundle(username: string, bundle: WorkspaceBundle): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("theme", bundle.theme);
  localStorage.setItem("locale", bundle.locale);
  // Synthetic StorageEvents so same-tab listeners in ThemeContext and i18n react
  // without those files needing to know about workspace sync.
  window.dispatchEvent(
    new StorageEvent("storage", { key: "theme", newValue: bundle.theme })
  );
  window.dispatchEvent(
    new StorageEvent("storage", { key: "locale", newValue: bundle.locale })
  );
  localStorage.setItem(
    config.workspaceSync.settingsStorageKey,
    JSON.stringify(bundle.settings)
  );
  localStorage.setItem(
    getLayoutStorageKey(username),
    JSON.stringify(bundle.dashboard.layout)
  );
  localStorage.setItem(
    getWidgetsStorageKey(username),
    JSON.stringify(bundle.dashboard.widgets)
  );
  localStorage.setItem(
    getWidgetStatesStorageKey(username),
    JSON.stringify(bundle.dashboard.widgetStates)
  );
  localStorage.setItem(
    getWatchlistKey(username),
    JSON.stringify(bundle.watchlist)
  );
  localStorage.setItem(
    getProposalChangesKey(username),
    JSON.stringify(bundle.proposalChanges)
  );
  if (bundle.witnessHealthSort) {
    localStorage.setItem(
      getWitnessHealthSortKey(username),
      JSON.stringify(bundle.witnessHealthSort)
    );
  } else {
    localStorage.removeItem(getWitnessHealthSortKey(username));
  }

  window.dispatchEvent(
    new CustomEvent(WORKSPACE_RESTORED_EVENT, { detail: { username } })
  );
}
