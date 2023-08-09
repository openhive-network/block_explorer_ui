import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { useMediaQuery } from "@/utils/Hooks";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex p-2 justify-between bg-explorer-dark-gray text-white	items-center w-full">
      {isMobile ? (
        <div className="flex items-center justify-between w-full">
          <Link href={"/"} className="pr-3">
            <Image
              src="/hive-logo.png"
              alt="Hive logo"
              width={40}
              height={40}
            />
          </Link>
          <div className="flex-grow flex items-center justify-end gap-x-3">
            <SearchBar />
            <Menu height={34} width={34} onClick={() => setMenuOpen(true)} />
          </div>
          <div
            className={cn(
              "fixed top-0 left-0 bg-explorer-dark-gray w-screen h-screen translate-x-full duration-500",
              { "translate-x-0": menuOpen }
            )}
          >
            <div className="w-full flex items-center justify-end py-3 px-2">
              <X onClick={() => setMenuOpen(false)} height={40} width={40} />
            </div>
            <div className="flex flex-col px-4 text-2xl">
              <Link href={"/witnesses"} onClick={() => setMenuOpen(false)}>
                Witnesses
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center	pl-12">
            <Link href={"/"} className="pr-12">
              <Image
                src="/hive-logo.png"
                alt="Hive logo"
                width={50}
                height={50}
              />
            </Link>
            <Link href={"/witnesses"}>Witnesses</Link>
          </div>

          <SearchBar />
        </>
      )}
    </div>
  );
}
