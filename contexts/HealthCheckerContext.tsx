import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, IHiveEndpoint, TScoredEndpoint, WaxHealthCheckerValidatorFailedError } from "@hiveio/wax";
import { useHiveChainContext } from "./HiveChainContext";
import useApiAddresses from "@/utils/ApiAddresses";
import { ApiChecker } from "@/components/healthchecker/HealthChecker";
import { ExplorerNodeApi } from "@/types/Node";
import { config } from "@/Config";
import { useApiAddressesContext } from "./ApiAddressesContext";

export interface HealthCheckerProps {
  apiCheckers: ApiChecker[];
  scoredEndpoints: TScoredEndpoint[] | undefined;
  failedChecksByProvider: Map<string, string[]>;
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  fallbacks?: string[];
  setFallbacks: (fallbacks: string[]) => void;
  nodeAddress: string | null;
  setNodeAddress: (address: string | null) => void;
  localProviders?: string[];
  setLocalProviders: (nodes: string[]) => void;
  addProvider: (provider: string) => void;
  removeProvider: (provider: string) => void;
  resetProviders: () => void;
}

type HealthCheckerContextType = {
  healthCheckerProps: HealthCheckerProps
};

export const HealthCheckerContext = createContext<HealthCheckerContextType>({
  healthCheckerProps: {
    apiCheckers: [],
    scoredEndpoints: undefined,
    failedChecksByProvider: new Map(),
    setScoredEndpoints: () => {},
    fallbacks: [],
    setFallbacks: () => {},
    nodeAddress: "",
    setNodeAddress: () => {},
    localProviders: undefined,
    setLocalProviders: () => {},
    addProvider: () => {},
    removeProvider: () => {},
    resetProviders: () => {},
  }
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
      localProviders,
      fallbacks,
      writeLocalProvidersToLocalStorage,
      writeFallbacksToLocalStorage,
    } = useApiAddresses();

    const {nodeAddress, setNodeAddress} = useApiAddressesContext();

  const [healthChecker, setHealthChecker] = useState<HealthChecker | undefined>(undefined);
  const [scoredEndpoints, setScoredEndpoints] = useState<TScoredEndpoint[] | undefined>(undefined);
  const [chainInitialized, setChainIntialized] = useState<boolean>(false);
  const [endpointTitleById, setEndpointTitleById] = useState<Map<number, string>>(new Map());
  const [failedChecksByProvider, setFailedChecksByProvider] = useState<Map<string, string[]>>(new Map());
  const fallbacksRef = useRef(fallbacks);
  const nodeAddressRef = useRef(nodeAddress);
  const endpointTitleByIdRef = useRef(endpointTitleById);

  const extendedHiveChain = hiveChain
  ?.extend<ExplorerNodeApi>();


const apiCheckers: ApiChecker[] = [
  {
    title: "Reward Funds",
    method: extendedHiveChain?.api.database_api.get_reward_funds,
    params: {}, 
    validatorFunction: data => !!data.funds ? true : "Reward funds error",
  },
  {
    title: "Dynamic Global",
    method: extendedHiveChain?.api.database_api.get_dynamic_global_properties,
    params: {}, 
    validatorFunction: data => data.id === 0 ? true : "Dynamic global error",
  },
  {
    title: "Price Feed",
    method: extendedHiveChain?.api.database_api.get_current_price_feed,
    params: {}, 
    validatorFunction: data => !!data.base ? true : "Price feed error",
  },
  {
    title: "Witness Schedule",
    method: extendedHiveChain?.api.database_api.get_witness_schedule,
    params: { id: 1 }, 
    validatorFunction: data => /*data.max_scheduled_witnesses === 21*/ !!data ? true : "Witness schedule error",
    // This is left wrong on purpose for tests
  },
  {
    title: "Vesting Delegations",
    method: extendedHiveChain?.api.database_api.find_vesting_delegations,
    params: { account: "hiveio" }, 
    validatorFunction: data => !!data.delegations ? true : "Vesting delegations error",
  },
  {
    title: "RC Direct Delegations",
    method: extendedHiveChain?.api.rc_api.list_rc_direct_delegations,
    params: { start: ["hiveio", ""], limit: 1000 }, 
    validatorFunction: data => !!data.rc_direct_delegations ? true : "RC delegation error",
  }
]

  const markValidationError = (endpointId: number, provider: string) => {
    const checkTitle = endpointTitleByIdRef.current.get(endpointId);
    if (checkTitle) {
      setFailedChecksByProvider((previousChecks) => {
        const prevoiusFailedChecks = [...previousChecks.get(provider) || [], checkTitle];
        const newFailedChecks = structuredClone(previousChecks).set(provider, prevoiusFailedChecks);
        return newFailedChecks
      })
    }
  } 

  const createHealthChecker = async () => {
    const healthChecker = new HealthChecker();
    setHealthChecker(healthChecker);
    healthChecker?.on('error', error => console.error(error.message));
    healthChecker?.on("data", (data: Array<TScoredEndpoint>) => { 
      console.log(JSON.stringify(data)); 
      checkForFallbacks(data); 
      data.length ?setScoredEndpoints(data) : null 
    });
    healthChecker?.on("validationerror", error => markValidationError(error.apiEndpoint.id, error.request.endpoint));
  }

  const checkForFallbacks = (scoredEndpoints: TScoredEndpoint[]) => {
    const currentScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === nodeAddressRef.current);
    if (currentScoredEndpoint && !currentScoredEndpoint.up) {
      fallbacksRef.current?.forEach((fallback) => {
        const fallbackScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === fallback);
        if (fallbackScoredEndpoint && fallbackScoredEndpoint.up) setNodeAddress(fallback);
      })
    }
  }

  const registerCalls = async () => {
    const registeredEndpoints = new Map<number, string>();
    for (const checker of apiCheckers) {
      const testHC = await healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, localProviders);
      if (testHC)
      registeredEndpoints.set(testHC.id, checker.title);
    }
    setEndpointTitleById(registeredEndpoints);
  }

  const initializeDefaultChecks = async () => {
    const initialEndpoints: TScoredEndpoint[] | undefined = localProviders?.map((customProvider) => ({endpointUrl: customProvider, score: -1, up: true, latencies: []}))
    if (!!initialEndpoints && !scoredEndpoints) setScoredEndpoints(initialEndpoints);
    registerCalls()
    setChainIntialized(true);
  }

  const removeFallback = (provider: string) => {
    writeFallbacksToLocalStorage(fallbacks?.filter((fallback) => fallback !== provider) || []);
  }

  const addProvider = (provider: string) => {
    if (healthChecker) {
      for (const endpoint of healthChecker) {
        endpoint.addEndpointUrl(provider);
      }
      if (localProviders && !localProviders.some((localProvider) => provider === localProvider)) {
        writeLocalProvidersToLocalStorage([...(localProviders || []), provider]);
        setScoredEndpoints([...scoredEndpoints || [], {endpointUrl: provider, score: -1, up: true, latencies: []}])
      }
    }
  }

  const removeProvider = (provider: string) => {
    if (healthChecker && localProviders)
    for (const endpoint of healthChecker) {
      endpoint.removeEndpointUrl(provider);
    }
    const newLocalProviders = localProviders?.filter((localProvider) => localProvider !== provider) || [];
    setScoredEndpoints(scoredEndpoints?.filter((endpoint) => endpoint.endpointUrl !== provider));
    writeLocalProvidersToLocalStorage(newLocalProviders);
    removeFallback(provider);
  }

  const resetProviders = () => {
    writeLocalProvidersToLocalStorage(config.defaultProviders);
    setScoredEndpoints([]);
    healthChecker?.unregisterAll();
    registerCalls();
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
    endpointTitleByIdRef.current = endpointTitleById
  }, [endpointTitleById])

  useEffect(() => { 
    if (healthChecker && !chainInitialized) {
      initializeDefaultChecks();
    }
  }, [chainInitialized, healthChecker, initializeDefaultChecks])

  return (
    <HealthCheckerContext.Provider value={{
      healthCheckerProps: {
        apiCheckers,
        scoredEndpoints, 
        failedChecksByProvider,
        setScoredEndpoints, 
        fallbacks, 
        setFallbacks: writeFallbacksToLocalStorage,
        localProviders,
        nodeAddress,
        setNodeAddress,
        setLocalProviders: writeLocalProvidersToLocalStorage,
        addProvider,
        removeProvider,
        resetProviders
      }
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
