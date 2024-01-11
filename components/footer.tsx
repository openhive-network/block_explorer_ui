import useHafbeVersion from "@/api/common/useHafbeVersion";
import { config } from "@/Config";

export default function Footer() {

  const {hafbeVersionData} = useHafbeVersion()
  const current_year = new Date().getFullYear();
  return (
    <div className="flex flex-col justify-center items-center bg-explorer-dark-gray w-full mt-12 text-white text-sm">
      <p className="mb-2">Block Explorer by HIVE &copy; {current_year} </p>
      <p className="mb-2"><span>Last commit hash: </span>{config.gitHash}</p>
      <p className="mb-2"><span>Hafbe version hash: </span>{hafbeVersionData}</p>
    </div>
  );
}