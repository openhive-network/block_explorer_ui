import HealthCheckerComponent, { ApiChecker } from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useAddressesContext } from "@/contexts/AddressesContext";

import { ExplorerNodeApi } from "@/types/Node";

export default function HealthcheckerPage() {

  const {hiveChain} = useHiveChainContext();
  const { nodeAddress, apiAddress, setNodeAddress, setApiAddress } =
    useAddressesContext();

  const extendedHiveChain = hiveChain
    ?.extend<ExplorerNodeApi>();

    const apiList = [
      "https://api.hive.blog",
      "https://api.openhive.network",
      "https://anyx.io",
      "https://techcoderx.com",
      "https://hive.roelandp.nl",
    ];

  const checksMap = new Map<string, ApiChecker>()
  .set("reward_funds", {
    title: "Reward Funds",
    method: extendedHiveChain?.api.database_api.get_reward_funds,
    params: {}, 
    validatorFunction: data => !!data,
  })
  .set("dynamic_global_properties", {
    title: "Dynamic Global",
    method: extendedHiveChain?.api.database_api.get_dynamic_global_properties,
    params: {}, 
    validatorFunction: data => !!data,
  })
  .set("current_price_feed", {
    title: "Price Feed",
    method: extendedHiveChain?.api.database_api.get_current_price_feed,
    params: {}, 
    validatorFunction: data => !!data,
  })
  .set("witness_schedule", {
    title: "Witness Schedule",
    method: extendedHiveChain?.api.database_api.get_witness_schedule,
    params: { id: 1 }, 
    validatorFunction: data => !!data.result,
  })
  .set("vesting_delegations", {
    title: "Vesting Delegations",
    method: extendedHiveChain?.api.database_api.find_vesting_delegations,
    params: { account: "hiveio" }, 
    validatorFunction: data => !!data,
  })
  .set("rc_direct_delegations", {
    title: "RC Direct Delegations",
    method: extendedHiveChain?.api.rc_api.list_rc_direct_delegations,
    params: { start: ["hiveio", ""], limit: 1000 }, 
    validatorFunction: data => !!data,
  });

  let endpointProviders = new Map<string, string>();

  const changeEndpointAddress = (endpoint: string, newProvider: string) => {
    endpointProviders.set(endpoint, newProvider);
    console.log("ENDPOIN PROVCIDERS", endpointProviders);
  }

  const resetEndpoints = () => {
    endpointProviders = new Map<string, string>();
  }


  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          hiveChain={hiveChain} 
          currentAddress={nodeAddress ? nodeAddress : undefined} 
          changeNodeAddress={setNodeAddress} 
          customApiCheckers={checksMap}
          customApiList={apiList}
          providersForEndpoints={endpointProviders}
          changeEndpointAddress={changeEndpointAddress} 
          resetEndpoints={resetEndpoints}
        />
      </div>
    </>
  );
}
