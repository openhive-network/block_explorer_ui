/** @type {import('next').NextConfig} */
const { execSync } = require("child_process");

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The build id namespaces /_next/static/<id>/, which is served immutable for a
// year. It must change whenever the content does, or browsers keep a stale
// route manifest pointing at chunk files the new deploy has already deleted.
// helpers/versions.js writes NEXT_PUBLIC_COMMIT_HASH to .env.local before the
// build; the git call is a fallback in case env files load after this config.
const buildId = (() => {
  if (process.env.NEXT_PUBLIC_COMMIT_HASH)
    return process.env.NEXT_PUBLIC_COMMIT_HASH;
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return null; // let Next generate a unique id
  }
})();

const nextConfig = {
  generateBuildId: async () => buildId,
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
        protocol: "https",
        hostname: "images.hive.blog",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "files.steempeak.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "files.peakd.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.ecency.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.leofinance.io",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
