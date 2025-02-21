import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, IHiveChainInterface, TScoredEndpoint, WaxHealthCheckerValidatorFailedError } from "@hiveio/wax";
import useApiAddresses from "@/utils/ApiAddresses";
import { ApiChecker } from "@/components/healthchecker/HealthChecker";
import { useApiAddressesContext } from "./ApiAddressesContext";


export type ValidationErrorDetails = {
  checkName: string;
  providerName: string;
  message: string;
  paths: string[];
  params?: string | object;
}

export interface HealthCheckerProps {
  apiCheckers: ApiChecker[];
  scoredEndpoints: TScoredEndpoint[] | undefined;
  failedChecksByProvider: Map<string, ValidationErrorDetails[]>;
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
  clearValidationError: (providerName: string, checkerName: string) => void;
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
    clearValidationError: () => {}
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
  hiveChain: IHiveChainInterface;
  apiCheckers: ApiChecker[];
  defaultProviders: string[];
  nodeAddress: string | null;
  setNodeAddress: (node: string) => void;
  children: React.ReactNode;
}> = ({ hiveChain, apiCheckers, defaultProviders, children }) => {

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
  const [failedChecksByProvider, setFailedChecksByProvider] = useState<Map<string, ValidationErrorDetails[]>>(new Map());
  const fallbacksRef = useRef(fallbacks);
  const nodeAddressRef = useRef(nodeAddress);
  const endpointTitleByIdRef = useRef(endpointTitleById);

  const markValidationError = (endpointId: number, providerName: string, error: WaxHealthCheckerValidatorFailedError<string>) => {
    const checkTitle = endpointTitleByIdRef.current.get(endpointId);
    if (checkTitle) {
      setFailedChecksByProvider((previousChecks) => {
        const checkObject: ValidationErrorDetails = {
        checkName: checkTitle,
        providerName: providerName,
        message: error.message,
        paths: error.apiEndpoint.paths,
        params: error.request.data,
      }
        const prevoiusFailedChecks = [...previousChecks.get(providerName) || [], checkObject];
        const newFailedChecks = structuredClone(previousChecks).set(providerName, prevoiusFailedChecks);
        return newFailedChecks
      })
    }
  } 

  const clearValidationError = (providerName: string, checkName: string) => {
    setFailedChecksByProvider((previousChecks) => {
      const failedChecks = [...previousChecks.get(providerName) || []].filter((failedCheck) => failedCheck.checkName !== checkName);
      const newFailedChecks = structuredClone(previousChecks).set(providerName, failedChecks);
      return newFailedChecks
    })
  }

  const createHealthChecker = async () => {
    const healthChecker = new HealthChecker();
    healthChecker?.on('error', error => console.error(error.message));
    healthChecker?.on("data", (data: Array<TScoredEndpoint>) => { 
      console.log(JSON.stringify(data)); 
      checkForFallbacks(data); 
      data.length ? setScoredEndpoints(data) : null 
    });
    healthChecker?.on("validationerror", error => markValidationError(error.apiEndpoint.id, error.request.endpoint, error));
    setHealthChecker(healthChecker);
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
      const heaalthCheckerEndpoints = await healthChecker?.register(checker!.method, checker!.params, checker!.validatorFunction, localProviders);
      if (heaalthCheckerEndpoints)
      registeredEndpoints.set(heaalthCheckerEndpoints.id, checker.title);
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
    writeLocalProvidersToLocalStorage(defaultProviders);
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
        resetProviders,
        clearValidationError
      }
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
