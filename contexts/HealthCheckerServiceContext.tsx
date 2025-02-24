import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker } from "@hiveio/wax";
import { ApiChecker } from "@/components/healthchecker/HealthChecker";
import { useApiAddressesContext } from "./ApiAddressesContext";
import HealthCheckerService from "@/services/HealthCheckerService";


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

  const [healthCheckerService, setHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);

  const startHealthCheckerSerivce = async () => {
    const healthChecker = new HealthChecker();
    const hcService = new HealthCheckerService(
      apiCheckers,
      defaultProviders,
      healthChecker,
      nodeAddress,
      setNodeAddress
    )
    await setHealthCheckerService(hcService);
  }

  useEffect(() => { 
      startHealthCheckerSerivce();
  }, [])

  useEffect(() => {
    if (healthCheckerService) healthCheckerService?.on("scoredEndpoint", (data) => {console.log('GOT IT');})
  }, [healthCheckerService])


  return (
    <HealthCheckerServiceContext.Provider value={{
        healthCheckerService
    }}>
      {children}
    </HealthCheckerServiceContext.Provider>
  );
};
