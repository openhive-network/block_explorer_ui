import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type WatchlistItemId = number | string;
type WatchlistStore = Record<string, WatchlistItemId[]>;

interface WatchlistContextType {
  toggleWatch: (type: string, id: WatchlistItemId) => void;
  isWatched: (type: string, id: WatchlistItemId) => boolean;
  getWatched: (type: string) => Set<WatchlistItemId>;
  changedProposalIds: Set<number>;
  markProposalChanged: (id: number) => void;
  clearProposalChange: (id: number) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

const getStorageKey = (username: string) => `hivescan_watchlist_${username}`;
const getChangesKey = (username: string) => `hivescan_proposal_changes_${username}`;

const loadStore = (username: string): Record<string, Set<WatchlistItemId>> => {
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    const parsed: WatchlistStore = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(
      Object.entries(parsed).map(([type, ids]) => [type, new Set(ids)])
    );
  } catch {
    return {};
  }
};

const saveStore = (username: string, store: Record<string, Set<WatchlistItemId>>) => {
  try {
    const serializable: WatchlistStore = Object.fromEntries(
      Object.entries(store).map(([type, set]) => [type, [...set]])
    );
    localStorage.setItem(getStorageKey(username), JSON.stringify(serializable));
  } catch {}
};

const loadChangedIds = (username: string): Set<number> => {
  try {
    const raw = localStorage.getItem(getChangesKey(username));
    const ids: number[] = raw ? JSON.parse(raw) : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
};

const saveChangedIds = (username: string, ids: Set<number>) => {
  try {
    localStorage.setItem(getChangesKey(username), JSON.stringify([...ids]));
  } catch {}
};

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { username, isLoggedIn } = useAuth();
  const [store, setStore] = useState<Record<string, Set<WatchlistItemId>>>({});
  const [changedProposalIds, setChangedProposalIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isLoggedIn || !username) {
      setStore({});
      setChangedProposalIds(new Set());
      return;
    }
    setStore(loadStore(username));
    setChangedProposalIds(loadChangedIds(username));
  }, [username, isLoggedIn]);

  const toggleWatch = useCallback(
    (type: string, id: WatchlistItemId) => {
      if (!username) return;
      setStore((prev) => {
        const typeSet = new Set(prev[type] ?? []);
        if (typeSet.has(id)) {
          typeSet.delete(id);
        } else {
          typeSet.add(id);
        }
        const next = { ...prev, [type]: typeSet };
        saveStore(username, next);
        return next;
      });
    },
    [username]
  );

  const isWatched = useCallback(
    (type: string, id: WatchlistItemId) => store[type]?.has(id) ?? false,
    [store]
  );

  const getWatched = useCallback(
    (type: string): Set<WatchlistItemId> => store[type] ?? new Set(),
    [store]
  );

  const markProposalChanged = useCallback(
    (id: number) => {
      if (!username) return;
      setChangedProposalIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        saveChangedIds(username, next);
        return next;
      });
    },
    [username]
  );

  const clearProposalChange = useCallback(
    (id: number) => {
      if (!username) return;
      setChangedProposalIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        saveChangedIds(username, next);
        return next;
      });
    },
    [username]
  );

  return (
    <WatchlistContext.Provider
      value={{ toggleWatch, isWatched, getWatched, changedProposalIds, markProposalChanged, clearProposalChange }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
};
