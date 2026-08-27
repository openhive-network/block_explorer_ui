import { config } from "@/Config";
import { getImageSrc } from "@/utils/PathUtils";

export function getHiveAvatarUrl(userName?: string): string {
  if (userName) {
    return `https://images.hive.blog/u/${userName}/avatar`;
  } else {
    return "";
  }
}

// Local copy of the placeholder images.hive.blog serves for accounts with no avatar.
export function getDefaultAvatarUrl(): string {
  return getImageSrc("/default-avatar.png");
}

// Both segments come off the API, so they are encoded rather than trusted.
export function getHivePostUrl(author?: string, permlink?: string): string {
  if (!author || !permlink) return "";
  return `${config.hiveFrontendUrl}/@${encodeURIComponent(
    author
  )}/${encodeURIComponent(permlink)}`;
}
