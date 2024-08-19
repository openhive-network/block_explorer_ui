import React, { ReactNode, useEffect, useState } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "../contexts/UserSettingsContext";
import { HiveChainContext } from "../contexts/HiveChainContext";
import { IHiveChainInterface, createHiveChain } from "@hiveio/wax";
import { AddressesContext } from "../contexts/AddressesContext";
import { ApiAddressesResult } from "@/utils/ApiAddresses";
import fetchingService from "@/services/FetchingService";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "./layout";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import { OperationTypesContext } from "@/contexts/OperationsTypesContext";
import useOperationsTypes from "@/api/common/useOperationsTypes";

const Context: React.FC<{ children: ReactNode, apiAddresses: ApiAddressesResult }> = ({ children, apiAddresses }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
    liveData: false,
    prettyJsonView: false,
  });
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(
    undefined
  );

  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
    fetchingService.setHiveChain(chain);
  };

  const {operationsTypes} = useOperationsTypes();

  useEffect(() => {
    createChain();
  }, []);

  return (
    <UserSettingsContext.Provider
      value={{ settings: userSettings, setSettings: setUserSettings }}
    >
      <OperationTypesContext.Provider
        value={{operationsTypes: operationsTypes}}
      >
        <HeadBlockContextProvider>
          <AddressesContext.Provider
            value={{
              apiAddress: apiAddresses.apiAddress,
              setApiAddress: apiAddresses.writeApiAddressToLocalStorage,
              nodeAddress: apiAddresses.nodeAddress,
              setNodeAddress: apiAddresses.writeNodeAddressToLocalStorage,
            }}
          >
            <HiveChainContext.Provider value={{ hiveChain, setHiveChain }}>
              <Layout>{children}</Layout>
              <ReactQueryDevtools initialIsOpen={false} />
            </HiveChainContext.Provider>
          </AddressesContext.Provider>
        </HeadBlockContextProvider>
      </OperationTypesContext.Provider>
    </UserSettingsContext.Provider>
  );
};

export default Context;
