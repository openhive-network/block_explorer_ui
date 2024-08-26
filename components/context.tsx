import React, { ReactNode } from "react";
import { UserSettingsContextProvider } from "../contexts/UserSettingsContext";
import { HiveChainContextProvider } from "../contexts/HiveChainContext";
import {
  AddressesContextProvider,
} from "../contexts/AddressesContext";

import useApiAddresses from "@/utils/ApiAddresses";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import Layout from "./layout";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {

  // const queryClient = useMemo(
  //   () =>
  //     new QueryClient({
  //       defaultOptions: {
  //         queries: {
  //           enabled: apiAddress !== null && nodeAddress !== null,
  //         },
  //       },
  //       queryCache: new QueryCache({
  //         onError: (error) => {
  //           toast.error("Error occured", {
  //             description: `${(error as Error).message}`,
  //           });
  //         },
  //       }),
  //     }),
  //   [apiAddress, nodeAddress]
  // );

  return (
    <>
      {/* <QueryClientProvider client={queryClient}> */}
      <UserSettingsContextProvider>
        <HeadBlockContextProvider>
          <AddressesContextProvider>
            <HiveChainContextProvider>
              <Layout>{children}</Layout>
              <ReactQueryDevtools initialIsOpen={false} />
            </HiveChainContextProvider>
          </AddressesContextProvider>
        </HeadBlockContextProvider>
      </UserSettingsContextProvider>
      {/* </QueryClientProvider> */}
    </>
  );
};

export default Context;
