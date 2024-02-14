/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  images: {
    domains: ["images.hive.blog"],
  },
  async rewrites() {
    return [
      {
        source: "/comments/:accountName",
        destination: "/comments",
      },
      {
        source: "/block/:blockId",
        destination: "/block/:blockId",
      },
      {
        source: "/:accountName/:permlink",
        destination: "/comments",
      },
    ];
  },
};

module.exports = nextConfig;
