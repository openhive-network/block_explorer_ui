import React, { ReactNode } from "react";

import { UserSettingsContextProvider } from "../contexts/UserSettingsContext";
import { HiveChainContextProvider } from "../contexts/HiveChainContext";
import { AddressesContextProvider } from "../contexts/AddressesContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadBlockContextProvider } from "@/contexts/HeadBlockContext";
import Layout from "./layout";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
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
    </>
  );
};

export default Context;
