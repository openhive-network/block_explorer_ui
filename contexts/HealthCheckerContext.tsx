import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker } from "@hiveio/wax";
import { useAddressesContext } from "./AddressesContext"; 
// import HealthCheckerService, { HealthCheckerFields } from "@/services/HealthCheckerService";
import {HealthCheckerService, ApiChecker} from "healthchecker-component";
import { useHiveChainContext } from "./HiveChainContext";
import { config } from "@/Config";
import { ExplorerNodeApi } from "@/services/FetchingService";


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
  children: React.ReactNode;
}> = ({ children }) => {

  const defaultProviders = config.defaultProviders;

  const [healthCheckerService, setHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);
  const [healthCheckerInitialized, setHealthCheckerInitialized] = useState<boolean>(false);

  const {nodeAddress, setNodeAddress} = useAddressesContext();
  const {hiveChain} = useHiveChainContext();

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

  const startHealthCheckerService = () => {
    const healthChecker = new HealthChecker();
    if (hiveChain) {
      const hcService = new HealthCheckerService(
        apiCheckers,
        defaultProviders,
        healthChecker,
        nodeAddress,
        setNodeAddress
      )
      setHealthCheckerService(hcService);
      setHealthCheckerInitialized(true);
    }
  }

  useEffect(() => { 
    if (hiveChain && !healthCheckerInitialized)
      startHealthCheckerService();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiveChain, healthCheckerInitialized])

  
  

  if (!hiveChain) return null;

  return (
    <HealthCheckerContext.Provider value={{
        healthCheckerService
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
