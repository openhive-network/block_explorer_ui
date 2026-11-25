import { isHiveAccountName, trimAccountName } from "@/utils/StringUtils";
import { naiAssetToFloat } from "@/utils/Calculations";
import { parseChainDate } from "@/utils/TimeUtils";

// The most names one lookup takes. A thousand comes back in a few seconds
// (find_accounts and bridge.get_profiles, 100 names a request).
export const MAX_NAMES = 1000;
export const BATCH_SIZE = 100;

export interface ParsedNames {
  // Valid, distinct names in the order given, at most MAX_NAMES.
  names: string[];
  // Entries that can't be Hive account names, as typed.
  invalid: string[];
  // How many valid names were left out past MAX_NAMES.
  overLimit: number;
}

// One name per line, or separated by commas, semicolons or spaces, with or
// without the @. Account names are lower case on chain, so "Alice" is alice.
export const parseAccountList = (text: string): ParsedNames => {
  const seen = new Set<string>();
  const names: string[] = [];
  const invalid: string[] = [];
  let overLimit = 0;
  for (const entry of text.split(/[\s,;]+/)) {
    const name = trimAccountName(entry).toLowerCase();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    if (!isHiveAccountName(name)) invalid.push(entry.trim());
    else if (names.length < MAX_NAMES) names.push(name);
    else overLimit++;
  }
  return { names, invalid, overLimit };
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    chunks.push(items.slice(i, i + size));
  return chunks;
};

// What we read from a database_api.find_accounts entry.
interface NaiLike {
  amount: string;
  precision: number;
  nai: string;
}
export interface BulkChainAccount {
  name: string;
  created?: string;
  balance?: NaiLike;
  hbd_balance?: NaiLike;
  savings_balance?: NaiLike;
  savings_hbd_balance?: NaiLike;
  vesting_shares?: NaiLike;
  delegated_vesting_shares?: NaiLike;
  received_vesting_shares?: NaiLike;
}

// What we read from a hivemind bridge.get_profiles entry.
export interface BulkProfile {
  name: string;
  reputation?: number;
  active?: string;
}

export interface BulkAccountRow {
  account: string;
  // In VESTS; shown as HP or VESTS, as the settings say.
  ownVests: number;
  effectiveVests: number;
  hive: number;
  hbd: number;
  savingsHive: number;
  savingsHbd: number;
  // null when hivemind had no profile for the account.
  reputation: number | null;
  lastActivity: Date | null;
  created: Date | null;
}

export const buildRow = (
  account: BulkChainAccount,
  profile: BulkProfile | undefined
): BulkAccountRow => {
  const own = naiAssetToFloat(account.vesting_shares);
  return {
    account: account.name,
    ownVests: own,
    effectiveVests:
      own -
      naiAssetToFloat(account.delegated_vesting_shares) +
      naiAssetToFloat(account.received_vesting_shares),
    hive: naiAssetToFloat(account.balance),
    hbd: naiAssetToFloat(account.hbd_balance),
    savingsHive: naiAssetToFloat(account.savings_balance),
    savingsHbd: naiAssetToFloat(account.savings_hbd_balance),
    reputation:
      typeof profile?.reputation === "number" ? profile.reputation : null,
    lastActivity: parseChainDate(profile?.active ?? null),
    created: parseChainDate(account.created ?? null),
  };
};

// Runs the tasks with at most `limit` in flight, keeping the results in order.
export const runLimited = async <T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> => {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker)
  );
  return results;
};
