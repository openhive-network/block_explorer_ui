import { useEffect } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import {
  WorkspaceBundle,
  WORKSPACE_CLOUD_DIFFERS_EVENT,
  applyBundle,
  saveLastSync,
} from "@/utils/workspaceSync";

interface ToastBodyProps {
  id: string | number;
  username: string;
  bundle: WorkspaceBundle;
}

const WorkspaceToastBody: React.FC<ToastBodyProps> = ({
  id,
  username,
  bundle,
}) => {
  const { t } = useI18n();
  return (
    <div className="w-96 flex flex-col gap-4 rounded-lg bg-white dark:bg-slate-900 border border-border/40 p-5 shadow-2xl">
      <div className="space-y-2">
        <p className="font-semibold text-base text-text">
          {t("workspaceSync.cloudDiffersTitle")}
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {t("workspaceSync.cloudDiffersDescription")}
        </p>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            applyBundle(username, bundle);
            saveLastSync(username, bundle);
            window.location.reload();
          }}
          className="flex-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 transition-colors"
        >
          {t("workspaceSync.restoreFromCloud")}
        </button>
        <button
          onClick={() => {
            saveLastSync(username, bundle);
            toast.dismiss(id);
          }}
          className="flex-1 rounded-md bg-secondary hover:bg-secondary/80 text-text text-sm font-semibold py-2.5 transition-colors"
        >
          {t("workspaceSync.keepLocal")}
        </button>
      </div>
    </div>
  );
};

const WorkspaceRestorePrompt: React.FC = () => {
  useEffect(() => {
    const handle = (e: Event) => {
      // Use username from the event detail — avoids stale closure from auth state
      // which is still null when this event fires (login hasn't called setUsername yet)
      const { bundle, username } = (
        e as CustomEvent<{
          bundle: WorkspaceBundle;
          username: string;
          compressed: string;
        }>
      ).detail;

      toast.custom(
        (id) => (
          <WorkspaceToastBody id={id} username={username} bundle={bundle} />
        ),
        { duration: Infinity, id: "workspace-cloud-differs" }
      );
    };

    window.addEventListener(WORKSPACE_CLOUD_DIFFERS_EVENT, handle);
    return () =>
      window.removeEventListener(WORKSPACE_CLOUD_DIFFERS_EVENT, handle);
  }, []);

  return null;
};

export default WorkspaceRestorePrompt;
