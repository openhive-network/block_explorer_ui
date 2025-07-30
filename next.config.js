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
      {
        protocol: 'https',
        hostname: 'files.steempeak.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'files.peakd.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.ecency.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.leofinance.io',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;