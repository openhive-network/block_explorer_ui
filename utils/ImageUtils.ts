// src/utils/imageUtils.ts

// This list matches the hostnames in next.config.js
const whitelistedDomains = [
  'images.hive.blog',
  'files.steempeak.com',
  'files.peakd.com',
  'images.ecency.com',
  'images.leofinance.io',
];

/**
 * Checks if a given image URL is from a whitelisted domain configured in next.config.js.
 * @param url The image URL to check.
 * @returns True if the URL's hostname is in the whitelist, false otherwise.
 */
export const isImageWhitelisted = (url: string | undefined | null): boolean => {
  if (!url) return false;

  try {
    const { hostname } = new URL(url);
    return whitelistedDomains.includes(hostname);
  } catch (error) {
    // Invalid URL format
    return false;
  }
};