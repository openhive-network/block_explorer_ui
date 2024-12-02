import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench, faCaretDown, faCircleNodes } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/common/useMediaQuery";
import SearchBar from "./SearchBar";
import SyncInfo from "./home/SyncInfo";
import ViewPopover from "./ViewPopover";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className="fixed w-full top-0 left-0 z-50"
      data-testid="navbar"
    >
      <div
        className="flex p-2 justify-between bg-theme text-white items-center relative">
        {isMobile ? (
          <div className="flex items-center justify-between w-full">
            <Link
              href={"/"}
              className="relative pr-2"
              >
              <Image
                src="/hive-logo.png"
                alt="Hive logo"
                width={40}
                height={40}
              />
            </Link>
            {!searchBarOpen && <SyncInfo />}
            <div className="flex-grow flex items-center justify-end gap-x-3">
              <SearchBar
                open={searchBarOpen}
                onChange={setSearchBarOpen}
              />
              <Menu
                height={34}
                width={34}
                onClick={() => setMenuOpen(true)}
                className="flex-shrink-0 cursor-pointer"
              />
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
                <X
                  onClick={() => setMenuOpen(false)}
                  height={40}
                  width={40}
                  className="cursor-pointer"
                />
              </div>
              <div className="text-left py-2 rounded-lg bg-white shadow-md mb-4 px-4 hover:bg-gray-100 transition dark:bg-gray-800 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faWrench} className="mr-2" />
                  <span
                    className="text-lg font-bold cursor-pointer"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                    Settings
                    <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
                  </span>
                </div>
                {settingsOpen && (
                  <div className="mt-2 pl-8 space-y-2">
                    <div className="py-1 border-b-2 border-gray-300 dark:border-gray-600 flex items-center">
                      <ThemeToggle />
                      <span className="text-base ml-2 text-gray-600 dark:text-gray-400">Dark/Light Mode</span>
                    </div>
                    <div className="py-1 text-gray-600 dark:text-gray-400">
                        <ViewPopover isMobile={isMobile} />
                    </div>
                  </div>
                )}
              </div>
              <div className="text-left py-2 rounded-lg bg-white shadow-md px-4 hover:bg-gray-100 transition dark:bg-gray-800 dark:hover:bg-gray-700">
                <Link
                  href={"/witnesses"}
                  className="flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faCircleNodes} className="mr-2" />
                  <span className="text-lg font-bold">Witnesses</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center pl-12 gap-x-4">
              <Link href={"/"} className="pr-2 flex justify-normal items-center text-explorer-turquoise font-medium">
                <Image
                  src="/hive-logo.png"
                  alt="Hive logo"
                  width={50}
                  height={50}
                  data-testid="hive-logo"
                />
                <div 
                  className="ml-4" 
                  data-testid="hive-block-explorer"
                >
                  Hive Block Explorer
                </div>
              </Link>
              <ViewPopover />
              <SyncInfo />
              <Link href={"/witnesses"} data-testid="navbar-witnesses-link">
                Witnesses
              </Link>
              <ThemeToggle />
            </div>
            <SearchBar open={true} />
          </>
        )}
      </div>
    </div>
  );
}
