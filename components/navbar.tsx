import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { useBlockchainSyncInfo, useMediaQuery } from "@/utils/Hooks";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toggle } from "./ui/toggle";
import { useUserSettingsContext } from "./contexts/UserSettingsContext";
import { useAlertContext } from "./contexts/AlertContext";
import Alert from "./Alert";
import SyncInfo from "./home/SyncInfo";

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings, setSettings } = useUserSettingsContext();
  const { alerts, setAlerts } = useAlertContext();

  const { explorerBlockNumber, hiveBlockNumber, explorerTime, hiveBlockTime, loading: syncLoading } =
    useBlockchainSyncInfo();

  const blockDifference = (hiveBlockNumber || 0) - (explorerBlockNumber || 0);

  return (
    <div className="fixed w-full top-0 z-50" data-testid="navbar">
      <div className="flex p-2 justify-between bg-explorer-dark-gray text-white	items-center relative">
        <div className="absolute top-full left-0 w-full">
          {alerts.map((alert, index) => (
            <Alert
              key={index.toString() + alert.message}
              alert={alert}
              onClose={() =>
                setAlerts(
                  alerts.filter(
                    (prevAlert, prevIndex) =>
                      index !== prevIndex && alert.message !== prevAlert.message
                  )
                )
              }
            />
          ))}
        </div>
        {isMobile ? (
          <div className="flex items-center justify-between w-full">
            <Link href={"/"} className="pr-3 relative">
              <Image
                src="/hive-logo.png"
                alt="Hive logo"
                width={40}
                height={40}
              />
              <SyncInfo />
            </Link>
            <div className="flex-grow flex items-center justify-end gap-x-3">
              <SearchBar />
              <Menu height={34} width={34} onClick={() => setMenuOpen(true)} />
            </div>
            <div
              className={cn(
                "fixed top-0 left-0 bg-explorer-dark-gray w-screen h-screen translate-x-full duration-500 z-50",
                { "translate-x-0": menuOpen }
              )}
            >
              <div className="w-full flex items-center justify-end py-3 px-2">
                <X onClick={() => setMenuOpen(false)} height={40} width={40} />
              </div>
              <div className="flex flex-col px-4 text-2xl gap-y-2">
                <Link href={"/witnesses"} onClick={() => setMenuOpen(false)}>
                  Witnesses
                </Link>
                <Toggle
                  checked={settings.rawJsonView}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      rawJsonView: !settings.rawJsonView,
                    })
                  }
                  leftLabel="Raw Json view"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center pl-12 gap-x-4">
              <Link
                href={"/"}
                className="pr-2 flex justify-normal items-center text-explorer-turquoise font-medium"
              >
                <Image
                  src="/hive-logo.png"
                  alt="Hive logo"
                  width={50}
                  height={50}
                  data-testid="hive-logo"
                />
                <div className="ml-4" data-testid="hive-block-explorer">
                  Hive Block Explorer
                </div>
              </Link>
              <SyncInfo />
              <Link href={"/witnesses"} data-testid="navbar-witnesses-link">
                Witnesses
              </Link>
              <Toggle
                data-testid="toggle"
                checked={settings.rawJsonView}
                onClick={() =>
                  setSettings({
                    ...settings,
                    rawJsonView: !settings.rawJsonView,
                  })
                }
                leftLabel="Raw Json view"
                className="ml-6"
              />
            </div>
            <SearchBar />
          </>
        )}
      </div>
    </div>
  );
}
