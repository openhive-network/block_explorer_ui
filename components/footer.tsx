import React from "react";
import Link from "next/link";
import Image from "next/image";
import { config } from "@/Config";
import { useAddressesContext } from "../contexts/AddressesContext";
import useHafbeVersion from "@/hooks/api/common/useHafbeVersion";
import AddressSwitchedDialog from "./AddressSwitchedDialog";
import { useTheme } from "@/contexts/ThemeContext";

const { lastCommitHashRepoUrl, gitHash } = config;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { hafbeVersionData } = useHafbeVersion();
  const { nodeAddress, apiAddress, setNodeAddress, setApiAddress } =
    useAddressesContext();

  const { theme } = useTheme();

  const isDarkMode = theme === "dark"; // Check if the theme is dark

  return (
    <footer className="w-full bg-theme mt-5 border-t border-gray-200 dark:border-gray-700">
      <div className="container py-4">
        {/* Container for content */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Top section */}
          <div className="flex items-center">
            <Link href={"/"} className="relative pr-2">
              <Image
                src="/hive-logo.png"
                alt="Hive logo"
                width={20}
                height={20}
                priority
              />
            </Link>
            <div className="text-sm font-semibold">HIVE Block Explorer</div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <div className="flex items-center space-x-2">
              <Link
                href="https://twitter.com/hiveblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="X (Twitter)"
              >
                <Image
                  src={isDarkMode ? "/icons/x_dark.png" : "/icons/x.png"}
                  alt="X (Twitter)"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="https://t.me/hiveblockchain"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="Telegram"
              >
                <Image
                  src={
                    isDarkMode
                      ? "/icons/telegram_dark.png"
                      : "/icons/telegram.png"
                  }
                  alt="Telegram"
                  width={20}
                  height={20}
                />
              </Link>
              {/*
              <Link
                href="https://myhive.li/discord"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="Discord"
              >
                <Image
                  src={
                    isDarkMode
                      ? "/icons/discord_dark.png"
                      : "/icons/discord.png"
                  }
                  alt="Discord"
                  width={20}
                  height={20}
                />
              </Link>
              */}
              <Link
                href="https://www.facebook.com/hiveblocks/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="Facebook"
              >
                <Image
                  src={
                    isDarkMode
                      ? "/icons/facebook_dark.png"
                      : "/icons/facebook.png"
                  }
                  alt="Facebook"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="https://www.instagram.com/hiveblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="Instagram"
              >
                <Image
                  src={
                    isDarkMode
                      ? "/icons/instagram_dark.png"
                      : "/icons/instagram.png"
                  }
                  alt="Instagram"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCwM89V7NzVIHizgWT3GxhwA"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-75"
                aria-label="YouTube"
              >
                <Image
                  src={
                    isDarkMode
                      ? "/icons/youtube_dark.png"
                      : "/icons/youtube.png"
                  }
                  alt="YouTube"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Columns */}
          <div>
            <h4 className="text-md font-semibold mb-2 dark:text-white">
              Explore
            </h4>
            {/* Header */}
            <ul className="list-none p-0">
              <li>
                <Link
                  href="https://hive.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hive"
                  className="hover:opacity-75"
                >
                  Hive Official
                </Link>
              </li>

              <li>
                <Link
                  href="https://hive.blog/@hiveio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hive"
                  className="hover:opacity-75"
                >
                  Hive Blog
                </Link>
              </li>

              <li>
                <Link href="/witnesses" className="hover:opacity-75">
                  Witnesses
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:opacity-75">
                  Witness Schedule
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-2 dark:text-white">
              Resources
            </h4>
            {/* Header */}
            <ul className="list-none p-0">
              <li>
                <Link
                  href="https://developers.hive.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75"
                >
                  Hive Developer Portal
                </Link>
              </li>
              <li>
                <Link
                  href="https://developers.hive.io/glossary/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75"
                >
                  Hive Glossary
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/openhive-network/hive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75"
                  aria-label="GitHub"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://gitlab.hive.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-75"
                  aria-label="GitLab"
                >
                  {" "}
                  Gitlab
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-2 dark:text-white">
              Technical
            </h4>
            {/* Header */}
            <ul className="list-none p-0 ">
              <li>
                <span>Last Commit #: </span>
                <Link
                  href={lastCommitHashRepoUrl}
                  target="_blank"
                  className="hover:opacity-75"
                >
                  {/* Hover Color */}
                  <span className="text-link">{gitHash}</span>
                </Link>
              </li>
              <li>
                <span>Hafbe version #: </span>
                {hafbeVersionData}
              </li>
              <li>
                <AddressSwitchedDialog
                  addressType="api"
                  currentAddress={apiAddress}
                  setAddress={setApiAddress}
                />
              </li>
              <li>
                <AddressSwitchedDialog
                  addressType="node"
                  currentAddress={nodeAddress}
                  setAddress={setNodeAddress}
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-left text-xs">
          <p>© {currentYear} HIVE Block Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
