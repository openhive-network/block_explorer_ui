import { useEffect, useState } from "react";

// The Hive Watchmen bad-actor list is about 16k names (200 KB), so it loads in
// its own chunk the first time something needs it, not with every page.
export type BadActors = ReadonlySet<string>;

const normalize = (name: string) =>
  name.trim().toLowerCase().replace(/^@/, "");

let loaded: BadActors | null = null;
let loading: Promise<BadActors> | null = null;

// Accounts we label ourselves (exchanges, treasury, services) are never
// flagged: the Watchmen list has carried live exchange wallets before, and a
// "do not send funds" warning on a known exchange wallet does real harm.
// accountLabels is loaded here, not imported, because it imports this module.
export const loadBadActors = (): Promise<BadActors> =>
  (loading ??= Promise.all([import("./BadActorList"), import("./accountLabels")])
    .then(([{ default: list }, { ACCOUNT_LABELS }]) => {
      loaded = new Set(
        (list as string[])
          .filter(Boolean)
          .map(normalize)
          .filter((name) => !ACCOUNT_LABELS[name])
      );
      return loaded;
    })
    .catch((error) => {
      loading = null; // let the next caller try again
      throw error;
    }));

// The list once it has loaded; null before that, so nothing is flagged yet.
export const useBadActors = (): BadActors | null => {
  const [list, setList] = useState(loaded);
  useEffect(() => {
    if (list) return;
    let live = true;
    loadBadActors()
      .then((names) => live && setList(names))
      .catch((error) =>
        console.warn("[badActors] could not load the list:", error)
      );
    return () => {
      live = false;
    };
  }, [list]);
  return list;
};

export const isBadActor = (
  list: BadActors | null,
  name?: string | null
): boolean => !!list && !!name && list.has(normalize(name));
