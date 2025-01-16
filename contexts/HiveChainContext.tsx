import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { createHiveChain, HealthChecker, IHiveChainInterface, TScoredEndpoint } from "@hiveio/wax";
import fetchingService from "@/services/FetchingService";
import { useAddressesContext } from "./AddressesContext";

type HiveChainContextType = {
  hiveChain: IHiveChainInterface | undefined;
  healthChecker: HealthChecker | undefined;
  scoredEndpoints: TScoredEndpoint[] | undefined;
  setScoredEndpoints: (scoredEndpoints: TScoredEndpoint[] | undefined ) => void;
  fallbacks: string[];
  setFallbacks: (fallbacks: string[]) => void;
};

export const HiveChainContext = createContext<HiveChainContextType>({
  hiveChain: undefined,
  healthChecker: undefined,
  scoredEndpoints: undefined,
  setScoredEndpoints: () => {},
  fallbacks: [],
  setFallbacks: () => {}
});

export const useHiveChainContext = () => {
  const context = useContext(HiveChainContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HiveChainContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(
    undefined
  );
  const [healthChecker, setHealthChecker] = useState<HealthChecker | undefined>(undefined);
  const [scoredEndpoints, setScoredEndpoints] = useState<TScoredEndpoint[] | undefined>(undefined);
  const [fallbacks, setFallbacks] = useState<string[]>([]);

  const {nodeAddress, setNodeAddress, localProviders, setLocalProviders} = useAddressesContext();

  const fallbacksRef = useRef(fallbacks);
  const nodeAddressRef = useRef(nodeAddress);


  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
    fetchingService.setHiveChain(chain);
  };

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
    createChain();
    createHealthChecker();
  }, []);

  useEffect(() => {
    fallbacksRef.current = fallbacks;
  }, [fallbacks]);

  useEffect(() => {
    nodeAddressRef.current = nodeAddress;
  }, [nodeAddress])

  return (
    <HiveChainContext.Provider value={{ hiveChain, healthChecker, scoredEndpoints, setScoredEndpoints, fallbacks, setFallbacks }}>
      {children}
    </HiveChainContext.Provider>
  );
};
