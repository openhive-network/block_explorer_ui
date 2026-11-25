import { useState } from "react";
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

// wax's message is generic ("Chain API returned an error"); the node's own
// reason is in the error's response.
export const missingAccount = (error: unknown) => {
  let text = String(error ?? "");
  try {
    text += JSON.stringify((error as { response?: unknown })?.response ?? "");
  } catch {
    // An unserialisable response: the message alone decides.
  }
  return /does not exist/i.test(text);
};

// bridge.get_profiles rejects the whole batch when one name has no hivemind
// account (a brand-new account hivemind hasn't caught up with). Split the
// batch until the missing names are on their own. Any other error leaves the
// batch without profiles and says so.
export const fetchProfiles = async (
  names: string[]
): Promise<{ profiles: BulkProfile[]; failed: boolean }> => {
  try {
    return {
      profiles: await fetchingService.getProfiles(names),
      failed: false,
    };
  } catch (error) {
    if (!missingAccount(error)) return { profiles: [], failed: true };
    if (names.length === 1) return { profiles: [], failed: false };
    const middle = Math.ceil(names.length / 2);
    const [a, b] = await Promise.all([
      fetchProfiles(names.slice(0, middle)),
      fetchProfiles(names.slice(middle)),
    ]);
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

const lookUp = async (
  names: string[],
  onProgress: (done: number) => void
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
        onProgress(done);
        return { found, profiles, failed };
      }),
      PARALLEL
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
// done so far, for a long list.
const useBulkAccounts = (names: string[]) => {
  const [progress, setProgress] = useState(0);
  const query = useQuery({
    queryKey: ["bulkAccounts", names],
    queryFn: () => {
      setProgress(0);
      return lookUp(names, setProgress);
    },
    enabled: names.length > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    meta: { suppressErrorToast: true },
  });
  return { ...query, progress };
};

export default useBulkAccounts;
