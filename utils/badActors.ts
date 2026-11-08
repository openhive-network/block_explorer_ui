import { useEffect, useState } from "react";

// The Hive Watchmen bad-actor list is about 16k names (200 KB), so it loads in
// its own chunk the first time something needs it, not with every page.
export type BadActors = ReadonlySet<string>;

const normalize = (name: string) => name.trim().toLowerCase().replace(/^@/, "");

let loaded: BadActors | null = null;
let loading: Promise<BadActors> | null = null;

// Accounts we label ourselves (exchanges, treasury, services) are never
// flagged: the Watchmen list has carried live exchange wallets before, and a
// "do not send funds" warning on a known exchange wallet does real harm.
// accountLabels is loaded here, not imported, because it imports this module.
export const loadBadActors = (): Promise<BadActors> =>
  (loading ??= Promise.all([
    import("./BadActorList"),
    import("./accountLabels"),
  ])
    .then(([{ default: list }, { ACCOUNT_LABELS }]) => {
      loaded = new Set(
        (list as string[])
          .filter(Boolean)
          .map(normalize)
          .filter((name) => !Object.hasOwn(ACCOUNT_LABELS, name))
      );
      return loaded;
    })
    .catch((error) => {
      loading = null; // let the next caller try again
      throw error;
    }));

// Waits before each retry of a failed load (a flaky network, or a chunk
// replaced by a deploy).
const RETRY_DELAYS_MS = [2000, 10000, 30000];

// The list once it has loaded (null before that, so nothing is flagged yet),
// and whether every attempt to load it failed.
export const useBadActorsState = (): {
  list: BadActors | null;
  failed: boolean;
} => {
  const [list, setList] = useState(loaded);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (list) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = (retry: number) => {
      loadBadActors()
        .then((names) => live && setList(names))
        .catch((error) => {
          if (!live) return;
          if (retry < RETRY_DELAYS_MS.length) {
            timer = setTimeout(
              () => attempt(retry + 1),
              RETRY_DELAYS_MS[retry]
            );
          } else {
            console.warn("[badActors] could not load the list:", error);
            setFailed(true);
          }
        });
    };
    attempt(0);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [list]);
  return { list, failed };
};

export const useBadActors = (): BadActors | null => useBadActorsState().list;

export const isBadActor = (
  list: BadActors | null,
  name?: string | null
): boolean => !!list && !!name && list.has(normalize(name));
