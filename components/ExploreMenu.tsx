// src/components/layout/ExploreMenu.tsx

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n";
import {
  Users,
  Vote,
  Menu,
  UserCheck,
  SettingsIcon,
  Award,
  Wrench,
  Boxes,
  CalendarClock,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ExploreListItem = ({
  href,
  title,
  icon: Icon,
  closeMenu,
  testId,
  active,
}: {
  href: string;
  title: string;
  icon: React.ElementType;
  closeMenu: () => void;
  testId?: string;
  active?: boolean;
}) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(
      "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-slate-100 text-link dark:bg-slate-800"
        : "hover:bg-slate-100 dark:hover:bg-slate-800"
    )}
    onClick={closeMenu}
    data-testid={testId}
  >
    <Icon
      className={cn(
        "h-4 w-4 shrink-0 transition-colors",
        active
          ? "text-link"
          : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-100"
      )}
    />
    <span>{title}</span>
  </Link>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
    {children}
  </p>
);

export function ExploreMenu() {
  const { t } = useI18n();
  const router = useRouter();
  const isActive = (href: string) =>
    href === "/tools/compare"
      ? router.pathname.startsWith("/tools")
      : router.pathname === href;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div ref={menuRef}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="group flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-500/20"
            data-testid="explore-menu-button"
          >
            <Menu className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-56 p-1.5 border-slate-200 dark:border-slate-700 mt-2"
          align="end"
        >
          <div className="flex flex-col gap-0.5">
            <SectionLabel>{t("navbar.explore")}</SectionLabel>
            <ExploreListItem
              href="/blocks"
              title={t("pageTitle.hiveBlocks")}
              icon={Boxes}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/blocks")}
            />
            <ExploreListItem
              href="/communities"
              title={t("navbar.communitiesTitle")}
              icon={Users}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/communities")}
            />
            <ExploreListItem
              href="/top-holders"
              title={t("pageTitle.topHolders")}
              icon={Award}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/top-holders")}
            />

            <SectionLabel>{t("boards.governance.name")}</SectionLabel>
            <ExploreListItem
              href="/proposals"
              title={t("navbar.proposalsTitle")}
              icon={Vote}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/proposals")}
            />
            <ExploreListItem
              href="/witnesses"
              title={t("navbar.witnessesTitle")}
              icon={UserCheck}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/witnesses")}
              testId="navbar-witnesses-link"
            />
            <ExploreListItem
              href="/schedule"
              title={t("witnessSchedule.title")}
              icon={CalendarClock}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/schedule")}
            />

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
            <ExploreListItem
              href="/tools/compare"
              title={t("tools.title")}
              icon={Wrench}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/tools/compare")}
              testId="navbar-tools-link"
            />
            <ExploreListItem
              href="/settings"
              title={t("navbar.settingsTitle")}
              icon={SettingsIcon}
              closeMenu={() => setIsOpen(false)}
              active={isActive("/settings")}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
