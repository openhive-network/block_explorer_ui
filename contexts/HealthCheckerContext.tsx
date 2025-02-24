import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, IHiveChainInterface, TScoredEndpoint, WaxHealthCheckerValidatorFailedError } from "@hiveio/wax";
import useApiAddresses from "@/utils/ApiAddresses";
import { ApiChecker } from "@/components/healthchecker/HealthChecker";
import { useApiAddressesContext } from "./ApiAddressesContext";
import HealthCheckerService from "@/services/HealthCheckerService";


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

  const {nodeAddress, setNodeAddress} = useApiAddressesContext();

  const [healthCheckerService, setHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);
  const [healthCheckerProps, setHealthCheckerProps] = useState<HealthCheckerProps | undefined>(undefined);

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
    setHealthCheckerProps(healthCheckerService?.getComponentData());
  }

  useEffect(() => { 
      startHealthCheckerSerivce();
  }, [])

  useEffect(() => {
    if (healthCheckerService) healthCheckerService?.on("scoredEndpoint", (data) => {console.log('GOT IT'); setHealthCheckerProps(data)})
  }, [healthCheckerService])

  console.log('HC PROPS', healthCheckerProps);

  if (healthCheckerProps)
  return (
    <HealthCheckerContext.Provider value={{
      healthCheckerProps: healthCheckerProps
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
