import env from "@beam-australia/react-env"

export const config = {
  hiveBlogAddress: `${env('HIVE_BLOG_API_ADDRESS') ? env('HIVE_BLOG_API_ADDRESS') : 'https://api.hive.blog'}`,
  apiAddress: `${env('API_ADDRESS') ? env('API_ADDRESS') : 'http://192.168.4.250:3000'}`,
  baseMomentTimeFormat: "YYYY/MM/DD hh:mm:ss",
  gitHash: process.env.NEXT_PUBLIC_COMMIT_HASH,
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 52, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  witnessesPerPages: {
    witnesses: 200,
    home: 20
  },
  lastBlocksForWidget: 20,
  firstBlockTime: "2016-03-24T16:05:00"
}
