import React, { ReactNode, useEffect, useState, useMemo } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "../contexts/UserSettingsContext";
import { HiveChainContext } from "../contexts/HiveChainContext";
import { IHiveChainInterface, createHiveChain } from "@hiveio/wax";
import { AddressesContext } from "../contexts/AddressesContext";
import useApiAddresses from "@/utils/ApiAddresses";
import fetchingService from "@/services/FetchingService";
import {
  QueryClient,
  QueryCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import Layout from "./layout";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import { OperationTypesContextProvider } from "@/contexts/OperationsTypesContext";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    createChain();
  }, []);

  const {
    apiAddress,
    nodeAddress,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
  } = useApiAddresses();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            enabled: apiAddress !== null && nodeAddress !== null,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error("Error occured", {
              description: `${(error as Error).message}`,
            });
          },
        }),
      }),
    [apiAddress, nodeAddress]
  );

  return (
    <>
    {!!hiveChain &&
      <QueryClientProvider client={queryClient}>
        <UserSettingsContext.Provider
          value={{ settings: userSettings, setSettings: setUserSettings }}
        >
          <HeadBlockContextProvider>
            <OperationTypesContextProvider>
              <AddressesContext.Provider
                value={{
                  apiAddress: apiAddress,
                  setApiAddress: writeApiAddressToLocalStorage,
                  nodeAddress: nodeAddress,
                  setNodeAddress: writeNodeAddressToLocalStorage,
                }}
              >
                <HiveChainContext.Provider value={{ hiveChain }}>
                  <Layout>{children}</Layout>
                  <ReactQueryDevtools initialIsOpen={false} />
                </HiveChainContext.Provider>
              </AddressesContext.Provider>
            </OperationTypesContextProvider>
          </HeadBlockContextProvider>
        </UserSettingsContext.Provider>
      </QueryClientProvider>
    }
    </>
  );
};

export default Context;
