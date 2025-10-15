// src/components/layout/Navbar.tsx (Updated)

import { useState } from "react";
import { Menu, X, Wrench, ChevronDown, Workflow, Users, Compass, Vote, UserCheck, SettingsIcon,Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import SearchBar from "./SearchBar";
import SyncInfo from "./home/SyncInfo";
import DataView from "./DataView";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./home/LanguageSelector";
import { useI18n } from "@/i18n/i18n";
import { ExploreMenu } from "./ExploreMenu";
import { getImageSrc } from "@/utils/PathUtils";

export default function Navbar() {
  const { t } = useI18n();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  return (
    <div className="fixed w-full top-0 left-0 z-50" data-testid="navbar">
      <div className="flex p-2 justify-between bg-theme text-white items-center relative">
        {isMobile ? (
          <div className="flex items-center justify-between w-full">
            <Link href={"/"} className="relative pr-2">
              <Image src={getImageSrc("/hive-logo.png")} alt="Hive logo" width={40} height={40} />
            </Link>
            <div className="flex-grow flex items-center justify-end gap-x-1 w-[90%]">
              <SearchBar open={searchBarOpen} onChange={setSearchBarOpen} className="h-[36px]" />
              <SyncInfo />
              <Menu height={34} width={34} onClick={() => setMenuOpen(true)} className="flex-shrink-0 cursor-pointer" />
            </div>
            <div
              className={cn(
                "fixed top-0 right-0 p-5 w-full h-full translate-x-full duration-500 z-50",
                { "translate-x-0": menuOpen }
              )}
              style={{
                background: "var(--background-start-rgb)",
                backgroundImage: "linear-gradient(var(--background-start-rgb), var(--background-end-rgb))",
              }}
            >
              <div className="w-full flex items-center justify-end">
                <X onClick={() => setMenuOpen(false)} height={40} width={40} className="cursor-pointer" />
              </div>

              {/* Settings Accordion (Reference) */}
              <div className="text-left py-2 rounded-lg bg-white dark:bg-navbar shadow-md mb-4 px-4 hover:bg-navbar-listHover transition">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setSettingsOpen(!settingsOpen)}>
                  <div className="flex items-center">
                    <Wrench className="mr-2" size={22} />
                    <span className="text-lg font-bold">{t("common.settings")}</span>
                  </div>
                  <ChevronDown size={20} className={cn("transition-transform", { "rotate-180": settingsOpen })} />
                </div>
                {settingsOpen && (
                  <div className="mt-2 pl-8 space-y-2">
                    <div className="py-1 border-b-2 flex items-start justify-start">
                      <ThemeToggle />
                      <span className="text-base ml-2">{t("navbar.darkLightMode")}</span>
                    </div>
                    <div className="py-1 border-b-2 flex items-start justify-start">
                      <LanguageSelector />
                    </div>
                    <div className="py-1 max-w-fit">
                      <DataView isMobile={isMobile} />
                    </div>
                  </div>
                )}
              </div>

              {/* Explore Accordion */}
              <div className="text-left py-2 rounded-lg bg-white dark:bg-navbar shadow-md mb-4 px-4 hover:bg-navbar-listHover transition">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExploreOpen(!exploreOpen)}>
                  <div className="flex items-center">
                    <Compass className="mr-2" size={22} />
                    <span className="text-lg font-bold">{t("navbar.explore")}</span>
                  </div>
                  <ChevronDown size={20} className={cn("transition-transform", { "rotate-180": exploreOpen })} />
                </div>
                {exploreOpen && (
                  <div className="mt-2 pl-8 space-y-2">
                    <Link href={"/communities"} className="py-1 border-b-2 flex items-start justify-start" onClick={() => setMenuOpen(false)}>
                      <Users className="mr-2 mt-1 flex-shrink-0" size={20} />
                      <span className="text-base ml-2">{t("navbar.communitiesTitle")}</span>
                    </Link>
                    <Link href={"/proposals"} className="py-1 border-b-2 flex items-start justify-start" onClick={() => setMenuOpen(false)}>
                      <Vote className="mr-2 mt-1 flex-shrink-0" size={20} />
                      <span className="text-base ml-2">{t("navbar.proposalsTitle")}</span>
                    </Link>
                    <Link href={"/top-holders"} className="py-1 border-b-2 flex items-start justify-start" onClick={() => setMenuOpen(false)}>
                      <Award className="mr-2 mt-1 flex-shrink-0" size={20} />
                      <span className="text-base ml-2">{t("pageTitle.topHolders")}</span>
                    </Link>
                    <Link href={"/witnesses"} className="py-1 flex items-start border-b-2 justify-start" onClick={() => setMenuOpen(false)}>
                      <UserCheck className="mr-2 mt-1 flex-shrink-0" size={20} />
                      <span className="text-base ml-2">{t("navbar.witnessesTitle")}</span>
                    </Link>
                    <Link href={"/settings"} className="py-1 flex items-start justify-start" onClick={() => setMenuOpen(false)}>
                      <SettingsIcon className="mr-2 mt-1 flex-shrink-0" size={20} />
                      <span className="text-base ml-2">{t("navbar.additionalSettingsTitle")}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed w-full top-0 left-0 z-50" data-testid="navbar">
            <div className="flex flex-col bg-theme text-white relative p-2">
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-x-4">
                  <Link href={"/"} className="pr-2 flex items-center text-explorer-turquoise font-medium">
                    <Image src={getImageSrc("/hive-logo.png")} alt="Hive logo" width={50} height={50} data-testid="hive-logo" />
                    <div className="ml-4 whitespace-nowrap" data-testid="hive-block-explorer">{t("navbar.hiveBlockExplorer")}</div>
                  </Link>
                </div>
                <div className="flex items-center gap-x-2 w-auto justify-end">
                  <SearchBar open={true} className=" justify-end" />
                  <DataView />
                  <LanguageSelector />
                  <SyncInfo />
                  <ThemeToggle />
                  <ExploreMenu />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}