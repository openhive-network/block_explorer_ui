import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { WIDGET_REGISTRY } from "@/components/dashboard/lib/widgetRegistry";
import { diffBundles } from "@/utils/workspaceDiff";
import {
  WorkspaceBundle,
  WORKSPACE_CLOUD_DIFFERS_EVENT,
  applyBundle,
  buildBundle,
  clearRestoreUndo,
  consumeRestoreAnnouncement,
  readRestoreUndo,
  saveLastSync,
  saveRestoreUndo,
} from "@/utils/workspaceSync";

interface ToastBodyProps {
  id: string | number;
  username: string;
  bundle: WorkspaceBundle;
}

const NAMES_SHOWN = 3;

interface DiffLineProps {
  sign: string;
  tone: string;
  label: string;
  names: string[];
  more: string;
}

/** One side of what restoring would do, named rather than counted. */
const DiffLine: React.FC<DiffLineProps> = ({
  sign,
  tone,
  label,
  names,
  more,
}) => {
  if (!names.length) return null;
  const shown = names.slice(0, NAMES_SHOWN).join(", ");
  const rest = names.length - NAMES_SHOWN;
  return (
    <p className="flex gap-1.5">
      <span aria-hidden="true" className={cn("shrink-0 font-mono", tone)}>
        {sign}
      </span>
      <span className="min-w-0">
        <span className={cn("font-semibold", tone)}>{label}</span>{" "}
        <span className="text-gray-600 dark:text-gray-300">
          {shown}
          {rest > 0 && ` ${more.replace("{count}", String(rest))}`}
        </span>
      </span>
    </p>
  );
};

const WorkspaceToastBody: React.FC<ToastBodyProps> = ({
  id,
  username,
  bundle,
}) => {
  const { t, locale } = useI18n();

  // Absent on bundles written before savedAt existed; the row simply loses its
  // date line rather than falling back to a vaguer sentence.
  const savedAtDate = bundle.savedAt ? new Date(bundle.savedAt) : null;
  const savedOn =
    savedAtDate && !Number.isNaN(savedAtDate.getTime())
      ? savedAtDate.toLocaleString(locale, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const local = buildBundle(username);
  const diff = local ? diffBundles(local, bundle) : null;
  // Local storage was unreadable, so nothing below describes what a restore
  // would cost. Offering the button anyway would overwrite a board we cannot
  // even show the user.
  const localUnreadable = !local;

  // The registry owns the human name for a widget type; an unknown type (a
  // bundle from a newer build) falls back to its id rather than vanishing.
  const nameOf = (type: string) => {
    const key = WIDGET_REGISTRY[type]?.name;
    return key ? t(key) : type;
  };

  // "Note ×2" — losing two of something reads very differently from losing one.
  const named = (types: string[], counts: Record<string, number>) =>
    types.map((type) => {
      const count = counts[type] ?? 1;
      return count > 1 ? `${nameOf(type)} ×${count}` : nameOf(type);
    });

  // The prompt only opens because the fingerprint says the two copies differ.
  // The diff matches widgets by id, and user-added widgets carry a timestamp id,
  // so the same note on two devices never lines up and its text change is
  // invisible here. Say so rather than implying nothing would change.
  const unnamedDifference = !!diff?.identical;

  // Everything the bundle carries that is not a widget, named plainly.
  const alsoDiffers = diff
    ? [
        diff.layoutChanged && t("workspaceSync.diffLayout"),
        diff.contentChanged && t("workspaceSync.diffContent"),
        diff.settingsChanged && t("workspaceSync.diffSettings"),
        diff.watchlistChanged && t("workspaceSync.diffWatchlist"),
      ].filter(Boolean)
    : [];

  const action =
    "rounded px-3 py-1.5 text-xs font-semibold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1";

  return (
    <div
      data-testid="workspace-restore-prompt"
      className="relative w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-theme ps-3.5 pe-3 py-2.5 shadow-xl dark:border-gray-700"
    >
      {/* The board-header spine, so this reads as part of the same system. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 start-0 w-[3px] bg-indigo-500"
      />

      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {t("workspaceSync.cloudDiffersTitle")}
        {savedOn && (
          <span className="font-normal text-gray-400 dark:text-gray-500">
            {" · "}
            {t("workspaceSync.savedOn").replace("{date}", savedOn)}
          </span>
        )}
      </p>

      {/* Named, not counted: two boards can hold the same number of widgets and
          still be different, and losing one is the part worth knowing. */}
      <div className="mt-1.5 space-y-0.5 text-xs leading-snug">
        {localUnreadable && (
          <p
            data-testid="workspace-diff-unreadable"
            className="text-amber-600 dark:text-amber-400"
          >
            {t("workspaceSync.diffUnreadable")}
          </p>
        )}
        <DiffLine
          sign="−"
          tone="text-rose-600 dark:text-rose-400"
          label={t("workspaceSync.diffRemoves")}
          names={named(diff?.removed ?? [], diff?.removedCounts ?? {})}
          more={t("workspaceSync.diffMore")}
        />
        <DiffLine
          sign="+"
          tone="text-emerald-600 dark:text-emerald-400"
          label={t("workspaceSync.diffAdds")}
          names={named(diff?.added ?? [], diff?.addedCounts ?? {})}
          more={t("workspaceSync.diffMore")}
        />
        {unnamedDifference && (
          <p
            data-testid="workspace-diff-unnamed"
            className="text-gray-500 dark:text-gray-400"
          >
            {t("workspaceSync.diffContentsDiffer")}
          </p>
        )}
        {alsoDiffers.length > 0 && (
          <p className="text-gray-400 dark:text-gray-500">
            {t("workspaceSync.diffAlso").replace(
              "{list}",
              alsoDiffers.join(" · ")
            )}
          </p>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-1.5">
        <button
          data-testid="workspace-keep-local"
          onClick={() => {
            // Records the cloud state as seen; not remembered across logins.
            saveLastSync(username, bundle);
            toast.dismiss(id);
          }}
          className={cn(
            action,
            "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          )}
        >
          {t("workspaceSync.keepLocal")}
        </button>
        <button
          data-testid="workspace-restore-cloud"
          // Unreadable local storage means an unknown cost and no usable undo
          // snapshot, so restoring is refused rather than done blind.
          disabled={localUnreadable}
          title={
            localUnreadable ? t("workspaceSync.diffUnreadable") : undefined
          }
          onClick={() => {
            // Dismiss first: the reload needs a server round trip, so the
            // click has to register immediately.
            toast.dismiss(id);
            // Snapshot first: applyBundle overwrites the very thing undo needs.
            saveRestoreUndo(username);
            if (!applyBundle(username, bundle)) {
              // Nothing was written, so drop the snapshot — leaving it would
              // offer an undo for a restore that never happened.
              clearRestoreUndo(username);
              toast.error(t("dashbord.boardSwitchFailed"));
              return;
            }
            saveLastSync(username, bundle);
            window.location.reload();
          }}
          className={cn(
            action,
            "bg-indigo-500 text-white hover:bg-indigo-600",
            "disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500",
            "dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
          )}
        >
          {t("workspaceSync.restoreFromCloud")}
        </button>
      </div>
    </div>
  );
};

interface PendingRestore {
  bundle: WorkspaceBundle;
  username: string;
  /** Asked for from the menu, so it must not wait for the dashboard. */
  immediate: boolean;
}

const DASHBOARD_ROUTE = "/";

const UNDO_WINDOW_MS = 20000;

const WorkspaceRestorePrompt: React.FC = () => {
  const { t } = useI18n();
  const { username } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState<PendingRestore | null>(null);
  const undoOffered = useRef(false);

  // Announced once, on the dashboard. The snapshot outlives this toast for the
  // undo button, so it cannot double as the signal.
  useEffect(() => {
    if (!username || undoOffered.current) return;
    if (router.pathname !== DASHBOARD_ROUTE) return;
    if (!consumeRestoreAnnouncement(username)) return;
    const snapshot = readRestoreUndo(username);
    if (!snapshot) return;
    undoOffered.current = true;

    toast.success(t("workspaceSync.restoredTitle"), {
      id: "workspace-restored",
      duration: UNDO_WINDOW_MS,
      action: {
        label: t("workspaceSync.restoredUndo"),
        onClick: () => {
          // The cloud fingerprint stays as it is: the saved workspace has not
          // changed, so undoing must not start the prompt asking again.
          if (!applyBundle(username, snapshot)) {
            // The snapshot is the only copy of the pre-restore board: keep it.
            toast.error(t("dashbord.boardSwitchFailed"));
            return;
          }
          clearRestoreUndo(username);
          window.location.reload();
        },
      },
      // Not cleared on close: the undo button reads the same snapshot.
    });
  }, [username, t, router.pathname]);

  useEffect(() => {
    const handle = (e: Event) => {
      // Use username from the event detail — avoids stale closure from auth state
      // which is still null when this event fires (login hasn't called setUsername yet)
      const { bundle, username, immediate } = (
        e as CustomEvent<{
          bundle: WorkspaceBundle;
          username: string;
          compressed: string;
          immediate?: boolean;
        }>
      ).detail;
      setPending({ bundle, username, immediate: !!immediate });
    };

    window.addEventListener(WORKSPACE_CLOUD_DIFFERS_EVENT, handle);
    return () =>
      window.removeEventListener(WORKSPACE_CLOUD_DIFFERS_EVENT, handle);
  }, []);

  // Login fires on every page load, so the event can arrive anywhere. A board
  // swap is only legible on the dashboard, so hold it and ask there.
  useEffect(() => {
    if (!pending) return;
    // The automatic prompt waits for the dashboard; an explicit request does not.
    if (!pending.immediate && router.pathname !== DASHBOARD_ROUTE) return;
    const { bundle, username } = pending;

    toast.custom(
      (id) => (
        <WorkspaceToastBody id={id} username={username} bundle={bundle} />
      ),
      { duration: Infinity, id: "workspace-cloud-differs" }
    );
    // Shown once; navigating away and back must not raise it again. A reload
    // re-runs login, which re-queues it while the cloud is still unanswered.
    setPending(null);
  }, [pending, router.pathname]);

  return null;
};

export default WorkspaceRestorePrompt;
