import React, { ReactNode, useEffect, useState } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "./contexts/UserSettingsContext";
import { Alert, AlertsContext } from "./contexts/AlertContext";
import { HiveChainContext } from "./contexts/HiveChainContext";
import { IHiveChainInterface, createHiveChain } from "@hive/wax/web";
import { AddressesContext } from "./contexts/AddressesContext";
import { config } from "@/Config";
import useApiAddresses from "@/utils/ApiAddresses";
import fetchingService from "@/services/FetchingService";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(undefined);


  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
  }

  useEffect(() => {
    createChain();
  }, [])

  const {
    apiAddressFromLocalStorage,
    nodeAddressFromLocalStorage,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
  } = useApiAddresses();

  useEffect(() => {
    if (apiAddressFromLocalStorage) fetchingService.setApiUrl(apiAddressFromLocalStorage);
    if (nodeAddressFromLocalStorage) fetchingService.setNodeUrl(nodeAddressFromLocalStorage);
  }, [nodeAddressFromLocalStorage, apiAddressFromLocalStorage])



  return (
    <>
      <UserSettingsContext.Provider
        value={{ settings: userSettings, setSettings: setUserSettings }}
      >
        <AlertsContext.Provider value={{ alerts, setAlerts }}>
          <AddressesContext.Provider
            value={{
              apiAddress: apiAddressFromLocalStorage,
              setApiAddress: writeApiAddressToLocalStorage,
              nodeAddress: nodeAddressFromLocalStorage,
              setNodeAddress: writeNodeAddressToLocalStorage,
            }}
          >
            <HiveChainContext.Provider value={{ hiveChain, setHiveChain }}>
              {children}
            </HiveChainContext.Provider>
          </AddressesContext.Provider>
        </AlertsContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default Context;
