import { Client } from "@hiveio/dhive";
import { config } from "@/Config";
import {
  WorkspaceBundle,
  WORKSPACE_CLOUD_DIFFERS_EVENT,
  decompressBundle,
  decryptBundle,
  getInstanceMetadataKey,
} from "@/utils/workspaceSync";

const hiveClient = new Client([config.nodeAddress]);

export type CloudFetchResult =
  | { status: "found"; bundle: WorkspaceBundle; compressed: string }
  | { status: "none" }
  | { status: "error" };

// AuthContext does this same read inline at login; this is the on-demand path,
// for a user asking from the menu rather than being offered it.
export async function fetchCloudBundle(
  username: string
): Promise<CloudFetchResult> {
  try {
    const [account] = await hiveClient.database.getAccounts([username]);
    const rawMeta = account?.posting_json_metadata;
    if (!rawMeta) return { status: "none" };

    const meta = JSON.parse(rawMeta);
    const compressed = meta[getInstanceMetadataKey()];
    if (!compressed) return { status: "none" };

    const bundle = await decompressBundle(await decryptBundle(compressed));
    return bundle
      ? { status: "found", bundle, compressed }
      : { status: "error" };
  } catch {
    // Unreachable node, corrupt metadata, or a bundle this build cannot read.
    return { status: "error" };
  }
}

// `immediate` marks a deliberate request, which the prompt shows straight away
// rather than holding until the dashboard.
export function requestWorkspaceRestore(
  username: string,
  result: Extract<CloudFetchResult, { status: "found" }>
): void {
  window.dispatchEvent(
    new CustomEvent(WORKSPACE_CLOUD_DIFFERS_EVENT, {
      detail: {
        bundle: result.bundle,
        username,
        compressed: result.compressed,
        immediate: true,
      },
    })
  );
}
