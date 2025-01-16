import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, TScoredEndpoint } from "@hiveio/wax";
import { useAddressesContext } from "./AddressesContext";
import { useHiveChainContext } from "./HiveChainContext";

type HealthCheckerContextType = {
  healthChecker: HealthChecker | undefined;
  scoredEndpoints: TScoredEndpoint[] | undefined;
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  fallbacks: string[];
  setFallbacks: (fallbacks: string[]) => void;
};

export const HealthCheckerContext = createContext<HealthCheckerContextType>({
  healthChecker: undefined,
  scoredEndpoints: undefined,
  setScoredEndpoints: () => {},
  fallbacks: [],
  setFallbacks: () => {}
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

  const [healthChecker, setHealthChecker] = useState<HealthChecker | undefined>(undefined);
  const [scoredEndpoints, setScoredEndpoints] = useState<TScoredEndpoint[] | undefined>(undefined);
  const [fallbacks, setFallbacks] = useState<string[]>([]);

  const {nodeAddress, setNodeAddress, localProviders, setLocalProviders} = useAddressesContext();

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
      fallbacksRef.current.forEach((fallback) => {
        const fallbackScoredEndpoint = scoredEndpoints.find((scoredEdnpoint) => scoredEdnpoint.endpointUrl === fallback);
        if (fallbackScoredEndpoint && fallbackScoredEndpoint.up) setNodeAddress(fallback);
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
    <HealthCheckerContext.Provider value={{ healthChecker, scoredEndpoints, setScoredEndpoints, fallbacks, setFallbacks }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
