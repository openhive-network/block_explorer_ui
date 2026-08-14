import Hive from "@/types/Hive";
import { config } from "@/Config";

// A prolific author fills a whole "blog" page with own posts, so one page of 20
// often yields no reblogs. Walk back a few, bounded so it can't become a crawl.
export const REBLOG_PAGE_CAP = 3;

export interface ReblogCursor {
  author: string;
  permlink: string;
}

export interface ContentFeed {
  entries: Hive.AccountPostSummary[];
  /** Gave up at the page cap with the list unfilled: older reblogs may exist. */
  truncated: boolean;
  /** Entries actually inspected: short of pageCap * pageSize, so it is counted. */
  scanned: number;
}

// Kept free of any service import so it stays unit-testable: the caller passes
// the page fetcher in.
export async function collectReblogs(
  fetchPage: (cursor?: ReblogCursor) => Promise<Hive.AccountPostSummary[]>,
  limit: number,
  pageCap: number = REBLOG_PAGE_CAP,
  pageSize: number = config.bridgePageMax
): Promise<ContentFeed> {
  const reblogs: Hive.AccountPostSummary[] = [];
  let cursor: ReblogCursor | undefined;
  let scanned = 0;

  for (let page = 0; page < pageCap; page++) {
    const batch = await fetchPage(cursor);
    if (!batch?.length) return { entries: reblogs, truncated: false, scanned };

    // bridge echoes the cursor entry back as the first row of the next page.
    const fresh = cursor ? batch.slice(1) : batch;
    scanned += fresh.length;
    reblogs.push(...fresh.filter((item) => item.reblogged_by?.length));

    if (reblogs.length >= limit) {
      return { entries: reblogs.slice(0, limit), truncated: false, scanned };
    }
    // A short page is the end of the blog, so the list is complete rather than
    // cut off — there is nothing older to miss.
    if (batch.length < pageSize) {
      return { entries: reblogs, truncated: false, scanned };
    }

    const last = fresh[fresh.length - 1];
    if (!last?.permlink) break;
    cursor = { author: last.author, permlink: last.permlink };
  }

  return { entries: reblogs, truncated: true, scanned };
}
