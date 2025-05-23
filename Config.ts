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
  gitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
  get lastCommitHashRepoUrl() {
    return `https://gitlab.syncad.com/hive/block_explorer_ui/-/commit/${this.gitHash}`;
  },
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  expandedPaginationSize: 20000,
  blockPagePaginationSize: 2000, // Temporary 2000 until cache problem solved
  witnessesPerPages: {
    witnesses: 200,
    home: 20,
  },
  maxWitnessVotes: 30,
  inactiveWitnessKey: "STM1111111111111111111111111111111114T1Anm",
  maxDelegatorsCount: 1000,
  mainRefreshInterval: 3000,
  accountRefreshInterval: 20000,
  marketHistoryRefreshInterval: 60000,
  lastBlocksForWidget: 20,
  firstBlockTime: "2016-03-24T16:05:00",
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
};
