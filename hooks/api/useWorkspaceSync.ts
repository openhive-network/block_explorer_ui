import { useState, useCallback, useEffect } from "react";
import { Client } from "@hiveio/dhive";
import { config } from "@/Config";
import { useAuth } from "@/contexts/AuthContext";
import { SmartSigner } from "@/lib/smart-signer";
import {
  buildBundle,
  compressBundle,
  encryptBundle,
  isBundleOverLimit,
  saveLastSync,
  getInstanceMetadataKey,
  bundleFingerprint,
} from "@/utils/workspaceSync";
import { buildWorkspaceSyncSignUrl } from "@/lib/smart-signer/providers/hivesigner";

type SyncStatus = "idle" | "syncing" | "success" | "error" | "oversized";

interface UseWorkspaceSyncReturn {
  syncStatus: SyncStatus;
  syncWorkspace: () => Promise<void>;
  /** Compressed bundle size in bytes from the last sync attempt. null before first sync. */
  lastBundleBytes: number | null;
}

const hiveClient = new Client([config.nodeAddress]);

export function useWorkspaceSync(): UseWorkspaceSyncReturn {
  const { username, method } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastBundleBytes, setLastBundleBytes] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !username || method !== "hivesigner")
      return;

    // AuthContext.login() calls consumePendingHivesignerSync() before the cloud check,
    // which saves the fingerprint and leaves this result signal for us to read.
    const resultKey = `hivescan_workspace_sync_result_${username}`;
    const pendingResult = sessionStorage.getItem(resultKey);
    if (pendingResult) {
      sessionStorage.removeItem(resultKey);
      setSyncStatus(pendingResult as SyncStatus);
    }
  }, [username, method]);

  const syncWorkspace = useCallback(async () => {
    if (!username || !method) return;

    setSyncStatus("syncing");
    try {
      const bundle = buildBundle(username);
      if (!bundle) throw new Error("Failed to build workspace bundle");

      const compressed = await compressBundle(bundle);
      setLastBundleBytes(new Blob([compressed]).size);

      if (isBundleOverLimit(compressed)) {
        setSyncStatus("oversized");
        return;
      }

      const stored = await encryptBundle(compressed);

      // Fetch existing metadata to preserve other apps' data
      const [account] = await hiveClient.database.getAccounts([username]);
      let existingPostingMeta: Record<string, any> = {};
      if (account?.posting_json_metadata) {
        try {
          existingPostingMeta = JSON.parse(account.posting_json_metadata);
        } catch {
          // corrupt — start fresh
        }
      }

      // Remove old global key (pre-instance-specific naming) to avoid duplication
      const cleanedMeta = { ...existingPostingMeta };
      delete cleanedMeta["hivescan_workspace"];

      const newPostingMetaStr = JSON.stringify({
        ...cleanedMeta,
        [getInstanceMetadataKey()]: stored,
      });

      if (method === "keychain") {
        const opData = {
          account: username,
          json_metadata: "",
          posting_json_metadata: newPostingMetaStr,
          extensions: [],
        };
        await SmartSigner.broadcast(
          username,
          method,
          [["account_update2", opData]],
          "Posting"
        );
        saveLastSync(username, bundle);
        setSyncStatus("success");
      } else if (method === "hivesigner") {
        // Hivesigner: only update posting_json_metadata (omit json_metadata to keep URL short)
        const nonce = crypto.randomUUID();
        sessionStorage.setItem(
          `hivescan_workspace_sync_nonce_${username}`,
          nonce
        );
        sessionStorage.setItem(
          `hivescan_workspace_sync_fingerprint_${username}`,
          bundleFingerprint(bundle)
        );

        const opData = {
          account: username,
          posting_json_metadata: newPostingMetaStr,
          extensions: [] as [],
        };
        const callbackUrl = `${window.location.origin}${window.location.pathname}?sync_nonce=${nonce}`;
        window.location.href = buildWorkspaceSyncSignUrl(
          username,
          opData,
          callbackUrl
        );
      }
    } catch (err) {
      console.error("[WorkspaceSync] sync failed:", err);
      setSyncStatus("error");
    }
  }, [username, method]);

  return { syncStatus, syncWorkspace, lastBundleBytes };
}
