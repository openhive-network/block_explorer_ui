import Link from "next/link"
import Image from 'next/image'
import SearchBar from "./SearchBar"

export default function Navbar () {
  return (
    <div className="flex p-2 justify-between bg-explorer-dark-gray text-white	items-center w-full">

      <div className="flex items-center	pl-12">
        <Link href={"/"} className="pr-12">
          <Image src="/hive-logo.png" alt="Hive logo" width={50} height={50} />
        </Link>
        <Link href={"/witnesses"}>
          Witnesses
        </Link>
      </div>


      <SearchBar />
    </div>
  )
}