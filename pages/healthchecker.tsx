import HealthCheckerComponent, { ApiChecker } from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useAddressesContext } from "@/contexts/AddressesContext";

import { ExplorerNodeApi } from "@/types/Node";
import { useState } from "react";

export default function HealthcheckerPage() {

  const {hiveChain, healthChecker, scoredEndpoints, setScoredEndpoints} = useHiveChainContext();
  const { nodeAddress, setNodeAddress } =
    useAddressesContext();
  const [providers, setProviders] = useState<string[]>([
    "https://api.hive.blog",
    "https://api.openhive.network",
    "https://anyx.io",
    "https://rpc.ausbit.dev",
    "https://rpc.mahdiyari.info",
    "https://techcoderx.com",
    "https://hive.roelandp.nl",
    "https://hived.emre.sh",
    "https://api.deathwing.me",
    "https://api.c0ff33a.uk",
    "https://hive-api.arcange.eu",
    "https://hive-api.3speak.tv",
    "https://hiveapi.actifit.io"
  ]);

  const extendedHiveChain = hiveChain
    ?.extend<ExplorerNodeApi>();


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
    validatorFunction: data => !!data,
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
  }

  const resetEndpoints = () => {
    endpointProviders = new Map<string, string>();
  }

  const addNewProvider = (provider: string) => {
    const newProvidersList = [...providers, provider];
    setProviders(newProvidersList);
  }

  const deleteProvider = (provider: string) => {
    const newProviders = [...providers].filter((previousProvider) => provider !== previousProvider);
    console.log('NEW PROVIDERS', newProviders);
    setProviders(newProviders);
  }


  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          currentAddress={nodeAddress ? nodeAddress : undefined} 
          changeNodeAddress={setNodeAddress} 
          customApiCheckers={checksMap}
          customApiList={providers}
          providersForEndpoints={endpointProviders}
          healthChecker={healthChecker}
          changeEndpointAddress={changeEndpointAddress} 
          resetEndpoints={resetEndpoints}
          setScoredEndpoints={setScoredEndpoints}
          addNewProvider={addNewProvider}
          deleteProvider={deleteProvider}
          scoredEndpoints={scoredEndpoints}
        />
      </div>
    </>
  );
}
