import useHafbeVersion from "@/api/common/useHafbeVersion";
import { config } from "@/Config";

export default function Footer() {
  const { hafbeVersionData } = useHafbeVersion();
  const current_year = new Date().getFullYear();
  return (
    <div
      className="flex flex-col justify-center items-center bg-explorer-dark-gray w-full mt-12 text-white text-sm"
      data-testid="footer"
    >
      <div className="flex flex-row justify-center gap-4">
        <p  data-testid="footer-head">Block Explorer by HIVE &copy; {current_year} </p>
        <p data-testid="footer-last-commit-hash">
          <span>Last commit hash: </span>
          {config.gitHash}
        </p>
        <p data-testid="footer-hafbe-version-hash">
          <span>Hafbe version hash: </span>
          {hafbeVersionData}
        </p>
      </div>
      <div className="flex flex-row justify-center gap-4">
        <p data-testid="footer-api-adress">
          <span>API address: </span>
          {config.apiAddress}
        </p>
        <p data-testid="footer-node-address">
          <span>Hive node: </span>
          {config.nodeAddress}
        </p>
      </div>
    </div>
  );
}
