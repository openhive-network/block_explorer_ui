import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker } from "@hiveio/wax";
import { useAddressesContext } from "./AddressesContext"; 
// import HealthCheckerService, { HealthCheckerFields } from "@/services/HealthCheckerService";
import {HealthCheckerService, ApiChecker} from "@hiveio/healthchecker-component";
import { useHiveChainContext } from "./HiveChainContext";


type HealthCheckerContextType = {
    healthCheckerService?: HealthCheckerService;
};



export const HealthCheckerContext = createContext<HealthCheckerContextType>({
    healthCheckerService: undefined,
}
);

export const useHealthCheckerContext = () => {
  const context = useContext(HealthCheckerContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HealthCheckerContextProvider: React.FC<{
  apiCheckers: ApiChecker[];
  defaultProviders: string[];
  nodeAddress: string | null;
  setNodeAddress: (node: string) => void;
  children: React.ReactNode;
}> = ({ apiCheckers, defaultProviders, children }) => {

  const {nodeAddress, setNodeAddress} = useAddressesContext();
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
    <HealthCheckerContext.Provider value={{
        healthCheckerService
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
