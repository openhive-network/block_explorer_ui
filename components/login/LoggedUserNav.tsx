import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import { getHiveAvatarUrl } from "@/utils/HiveBlogUtils";
import { LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useManabars from "@/hooks/api/accountPage/useManabars";
import { useSettings } from "@/contexts/SettingsContext";
import RadialProgress from "@/components/RadialProgress";
import { Progress } from "@/components/ui/progress";

import keychainLogo from "@/lib/smart-signer/logo/keychain.png";
import Hslogo from "@/lib/smart-signer/logo/hivesigner.svg";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";

const UserNavItem = ({ href, title, icon: Icon, closeMenu }: any) => (
  <Link
    href={href}
    className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-secondary/60 text-text transition-all active:scale-[0.98]"
    onClick={closeMenu}
  >
    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
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

  const AUTH_METHODS_CONFIG = useMemo(() => ({
    keychain: {
      name: "Hive Keychain",
      logo: keychainLogo,
      description: t("auth.keychainDescription"),
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800/30",
      textColor: "text-red-900 dark:text-red-200"
    },
    hivesigner: {
      name: "Hivesigner",
      logo: Hslogo,
      description: t("auth.hivesignermessage"),
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800/30",
      textColor: "text-blue-900 dark:text-blue-200"
    },
  }), [t]);

  const config = method ? AUTH_METHODS_CONFIG[method as keyof typeof AUTH_METHODS_CONFIG] : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
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
        <ChevronDown className={cn("w-3.5 h-3.5 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-60 bg-theme border border-navbar-border rounded-2xl shadow-xl z-[100] p-1.5 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 right-0">

          {/* Header Card */}
          <div className={cn(
            "mb-1.5 p-2.5 rounded-xl border transition-colors",
            config?.bgColor,
            config?.borderColor
          )}>
            <p className="text-[10px] text-text uppercase tracking-wider mb-2">
              {t("auth.loggedInVia")}
            </p>

            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2.5 cursor-help">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-black/5 flex items-center justify-center shadow-sm">
                      {config && <Image src={config.logo} alt="logo" width={20} height={20} />}
                    </div>
                    <div className="overflow-hidden">
                      <p className={cn("text-xs font-bold truncate", config?.textColor)}>
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
                    { label: "Upvote",    value: manabarsData.upvote.percentageValue,    color: "#00c040", current: manabarsData.upvote.current,    max: manabarsData.upvote.max },
                    { label: "Downvote",  value: manabarsData.downvote.percentageValue,  color: "#c01000", current: manabarsData.downvote.current,  max: manabarsData.downvote.max },
                    { label: "RC",        value: manabarsData.rc.percentageValue,        color: "#cecafa", current: manabarsData.rc.current,        max: manabarsData.rc.max },
                  ].map(({ label, value, color, current, max }) => (
                    <div key={label}>
                      <p className="mb-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">{label}</p>
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
                    </div>
                  ))}
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
                    tooltipContent={
                      <p className="text-sm">{manabarsData.upvote.current} / {manabarsData.upvote.max}</p>
                    }
                  />
                  <RadialProgress
                    size={46}
                    strokeWidth={4}
                    percentage={manabarsData.downvote.percentageValue}
                    label="Downvote"
                    color="text-red-500"
                    percentageClassName="text-[9px]"
                    labelClassName="text-[8px]"
                    tooltipContent={
                      <p className="text-sm">{manabarsData.downvote.current} / {manabarsData.downvote.max}</p>
                    }
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
                      <p className="text-sm">{manabarsData.rc.current} / {manabarsData.rc.max}</p>
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
              icon={User}
              closeMenu={() => setIsOpen(false)}
            />

            <div className="my-1 border-t border-border/40 mx-1" />

            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("auth.signOut")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedUserNav;