import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HealthChecker, TWaxRestExtended } from "@hiveio/wax";
import { useAddressesContext } from "./AddressesContext"; 
// import HealthCheckerService, { HealthCheckerFields } from "@/services/HealthCheckerService";
import {HealthCheckerService, ApiChecker} from "@hiveio/healthchecker-component";
import { useHiveChainContext } from "./HiveChainContext";
import { config } from "@/Config";
import { ExplorerNodeApi } from "@/services/FetchingService";
import { extendedRest } from "@/types/Rest";


type HealthCheckerContextType = {
    nodeHealthCheckerService?: HealthCheckerService;
    restApiHealthCheckerService?: HealthCheckerService;
};



export const HealthCheckerContext = createContext<HealthCheckerContextType>({
  nodeHealthCheckerService: undefined,
  restApiHealthCheckerService: undefined
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

  const {defaultNodeProviders, defaultRestApiProvicers} = config;

  const [nodeHealthCheckerService, setNodeHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);
  const [restApiHealthCheckerService, setRestApiHealthCheckerService] = useState<HealthCheckerService | undefined>(undefined);
  const [healthCheckerInitialized, setHealthCheckerInitialized] = useState<boolean>(false);

  const {nodeAddress, setNodeAddress, apiAddress, setApiAddress} = useAddressesContext();
  const {hiveChain} = useHiveChainContext();

  const extendedHiveChain = hiveChain
  ?.extend<ExplorerNodeApi>();

  const restExtendedHiveChain = hiveChain?.extendRest(extendedRest)


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

  const restApiCheckers: ApiChecker[] = [
    {
      title: "Block",
      method: restExtendedHiveChain?.restApi["hafah-api"].block,
      params: { blockNumber: 10000000}, 
      validatorFunction: data => data.witness === "anyx" ? true : "Block error",
    },
    {
      title: "Transaction",
      method: restExtendedHiveChain?.restApi["hafah-api"].transactions.transaction,
      params: { transactionId: "d6a01f8af1e4250acc8a76a543c6ed1c2a9e3f0a"}, 
      validatorFunction: data => data.block_num === 10000000 ? true : "Transaction error",
    },
  ]



  const startHealthCheckerService = () => {
    if (hiveChain) {
      const healthChecker = new HealthChecker();
      const hcService = new HealthCheckerService(
        "node",
        apiCheckers,
        defaultNodeProviders,
        healthChecker,
        nodeAddress,
        setNodeAddress,
      )
      setNodeHealthCheckerService(hcService);
      const restHealthChecker = new HealthChecker();
      const restHcService = new HealthCheckerService(
        "rest",
        restApiCheckers,
        defaultRestApiProvicers,
        restHealthChecker,
        apiAddress,
        setApiAddress,
      )
      setRestApiHealthCheckerService(restHcService)
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
        nodeHealthCheckerService,
        restApiHealthCheckerService
    }}>
      {children}
    </HealthCheckerContext.Provider>
  );
};
