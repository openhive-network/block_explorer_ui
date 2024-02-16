/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  images: {
    domains: ['images.hive.blog'],
},
async rewrites() {
  return [
    {
      source: "/block/:blockId",
      destination: "/block/:blockId"
    },
    {
      source: '/comments/:accountName',
      destination: '/comments/:accountName',
    },
    {
      source: '/:accountName/:permlink',
      destination: '/comments/:accountName',
    },
  ]
},
}

module.exports = nextConfig
