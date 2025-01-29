import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, TScoredEndpoint } from "@hiveio/wax";
import { useHiveChainContext } from "./HiveChainContext";
import useApiAddresses from "@/utils/ApiAddresses";

type HealthCheckerContextType = {
  healthChecker: HealthChecker | undefined;
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
  healthChecker: undefined,
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
  const fallbacksRef = useRef(fallbacks);
  const nodeAddressRef = useRef(nodeAddress);

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

  return (
    <HealthCheckerContext.Provider value={{ 
      healthChecker, 
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
