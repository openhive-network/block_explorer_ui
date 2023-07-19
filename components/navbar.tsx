import Link from "next/link"
import { Input } from "./ui/input"

export default function Navbar () {
  return (
    <div className="flex">

      <Link href={"/"}>
        Witnesses
      </Link>

      <Input type="text" placeholder="Search user, block, transaction" />
    </div>
  )
}