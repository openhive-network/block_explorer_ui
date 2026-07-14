import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import {
  LogOut,
  ChevronDown,
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Dot,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useManabars from "@/hooks/api/accountPage/useManabars";
import { useSettings } from "@/contexts/SettingsContext";
import RadialProgress from "@/components/RadialProgress";
import { Progress } from "@/components/ui/progress";
import { useWorkspaceSync } from "@/hooks/api/useWorkspaceSync";
import { hasLocalChanges } from "@/utils/workspaceSync";
import { toast } from "sonner";

import keychainLogo from "@/lib/smart-signer/logo/keychain.png";
import Hslogo from "@/lib/smart-signer/logo/hivesigner.svg";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";

const UserNavItem = ({
  href,
  title,
  closeMenu,
}: {
  href: string;
  title: string;
  closeMenu: () => void;
}) => (
  <Link
    href={href}
    className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-secondary/60 text-text transition-all active:scale-[0.98]"
    onClick={closeMenu}
  >
    <span>{title}</span>
  </Link>
);

const LoggedUserNav: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const { username, avatar, logout, method } = useAuth();
  const { t } = useI18n();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { manabarsData } = useManabars(username || "", true);
  const { syncStatus, syncWorkspace, lastBundleBytes } = useWorkspaceSync();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUnsynced, setIsUnsynced] = useState(false);

  useEffect(() => {
    setIsUnsynced(!!username && hasLocalChanges(username));
    if (syncStatus === "success") toast.dismiss("workspace-cloud-differs");
  }, [username, isOpen, syncStatus]);

  const AUTH_METHODS_CONFIG = useMemo(
    () => ({
      keychain: {
        name: "Hive Keychain",
        logo: keychainLogo,
        description: t("auth.keychainDescription"),
        bgColor: "bg-red-50 dark:bg-red-950/20",
        borderColor: "border-red-200 dark:border-red-800/30",
        textColor: "text-red-900 dark:text-red-200",
      },
      hivesigner: {
        name: "Hivesigner",
        logo: Hslogo,
        description: t("auth.hivesignermessage"),
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        borderColor: "border-blue-200 dark:border-blue-800/30",
        textColor: "text-blue-900 dark:text-blue-200",
      },
    }),
    [t]
  );

  const config = method
    ? AUTH_METHODS_CONFIG[method as keyof typeof AUTH_METHODS_CONFIG]
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-navbar-border bg-secondary/20 p-1 pr-3 hover:bg-secondary/40 transition-all outline-none"
      >
        <Image
          src={avatar || getHiveAvatarUrl(username || "")}
          alt="avatar"
          width={28}
          height={28}
          className="w-7 h-7 rounded-full border border-border/50 object-cover"
        />
        {!isMobile && (
          <span className="text-xs font-bold text-text">{username}</span>
        )}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-60 bg-theme border border-navbar-border rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 end-0">
          {/* Header Card */}
          <div
            className={cn(
              "mb-1.5 p-2.5 rounded-xl border transition-colors",
              config?.bgColor,
              config?.borderColor
            )}
          >
            <p className="text-[10px] text-text uppercase tracking-wider mb-2">
              {t("auth.loggedInVia")}
            </p>

            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2.5 cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-black/5 flex items-center justify-center shadow-sm">
                      {config && (
                        <Image
                          src={config.logo}
                          alt="logo"
                          width={20}
                          height={20}
                        />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p
                        className={cn(
                          "text-xs font-bold truncate",
                          config?.textColor
                        )}
                      >
                        {config?.name}
                      </p>
                      <p className="text-[10px] text-explorer-dark-gray dark:text-white font-medium truncate">
                        @{username}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="bg-slate-900 text-white border-none text-[11px] py-1 px-2">
                    {config?.description}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Mana / RC Section */}
          {!!manabarsData && (
            <div className="mb-1.5 px-2 py-2 rounded-xl border border-border/30 bg-secondary/10">
              {settings.progressBarType === "linear" ? (
                <div className="space-y-2">
                  {[
                    {
                      label: "Upvote",
                      value: manabarsData.upvote.percentageValue,
                      color: "#00c040",
                      showTooltip: false,
                      current: "",
                      max: "",
                    },
                    {
                      label: "Downvote",
                      value: manabarsData.downvote.percentageValue,
                      color: "#c01000",
                      showTooltip: false,
                      current: "",
                      max: "",
                    },
                    {
                      label: "RC",
                      value: manabarsData.rc.percentageValue,
                      color: "#cecafa",
                      showTooltip: true,
                      current: manabarsData.rc.current,
                      max: manabarsData.rc.max,
                    },
                  ].map(
                    ({ label, value, color, showTooltip, current, max }) => (
                      <div key={label}>
                        <p className="mb-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          {label}
                        </p>
                        {showTooltip ? (
                          <TooltipProvider>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div className="cursor-help">
                                  <Progress value={value} color={color} />
                                </div>
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipContent className="bg-slate-900 text-white border-none text-[11px] py-1 px-2">
                                  {current} / {max}
                                </TooltipContent>
                              </TooltipPortal>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Progress value={value} color={color} />
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 justify-items-center gap-1">
                  <RadialProgress
                    size={46}
                    strokeWidth={4}
                    percentage={manabarsData.upvote.percentageValue}
                    label="Upvote"
                    color="text-green-500"
                    percentageClassName="text-[9px]"
                    labelClassName="text-[8px]"
                  />
                  <RadialProgress
                    size={46}
                    strokeWidth={4}
                    percentage={manabarsData.downvote.percentageValue}
                    label="Downvote"
                    color="text-red-500"
                    percentageClassName="text-[9px]"
                    labelClassName="text-[8px]"
                  />
                  <RadialProgress
                    size={46}
                    strokeWidth={4}
                    percentage={manabarsData.rc.percentageValue}
                    label="RC"
                    color="text-indigo-400"
                    percentageClassName="text-[9px]"
                    labelClassName="text-[8px]"
                    tooltipContent={
                      <p className="text-sm">
                        {manabarsData.rc.current} / {manabarsData.rc.max}
                      </p>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Menu Actions */}
          <div className="flex flex-col gap-0.5">
            <UserNavItem
              href={`/@${username}`}
              title={t("auth.myProfile")}
              closeMenu={() => setIsOpen(false)}
            />
            <UserNavItem
              href={`/proposals?voter=${username}&status=all`}
              title={t("auth.myVotedProposals")}
              closeMenu={() => setIsOpen(false)}
            />
            <UserNavItem
              href={`/witnesses?voter=${username}`}
              title={t("auth.myWitnessVotes")}
              closeMenu={() => setIsOpen(false)}
            />

            <div className="my-1 border-t border-border/40 mx-1" />

            <TooltipProvider>
              <Tooltip
                open={isUnsynced || syncStatus !== "idle" ? undefined : false}
              >
                <TooltipTrigger asChild>
                  <button
                    onClick={syncWorkspace}
                    disabled={syncStatus === "syncing" || !isUnsynced}
                    className="relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-secondary/60 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {syncStatus === "syncing" && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {syncStatus === "success" && (
                      <CheckCircle2 className="h-4 w-4" color="#22c55e" />
                    )}
                    {syncStatus === "error" && (
                      <span className="relative">
                        <AlertCircle className="h-4 w-4" color="#ef4444" />
                        {isUnsynced && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />
                        )}
                      </span>
                    )}
                    {syncStatus === "oversized" && (
                      <AlertCircle className="h-4 w-4" color="#f59e0b" />
                    )}
                    {syncStatus === "idle" && (
                      <span className="relative">
                        <CloudUpload className="h-4 w-4" />
                        {isUnsynced && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />
                        )}
                      </span>
                    )}
                    <span>{t("settingsPage.workspaceSyncButton")}</span>
                    {isUnsynced &&
                      (syncStatus === "idle" || syncStatus === "error") && (
                        <span className="ml-auto text-xs text-amber-500 font-normal">
                          {t("workspaceSync.unsyncedLabel")}
                        </span>
                      )}
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="left"
                    className="max-w-[200px] text-center"
                  >
                    {isUnsynced
                      ? t("workspaceSync.unsyncedTooltip")
                      : t("workspaceSync.noChangesToSync")}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>

            {/* RC info row */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 ml-6 cursor-default">
                    <Info className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    <span className="text-[10px]">
                      {t("workspaceSync.rcInfo")}
                      {lastBundleBytes !== null && (
                        <span className="ml-1 text-muted-foreground/80">
                          (~{(lastBundleBytes / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="left"
                    className="max-w-[220px] text-left text-[11px]"
                  >
                    {t("workspaceSync.rcInfoTooltip")}
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>

            {/* Low-RC warning */}
            {!!manabarsData && manabarsData.rc.percentageValue < 10 && (
              <div className="mx-1 mb-1 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 px-2.5 py-2">
                <AlertCircle
                  className="h-3.5 w-3.5 mt-0.5 shrink-0"
                  color="#ef4444"
                />
                <p className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed">
                  {t("workspaceSync.rcLowWarning")}
                </p>
              </div>
            )}

            <div className="my-1 border-t border-border/40 mx-1" />

            {showLogoutConfirm ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 space-y-2">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  {t("workspaceSync.unsyncedLogoutWarning")}
                </p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={async () => {
                      await syncWorkspace();
                      toast.dismiss();
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1.5 transition-colors"
                  >
                    {t("workspaceSync.syncAndLogout")}
                  </button>
                  <button
                    onClick={() => {
                      toast.dismiss();
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full rounded-md text-xs font-medium py-1.5 hover:bg-secondary/60 transition-colors"
                  >
                    {t("workspaceSync.logoutAnyway")}
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full rounded-md text-xs text-muted-foreground py-1.5 hover:bg-secondary/60 transition-colors"
                  >
                    {t("workspaceSync.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (isUnsynced) {
                    setShowLogoutConfirm(true);
                    return;
                  }
                  toast.dismiss();
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("auth.signOut")}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedUserNav;
