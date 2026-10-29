import { config } from "@/Config";
import { getImageSrc } from "@/utils/PathUtils";

export function getHiveAvatarUrl(userName?: string): string {
  if (userName) {
    return `https://images.hive.blog/u/${userName}/avatar`;
  } else {
    return "";
  }
}

// imagehoster serves a default cover when the account has none; see hasHiveCover.
export function getHiveCoverUrl(userName: string): string {
  return `https://images.hive.blog/u/${encodeURIComponent(userName)}/cover`;
}

const parseMetadata = (raw?: string) => {
  try {
    return JSON.parse(raw ?? "");
  } catch {
    return null;
  }
};

// Mirrors imagehoster: posting_json_metadata when its profile has a version,
// otherwise json_metadata, and only an http(s) cover_image counts.
export function hasHiveCover(account: {
  posting_json_metadata?: string;
  json_metadata?: string;
}): boolean {
  const posting = parseMetadata(account.posting_json_metadata);
  const metadata = posting?.profile?.version
    ? posting
    : parseMetadata(account.json_metadata);
  const cover = metadata?.profile?.cover_image;
  return typeof cover === "string" && /^https?:\/\//i.test(cover);
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
