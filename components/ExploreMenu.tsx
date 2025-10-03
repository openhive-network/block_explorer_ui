// src/components/layout/ExploreMenu.tsx

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n";
import { Users, Vote, Menu, UserCheck, SettingsIcon, Award } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ExploreListItem = ({ href, title, icon: Icon, closeMenu }: { href: string; title: string; icon: React.ElementType; closeMenu: () => void; }) => (
    <Link 
      href={href} 
      className="group flex items-center gap-3 rounded-md p-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
      onClick={closeMenu}
    >
        <Icon className="h-5 w-5 text-slate-500 transition-colors group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-100" />
        <span >{title}</span>
    </Link>
);


export function ExploreMenu() {
  const { t } = useI18n();
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
          >
            <Menu className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-2 border-slate-200 dark:border-slate-700 mt-2" align="end">
          <div className="flex flex-col gap-1">
              <ExploreListItem href="/communities" title={t("navbar.communitiesTitle")} icon={Users} closeMenu={() => setIsOpen(false)} />
              <ExploreListItem href="/proposals" title={t("navbar.proposalsTitle")} icon={Vote} closeMenu={() => setIsOpen(false)} />
              <ExploreListItem href="/top-holders" title={t("pageTitle.topHolders")} icon={Award}   closeMenu={() => setIsOpen(false)}/>
              <ExploreListItem href="/witnesses" title={t("navbar.witnessesTitle")} icon={UserCheck} closeMenu={() => setIsOpen(false)} />
              <ExploreListItem href="/settings" title={t("navbar.settingsTitle")} icon={SettingsIcon} closeMenu={() => setIsOpen(false)} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}