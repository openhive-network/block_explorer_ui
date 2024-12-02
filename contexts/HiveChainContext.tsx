import React, { createContext, useContext, useState, useEffect } from "react";
import { createHiveChain, HealthChecker, IHiveChainInterface, IScoredEndpoint } from "@hiveio/wax";
import fetchingService from "@/services/FetchingService";

type HiveChainContextType = {
  hiveChain: IHiveChainInterface | undefined;
  healthChecker: HealthChecker | undefined;
  scoredEndpoints: IScoredEndpoint[] | undefined;
  setScoredEndpoints: (scoredEndpoints: IScoredEndpoint[] | undefined ) => void;
};

export const HiveChainContext = createContext<HiveChainContextType>({
  hiveChain: undefined,
  healthChecker: undefined,
  scoredEndpoints: undefined,
  setScoredEndpoints: () => {},
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
  const [scoredEndpoints, setScoredEndpoints] = useState<IScoredEndpoint[] | undefined>(undefined);

  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
    fetchingService.setHiveChain(chain);
  };

  const createHealthChecker = async () => {
    const healthChecker = new HealthChecker();
    setHealthChecker(healthChecker);
    healthChecker?.on('error', error => console.error(error.message));
    healthChecker?.on("data", (data: Array<IScoredEndpoint>) => { console.log(JSON.stringify(data)); data.length ?setScoredEndpoints(data) : null });
  }

  useEffect(() => {
    createChain();
    createHealthChecker();
  }, []);

  return (
    <HiveChainContext.Provider value={{ hiveChain, healthChecker, scoredEndpoints, setScoredEndpoints }}>
      {children}
    </HiveChainContext.Provider>
  );
};
