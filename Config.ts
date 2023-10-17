import env from "@beam-australia/react-env"

export const config = {
  hiveBlogAdress: "https://api.hive.blog",
  // apiAdress: process.env.NEXT_PUBLIC_API_ADDRESS ? process.env.NEXT_PUBLIC_API_ADDRESS : "http://192.168.4.250:3000",
  apiAdress: `${env('API_ADDRESS') ? env('API_ADDRESS') : 'http://192.168.4.250:3000'}`,
  baseMomentTimeFormat: "YYYY/MM/DD hh:mm:ss"
}
