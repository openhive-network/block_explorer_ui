import HealthCheckerComponent, { ApiChecker } from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useAddressesContext } from "@/contexts/AddressesContext";

import { ExplorerNodeApi } from "@/types/Node";
import { useEffect, useState } from "react";
import { config } from "@/Config";

export default function HealthcheckerPage() {

  const {hiveChain, healthChecker, scoredEndpoints, setScoredEndpoints, fallbacks, setFallbacks} = useHiveChainContext();
  const { nodeAddress, setNodeAddress, localProviders, setLocalProviders } =
    useAddressesContext();
  const [providers, setProviders] = useState<string[]>(config.defaultProviders);

  const extendedHiveChain = hiveChain
    ?.extend<ExplorerNodeApi>();


  const checksMap = new Map<string, ApiChecker>()
  .set("reward_funds", {
    title: "Reward Funds",
    method: extendedHiveChain?.api.database_api.get_reward_funds,
    params: {}, 
    validatorFunction: data => !!data ? true : data,
  })
  .set("dynamic_global_properties", {
    title: "Dynamic Global",
    method: extendedHiveChain?.api.database_api.get_dynamic_global_properties,
    params: {}, 
    validatorFunction: data => !!data ? true : data,
  })
  .set("current_price_feed", {
    title: "Price Feed",
    method: extendedHiveChain?.api.database_api.get_current_price_feed,
    params: {}, 
    validatorFunction: data => !!data ? true : data,
  })
  .set("witness_schedule", {
    title: "Witness Schedule",
    method: extendedHiveChain?.api.database_api.get_witness_schedule,
    params: { id: 1 }, 
    validatorFunction: data => !!data ? true : data,
  })
  .set("vesting_delegations", {
    title: "Vesting Delegations",
    method: extendedHiveChain?.api.database_api.find_vesting_delegations,
    params: { account: "hiveio" }, 
    validatorFunction: data => !!data ? true : data,
  })
  .set("rc_direct_delegations", {
    title: "RC Direct Delegations",
    method: extendedHiveChain?.api.rc_api.list_rc_direct_delegations,
    params: { start: ["hiveio", ""], limit: 1000 }, 
    validatorFunction: data => !!data ? true : data,
  });

  const addNewProvider = (provider: string) => {
    setLocalProviders([...(localProviders || []), provider]);
  }

  const deleteProvider = (provider: string) => {
    const newLocalProviders = localProviders?.filter((node) => node !== provider) || [];
    setLocalProviders(newLocalProviders);
  }

  const registerFallback = (provider: string) => {
    if (!fallbacks.includes(provider) && fallbacks.length < 3) {
      setFallbacks([...fallbacks, provider])
    }
  }

  const removeFallback = (provider: string) => {
    setFallbacks(fallbacks.filter((fallback) => fallback !== provider));
  }

  useEffect(() => {
    console.log('SHOW ME!', localProviders);
    setProviders((providers) => [...providers, ...(localProviders || [])]);
  }, [localProviders])


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
          customProviders={[...providers]}
          healthChecker={healthChecker}
          setScoredEndpoints={setScoredEndpoints}
          addNewProvider={addNewProvider}
          deleteProvider={deleteProvider}
          registerFallback={registerFallback}
          scoredEndpoints={scoredEndpoints}
          fallbacks={fallbacks}
          removeFallback={removeFallback}
        />
      </div>
    </>
  );
}
