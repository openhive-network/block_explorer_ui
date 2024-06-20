import React, { ReactNode, useEffect, useState } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "./contexts/UserSettingsContext";
import { HiveChainContext } from "./contexts/HiveChainContext";
import { IHiveChainInterface, createHiveChain } from "@hiveio/wax";
import { AddressesContext } from "./contexts/AddressesContext";
import useApiAddresses from "@/utils/ApiAddresses";
import fetchingService from "@/services/FetchingService";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
    liveData: false
  });
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(undefined);

  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
    fetchingService.setHiveChain(chain);
  }

  useEffect(() => {
    createChain();
  }, [])

  const {
    apiAddress,
    nodeAddress,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
  } = useApiAddresses();

  return (
    <>
      <UserSettingsContext.Provider
        value={{ settings: userSettings, setSettings: setUserSettings }}
      >
          <AddressesContext.Provider
            value={{
              apiAddress: apiAddress,
              setApiAddress: writeApiAddressToLocalStorage,
              nodeAddress: nodeAddress,
              setNodeAddress: writeNodeAddressToLocalStorage,
            }}
          >
            <HiveChainContext.Provider value={{ hiveChain, setHiveChain }}>
              {children}
            </HiveChainContext.Provider>
          </AddressesContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default Context;
