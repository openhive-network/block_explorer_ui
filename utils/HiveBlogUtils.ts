import { config } from "@/Config";

export function getHiveAvatarUrl(userName?: string): string {
  if (userName) {
    return `https://images.hive.blog/u/${userName}/avatar`;
  } else {
    return "";
  }
}

// Both segments come off the API, so they are encoded rather than trusted.
export function getHivePostUrl(author?: string, permlink?: string): string {
  if (!author || !permlink) return "";
  return `${config.hiveFrontendUrl}/@${encodeURIComponent(
    author
  )}/${encodeURIComponent(permlink)}`;
}
