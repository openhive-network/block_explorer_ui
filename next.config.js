/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.hive.blog',
        pathname: '**',
      },
    ],
},
}

module.exports = nextConfig
