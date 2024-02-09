import env from "@beam-australia/react-env"

export const config = {
  nodeAddress: `${env('HIVE_BLOG_API_ADDRESS') ? env('HIVE_BLOG_API_ADDRESS') : 'https://api.hive.blog'}`,
  apiAddress: `${env('API_ADDRESS') ? env('API_ADDRESS') : 'https://hafbe.openhive.network/rpc'}`,
  baseMomentTimeFormat: "YYYY/MM/DD hh:mm:ss",
  gitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 52, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  livePaginationSize: 20,
  expandedPaginationSize: 20000,
  witnessesPerPages: {
    witnesses: 200,
    home: 20
  },
  lastBlocksForWidget: 20,
  firstBlockTime: "2016-03-24T16:05:00",
  precisions: {
    vests: 6,
    hivePower: 3,
    percentage: 2
  }
}
