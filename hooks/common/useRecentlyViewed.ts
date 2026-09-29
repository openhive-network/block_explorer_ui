import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/contexts/AuthContext";
import {
  RECENT_VIEWS_EVENT,
  RecentEntry,
  addRecentEntry,
  pathToRecentEntry,
  readRecentViews,
  writeRecentViews,
} from "@/utils/recentlyViewed";

export const useRecentlyViewed = () => {
  const { username } = useAuth();
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(readRecentViews(username));
    sync();
    window.addEventListener(RECENT_VIEWS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(RECENT_VIEWS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [username]);

  const clear = useCallback(() => writeRecentViews(username, []), [username]);

  return { entries, clear };
};

// Mount once: records every account, block and transaction page the user opens.
export const useRecordRecentViews = () => {
  const { asPath } = useRouter();
  const { username, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    const entry = pathToRecentEntry(asPath);
    if (!entry) return;
    writeRecentViews(
      username,
      addRecentEntry(readRecentViews(username), entry)
    );
  }, [asPath, username, isInitializing]);
};
