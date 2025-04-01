import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker } from "@hiveio/wax";
import { ApiChecker } from "@/services/HealthCheckerService";
import { useApiAddressesContext } from "./ApiAddressesContext";
// import HealthCheckerService, { HealthCheckerFields } from "@/services/HealthCheckerService";
import {HealthCheckerService} from "@hiveio/healthchecker-component";
import { useHiveChainContext } from "./HiveChainContext";


type HealthCheckerContextType = {
    healthCheckerService?: HealthCheckerService;
};



export const HealthCheckerServiceContext = createContext<HealthCheckerContextType>({
    healthCheckerService: undefined,
}
);

export const useHealthCheckerServiceContext = () => {
  const context = useContext(HealthCheckerServiceContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HealthCheckerServiceContextProvider: React.FC<{
  apiCheckers: ApiChecker[];
  defaultProviders: string[];
  nodeAddress: string | null;
  setNodeAddress: (node: string) => void;
  children: React.ReactNode;
}> = ({ apiCheckers, defaultProviders, children }) => {

  const {nodeAddress, setNodeAddress} = useApiAddressesContext();
  const {hiveChain} = useHiveChainContext();

  const [healthCheckerService, setHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);

  const startHealthCheckerSerivce = async () => {
    const healthChecker = new HealthChecker();
    if (hiveChain) {
      const hcService = new HealthCheckerService(
        apiCheckers,
        defaultProviders,
        healthChecker,
        nodeAddress,
        setNodeAddress
      )
      await setHealthCheckerService(hcService);
    }
  }

  useEffect(() => { 
      startHealthCheckerSerivce();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HealthCheckerServiceContext.Provider value={{
        healthCheckerService
    }}>
      {children}
    </HealthCheckerServiceContext.Provider>
  );
};
