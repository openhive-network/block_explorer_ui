import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import fetchingService from "@/services/FetchingService";
import { naiAssetToFloat } from "@/utils/Calculations";
import {
  BATCH_SIZE,
  BulkAccountRow,
  BulkChainAccount,
  BulkProfile,
  buildRow,
  chunk,
  runLimited,
} from "@/utils/bulkAccounts";

// Requests in flight at once; enough to keep a long list quick without
// leaning on a public node.
const PARALLEL = 3;

// The text of a node error. wax's message can be generic ("Chain API returned
// an error"), with the node's own reason in the error's response.
const errorText = (error: unknown) => {
  let text = String(error ?? "");
  try {
    text += JSON.stringify((error as { response?: unknown })?.response ?? "");
  } catch {
    // An unserialisable response: the message alone decides.
  }
  return text;
};

// The names hivemind says it has no account for, from an error like
// [{"newbie": "account does not exist"}]. Empty when the error is something
// else.
export const missingAccounts = (error: unknown): string[] =>
  Array.from(
    errorText(error).matchAll(
      /\\?"([a-z0-9.-]+)\\?":\s*\\?"account does not exist/g
    ),
    (match) => match[1]
  );

// bridge.get_profiles rejects the whole batch when one name has no hivemind
// account (a brand-new account hivemind hasn't caught up with). The error
// names them, so ask again without those. If it can't be told which names are
// missing, split the batch, one half after the other. Any other error leaves
// the batch without profiles and says so.
export const fetchProfiles = async (
  names: string[],
  retried = false
): Promise<{ profiles: BulkProfile[]; failed: boolean }> => {
  try {
    return {
      profiles: await fetchingService.getProfiles(names),
      failed: false,
    };
  } catch (error) {
    if (!/does not exist/i.test(errorText(error)))
      return { profiles: [], failed: true };
    const missing = new Set(missingAccounts(error));
    const rest = names.filter((name) => !missing.has(name));
    if (!retried && missing.size && rest.length < names.length)
      return rest.length
        ? fetchProfiles(rest, true)
        : { profiles: [], failed: false };
    if (names.length === 1) return { profiles: [], failed: false };
    const middle = Math.ceil(names.length / 2);
    const a = await fetchProfiles(names.slice(0, middle), true);
    const b = await fetchProfiles(names.slice(middle), true);
    return {
      profiles: [...a.profiles, ...b.profiles],
      failed: a.failed || b.failed,
    };
  }
};

export interface BulkAccountsResult {
  rows: BulkAccountRow[];
  // Valid names the chain has no account for.
  notFound: string[];
  hivePerVests: number;
  // Reputation and last activity couldn't be loaded for some accounts.
  profilesFailed: boolean;
}

export const lookUp = async (
  names: string[],
  onProgress: (done: number) => void,
  signal?: AbortSignal
): Promise<BulkAccountsResult> => {
  let done = 0;
  const [globals, batches] = await Promise.all([
    fetchingService.getDynamicGlobalProperties(),
    runLimited(
      chunk(names, BATCH_SIZE).map((batch) => async () => {
        const { accounts } = await fetchingService.findAccounts(batch);
        const found = accounts as unknown as BulkChainAccount[];
        const { profiles, failed } = found.length
          ? await fetchProfiles(found.map((account) => account.name))
          : { profiles: [], failed: false };
        done += batch.length;
        if (!signal?.aborted) onProgress(done);
        return { found, profiles, failed };
      }),
      PARALLEL,
      signal
    ),
  ]);

  const accounts = new Map<string, BulkChainAccount>();
  const profiles = new Map<string, BulkProfile>();
  for (const batch of batches) {
    for (const account of batch.found) accounts.set(account.name, account);
    for (const profile of batch.profiles) profiles.set(profile.name, profile);
  }
  const rows: BulkAccountRow[] = [];
  const notFound: string[] = [];
  for (const name of names) {
    const account = accounts.get(name);
    if (account) rows.push(buildRow(account, profiles.get(name)));
    else notFound.push(name);
  }
  const shares = naiAssetToFloat(globals.total_vesting_shares);
  return {
    rows,
    notFound,
    hivePerVests:
      shares > 0
        ? naiAssetToFloat(globals.total_vesting_fund_hive) / shares
        : 0,
    profilesFailed: batches.some((batch) => batch.failed),
  };
};

// Looks up a list of account names in batches. `progress` counts the names
// done so far in the current run, for a long list.
const useBulkAccounts = (names: string[]) => {
  const [progress, setProgress] = useState(0);
  const run = useRef(0);
  const query = useQuery({
    queryKey: ["bulkAccounts", names],
    queryFn: ({ signal }) => {
      // A retry or a new list starts a new run; an older one's late
      // batches don't move the counter.
      const id = ++run.current;
      setProgress(0);
      return lookUp(
        names,
        (done) => id === run.current && setProgress(done),
        signal
      );
    },
    enabled: names.length > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });
  return { ...query, progress };
};

export default useBulkAccounts;
