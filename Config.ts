import env from "@beam-australia/react-env"

export const config = {
  hiveBlogAdress: "https://api.hive.blog",
  // apiAdress: process.env.NEXT_PUBLIC_API_ADDRESS ? process.env.NEXT_PUBLIC_API_ADDRESS : "http://192.168.4.250:3000",
  apiAdress: `${env('API_ADDRESS') ? env('API_ADDRESS') : 'http://192.168.4.250:3000'}`,
  baseMomentTimeFormat: "YYYY/MM/DD hh:mm:ss",
  opsBodyLimit: 100000,
  commentOperationsTypeIds: [0, 1, 17, 19, 51, 52, 53, 61, 63, 72, 73],
  standardPaginationSize: 100,
  witnessesPerPages: {
    witnesses: 200,
    home: 20
  }
}
