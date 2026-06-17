import env from "@beam-australia/react-env";

export const config = {
  nodeAddress: `${
    env("HIVE_BLOG_API_ADDRESS")
      ? env("HIVE_BLOG_API_ADDRESS")
      : "https://api.hive.blog"
  }`,
  apiAddress: `${
    env("API_ADDRESS") ? env("API_ADDRESS") : "https://api.hive.blog"
  }`,
  baseMomentTimeFormat: "YYYY/MM/DD HH:mm:ss UTC",
  momentLocaleDateFormat: "MMM D, YYYY",
  gitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
  get lastCommitHashRepoUrl() {
    return `https://gitlab.syncad.com/hive/block_explorer_ui/-/commit/${this.gitHash}`;
  },
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  expandedPaginationSize: 20000,
  proposalVotesSize: 500,
  blockPagePaginationSize: 2000, // Temporary 2000 until cache problem solved
  witnessesPerPages: {
    witnesses: 200,
    home: 20,
  },
  topHolders: {
    totalCount: 2000, // Total number of top holders
    pageSize: 100, // Page size for pagination
  },
  maxWitnessVotes: 30,
  inactiveWitnessKey: "STM1111111111111111111111111111111114T1Anm",
  maxDelegatorsCount: 1000,
  mainRefreshInterval: 3000,
  accountRefreshInterval: 20000,
  marketHistoryRefreshInterval: 60000,
  lastBlocksForWidget: 20,
  firstBlockTime: "2016-03-24T16:05:00",
  popularCommunitiesCount: 10,
  precisions: {
    vests: 6,
    hivePower: 3,
    percentage: 2,
  },
  liveblockSecurityDifference: 10,
  operationPerspective: {
    incoming: "incoming",
    outgoing: "outgoing",
  },
  maxProxyDepth: 3,
  compactViewPercentage: "80%",
  fullViewPercentage: "98%",
  defaultNodeProviders: [
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://anyx.io",
    "https://rpc.ausbit.dev",
    "https://rpc.mahdiyari.info",
    "https://techcoderx.com",
    "https://hive.roelandp.nl",
    "https://hived.emre.sh",
    "https://api.deathwing.me",
    "https://api.c0ff33a.uk",
    "https://hive-api.arcange.eu",
    "https://hive-api.3speak.tv",
    "https://hiveapi.actifit.io",
  ],
  defaultRestApiProvicers: [
    "https://hiveapi.actifit.io",
    "https://techcoderx.com",
    "https://api.hive.blog",
    "https://hafbe.openhive.network",
  ],
  hivesigner: {
    // The Hive account name that owns the app
    app: process.env.NEXT_PUBLIC_HIVESIGNER_APP,
    defaultCallBack: process.env.NEXT_PUBLIC_HIVESIGNER_CALLBACK as string,
    scope: [
      "vote",
      "comment",
      "custom_json",
      "claim_reward_balance",
      "update_proposal_votes",
    ],
    endpoints: {
      baseUrl: "https://hivesigner.com",
      authorize: "https://hivesigner.com/oauth2/authorize",
      token: "https://hivesigner.com/api/oauth2/token",
      broadcast: "https://hivesigner.com/api/broadcast",
    },
  },
  workspaceSync: {
    // Key used inside posting_json_metadata to store the workspace bundle.
    // WARNING: changing this key will break restore for any user who synced
    // under the old key — their blockchain data becomes unreachable.
    metadataKey: "hivescan_workspace",
    // Maximum compressed bundle size before the user is warned and sync is blocked.
    sizeLimitBytes: 40 * 1024,
    // Increment when the bundle schema changes in a breaking way.
    bundleVersion: 1,
    // localStorage key for app-wide settings (not per-user).
    settingsStorageKey: "app-settings",
  },
  security: {
    keychainTimeout: 60000,
    nodeTimeout: 8000,
    sessionMaxAge: 604800,
    rateLimits: {
      interval: 60000, // 1 minute
      maxTrackedIps: 1000, // How many unique IPs to keep in memory
      loginLimit: 5, // Attempts per interval
      broadcastLimit: 30, // Actions per interval
      workspaceLimit: 20, // Encrypt/decrypt calls per interval
      challengeLimit: 10, // Challenge token requests per interval
    },
    // Whitelist for /api/auth/broadcast. Active-key ops route through the
    // Hivesigner sign page client-side, not this endpoint.
    allowedOperations: [
      "vote",
      "claim_reward_balance",
      "custom_json",
      "update_proposal_votes",
    ],
  },
};

/**
 * Validates Hivesigner env vars. Caller-driven (not module-load) so Next.js
 * build workers and unrelated SSR pages don't repeat the warnings. Call
 * from the auth API handler at request time; the once-per-process guard
 * suppresses repeats within a server worker.
 */
export function validateHivesignerEnv() {
  if (typeof window !== "undefined") return;
  const g = globalThis as Record<string, unknown>;
  if (g.__hivesignerEnvValidated__) return;
  g.__hivesignerEnvValidated__ = true;

  const publicApp = process.env.NEXT_PUBLIC_HIVESIGNER_APP;
  const serverApp = process.env.HIVESIGNER_APP;
  const secret = process.env.HIVESIGNER_SECRET;

  const warn = (msg: string) => console.warn(`[hivesigner-env] ${msg}`);
  if (!publicApp)
    warn("NEXT_PUBLIC_HIVESIGNER_APP not set — client login UI will be broken");
  if (!serverApp)
    warn("HIVESIGNER_APP not set — server token exchange will fail");
  if (!secret)
    warn("HIVESIGNER_SECRET not set — server token exchange will fail");
  if (publicApp && serverApp && publicApp !== serverApp) {
    warn(
      `mismatch: NEXT_PUBLIC_HIVESIGNER_APP="${publicApp}" but HIVESIGNER_APP="${serverApp}"`
    );
  }
}
