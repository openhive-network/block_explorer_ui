import HealthCheckerComponent, { ApiChecker } from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/components/contexts/HiveChainContext";
import { useAddressesContext } from "@/components/contexts/AddressesContext";

export default function HealthcheckerPage() {

  const {hiveChain} = useHiveChainContext();
  const { nodeAddress, apiAddress, setNodeAddress, setApiAddress } =
    useAddressesContext();

  const checksMap = new Map<string, ApiChecker>().set("block_api", {
    title: "Block API",
    method: hiveChain?.api.block_api.get_block, 
    params: {block_num: 1}, 
    validatorFunction: data => data.block?.previous === "0000000000000000000000000000000000000000"
  })
  .set("find_account", {
    title: "Find Account",
    method: hiveChain?.api.database_api.find_accounts,
    params: {accounts: ["hiveio"]},
    validatorFunction: (data) => !!data
  })
  .set("account_by_key", {
    title: "Account by key",
    method: hiveChain?.api.account_by_key_api.get_key_references,
    params: {accounts: ["hiveio"]},
    validatorFunction: (data) => !!data
  });


  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent hiveChain={hiveChain} currentAddress={nodeAddress ? nodeAddress : undefined} changeNodeAddress={setNodeAddress} customApiCheckers={checksMap}/>
      </div>
    </>
  );
}
