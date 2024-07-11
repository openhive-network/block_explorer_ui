import env from "@beam-australia/react-env"

export const config = {
  nodeAddress: `${env('HIVE_BLOG_API_ADDRESS') ? env('HIVE_BLOG_API_ADDRESS') : 'https://api.hive.blog'}`,
  apiAddress: `${env('API_ADDRESS') ? env('API_ADDRESS') : 'https://hafbe.openhive.network/hafbe'}`,
  baseMomentTimeFormat: "YYYY/MM/DD HH:mm:ss UTC",
  gitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  expandedPaginationSize: 20000,
  blockPagePaginationSize: 2000, // Temporary 2000 until cache problem solved
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
