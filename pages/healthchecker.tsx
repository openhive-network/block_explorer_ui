import HealthCheckerComponent, { ApiChecker } from "@/components/healthchecker/HealthChecker";
import Head from "next/head";
import { useHiveChainContext } from "@/contexts/HiveChainContext";

import { ExplorerNodeApi } from "@/types/Node";
import { useEffect, useState } from "react";
import { config } from "@/Config";
import { useHealthCheckerContext } from "@/contexts/HealthCheckerContext";

export default function HealthcheckerPage() {

  const {hiveChain} = useHiveChainContext();
  const {
    healthChecker,
    scoredEndpoints,
    setScoredEndpoints,
    fallbacks,
    setFallbacks,
    nodeAddress,
    setNodeAddress,
    localProviders,
    setLocalProviders,
  } = useHealthCheckerContext();
  const [providers, setProviders] = useState<string[]>(config.defaultProviders);

  const extendedHiveChain = hiveChain
    ?.extend<ExplorerNodeApi>();


  const checksList: ApiChecker[] = [
    {
      title: "Reward Funds",
      method: extendedHiveChain?.api.database_api.get_reward_funds,
      params: {}, 
      validatorFunction: data => !!data ? true : data,
    },
    {
      title: "Dynamic Global",
      method: extendedHiveChain?.api.database_api.get_dynamic_global_properties,
      params: {}, 
      validatorFunction: data => !!data ? true : data,
    },
    {
      title: "Price Feed",
      method: extendedHiveChain?.api.database_api.get_current_price_feed,
      params: {}, 
      validatorFunction: data => !!data ? true : data,
    },
    {
      title: "Witness Schedule",
      method: extendedHiveChain?.api.database_api.get_witness_schedule,
      params: { id: 1 }, 
      validatorFunction: data => !!data ? true : data,
    },
    {
      title: "Vesting Delegations",
      method: extendedHiveChain?.api.database_api.find_vesting_delegations,
      params: { account: "hiveio" }, 
      validatorFunction: data => !!data ? true : data,
    },
    {
      title: "RC Direct Delegations",
      method: extendedHiveChain?.api.rc_api.list_rc_direct_delegations,
      params: { start: ["hiveio", ""], limit: 1000 }, 
      validatorFunction: data => !!data ? true : data,
    }
  ]

  const addNewProvider = (provider: string) => {
    if (localProviders) {
      setLocalProviders([...(localProviders || []), provider]);
    } else {
      setLocalProviders([...config.defaultProviders, provider]);
    }
  }

  const deleteProvider = (provider: string) => {
    if (localProviders) {
      const newLocalProviders = localProviders?.filter((node) => node !== provider);
      setLocalProviders(newLocalProviders);
    } else {
      const newLocalProviders = config.defaultProviders?.filter((node) => node !== provider);
      setLocalProviders(newLocalProviders);
    }
    removeFallback(provider);
  }

  const resetProviders = () => {
    setLocalProviders(config.defaultProviders);
    setScoredEndpoints([]);
  }

  const registerFallback = (provider: string) => {
    if (!fallbacks?.includes(provider)) {
      setFallbacks([...fallbacks || [], provider])
    }
  }

  const removeFallback = (provider: string) => {
    setFallbacks(fallbacks?.filter((fallback) => fallback !== provider) || []);
  }

  const changeNodeAddress = (nodeAddress: string | null) => {
    if (nodeAddress) {
      removeFallback(nodeAddress);
      setNodeAddress(nodeAddress);
    }
  }

  useEffect(() => {
    if (localProviders) setProviders(localProviders);
  }, [localProviders])

  return (
    <>
      <Head>
        <title>Healthchecker</title>
      </Head>
      <div className="md:m-8 max-w-[100vw]">
        <HealthCheckerComponent 
          currentAddress={nodeAddress ? nodeAddress : undefined} 
          changeNodeAddress={changeNodeAddress} 
          customApiCheckers={checksList}
          customProviders={providers}
          healthChecker={healthChecker}
          setScoredEndpoints={setScoredEndpoints}
          addNewProvider={addNewProvider}
          deleteProvider={deleteProvider}
          registerFallback={registerFallback}
          scoredEndpoints={scoredEndpoints}
          fallbacks={fallbacks || []}
          removeFallback={removeFallback}
          resetProviders={resetProviders}
        />
      </div>
    </>
  );
}
