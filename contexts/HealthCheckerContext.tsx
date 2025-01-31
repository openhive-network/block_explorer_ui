import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, TScoredEndpoint } from "@hiveio/wax";
import { useHiveChainContext } from "./HiveChainContext";
import useApiAddresses from "@/utils/ApiAddresses";
import { ApiChecker } from "@/components/healthchecker/HealthChecker";
import { ExplorerNodeApi } from "@/types/Node";
import { config } from "@/Config";

type HealthCheckerContextType = {
  apiCheckers: ApiChecker[];
  scoredEndpoints: TScoredEndpoint[] | undefined;
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  fallbacks?: string[];
  setFallbacks: (fallbacks: string[]) => void;
  apiAddress: string | null;
  setApiAddress: (address: string | null) => void;
  nodeAddress: string | null;
  setNodeAddress: (address: string | null) => void;
  localProviders?: string[];
  setLocalProviders: (nodes: string[]) => void;
};

export const HealthCheckerContext = createContext<HealthCheckerContextType>({
  apiCheckers: [],
  scoredEndpoints: undefined,
  setScoredEndpoints: () => {},
  fallbacks: [],
  setFallbacks: () => {},
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {},
  localProviders: undefined,
  setLocalProviders: () => {},
});

export const useHealthCheckerContext = () => {
  const context = useContext(HealthCheckerContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HealthCheckerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
    const {hiveChain} = useHiveChainContext();

    const {
      apiAddress,
      nodeAddress,
      localProviders,
      fallbacks,
      writeApiAddressToLocalStorage,
      writeNodeAddressToLocalStorage,
      writeLocalProvidersToLocalStorage,
      writeFallbacksToLocalStorage,
    } = useApiAddresses();

  const [healthChecker, setHealthChecker] = useState<HealthChecker | undefined>(undefined);
  const [scoredEndpoints, setScoredEndpoints] = useState<TScoredEndpoint[] | undefined>(undefined);
  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const fallbacksRef = useRef(fallbacks);
  const nodeAddressRef = useRef(nodeAddress);

  const extendedHiveChain = hiveChain
  ?.extend<ExplorerNodeApi>();


const apiCheckers: ApiChecker[] = [
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

  const createHealthChecker = async () => {
    const healthChecker = new HealthChecker();
    setHealthChecker(healthChecker);
    healthChecker?.on('error', error => console.error(error.message));
    healthChecker?.on("data", (data: Array<TScoredEndpoint>) => { console.log(JSON.stringify(data)); checkForFallbacks(data); data.length ?setScoredEndpoints(data) : null });
  }

  const checkForFallbacks = (scoredEndpoints: TScoredEndpoint[]) => {
    const currentScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === nodeAddressRef.current);
    if (currentScoredEndpoint && !currentScoredEndpoint.up) {
      fallbacksRef.current?.forEach((fallback) => {
        const fallbackScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === fallback);
        if (fallbackScoredEndpoint && fallbackScoredEndpoint.up) writeNodeAddressToLocalStorage(fallback);
      })
    }
  }

  const initializeDefaultChecks = () => {
    const initialEndpoints: TScoredEndpoint[] | undefined = localProviders?.map((customProvider) => ({endpointUrl: customProvider, score: 1, up: true, lastLatency: 0}))
    if (!!initialEndpoints && !scoredEndpoints) setScoredEndpoints(initialEndpoints);
    subscribeToCheckers();
    setChainIntialized(true);
  }

  const subscribeToCheckers = () => {
    healthChecker?.unregisterAll();
    for (const checker of apiCheckers) {
      healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, localProviders);
    }
  }

  useEffect(() => {
    if (hiveChain) {
      createHealthChecker();
    }
  }, [hiveChain]);

  useEffect(() => {
    fallbacksRef.current = fallbacks;
  }, [fallbacks]);

  useEffect(() => {
    nodeAddressRef.current = nodeAddress;
  }, [nodeAddress])

  useEffect(() => {
    if (localProviders) {
      subscribeToCheckers();
    }
  }, [localProviders])

  useEffect(() => { 
    if (healthChecker && !chainInitialized) {
      initializeDefaultChecks();
    }
  }, [chainInitialized, healthChecker, initializeDefaultChecks])

  return (
    <HealthCheckerContext.Provider value={{ 
      apiCheckers,
      scoredEndpoints, 
      setScoredEndpoints, 
      fallbacks, 
      setFallbacks: writeFallbacksToLocalStorage,
      apiAddress,
      setApiAddress: writeApiAddressToLocalStorage,
      nodeAddress,
      setNodeAddress: writeNodeAddressToLocalStorage,
      localProviders,
      setLocalProviders: writeLocalProvidersToLocalStorage,
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
