/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  generateBuildId: async () => {
    return 'build-id'
  },
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  // basePath is set at build time from NEXT_PUBLIC_BASE_PATH env variable
  // This allows building separate images for root (/) and subdirectory (/explorer) deployments
  basePath: basePath,
  // assetPrefix must match basePath for proper asset serving
  assetPrefix: basePath,
  publicRuntimeConfig: {
    basePath: basePath,
  },
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