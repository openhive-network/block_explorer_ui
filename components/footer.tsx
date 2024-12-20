import { config } from "@/Config";
import { useAddressesContext } from "../contexts/AddressesContext";
import useHafbeVersion from "@/hooks/api/common/useHafbeVersion";
import AddressSwitchedDialog from "./AddressSwitchedDialog";
import Link from "next/link";

const { lastCommitHashRepoUrl, gitHash } = config;

export default function Footer() {
  const { hafbeVersionData } = useHafbeVersion();
  const current_year = new Date().getFullYear();
  const { nodeAddress, apiAddress, setNodeAddress, setApiAddress } =
    useAddressesContext();
  return (
    <div
      className="flex flex-col justify-center items-center bg-theme dark:bg-theme w-full mt-12 text-white text-sm"
      data-testid="footer"
    >
      <div className="flex flex-col md:flex-row justify-center gap-4 mt-4 md:mt-0">
        <p data-testid="footer-head">
          Block Explorer by HIVE &copy; {current_year}{" "}
        </p>
        <p data-testid="footer-last-commit-hash">
          <span>Last commit hash: </span>
          <Link
            target="_blank"
            href={lastCommitHashRepoUrl}
          >
            <span className="text-link">{gitHash}</span>
          </Link>
        </p>
        <p data-testid="footer-hafbe-version-hash">
          <span>Hafbe version hash: </span>
          {hafbeVersionData}
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-2 mt-4 md:mt-0">
        <AddressSwitchedDialog
          addressType="api"
          currentAddress={apiAddress}
          setAddress={setApiAddress}
        />
        <AddressSwitchedDialog
          addressType="node"
          currentAddress={nodeAddress}
          setAddress={setNodeAddress}
        />
      </div>
    </div>
  );
}
