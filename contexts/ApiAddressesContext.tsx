import React, { createContext, useContext } from "react";
import useApiAddresses from "@/utils/ApiAddresses";

type ApiAddressesContextType = {
    apiAddress: string | null;
    setApiAddress: (address: string | null) => void;
    nodeAddress: string | null;
    setNodeAddress: (address: string | null) => void;
};

export const ApiAddressesContext = createContext<ApiAddressesContextType>({
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {},

});

export const useApiAddressesContext = () => {
  const context = useContext(ApiAddressesContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const ApiAddressesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

    const {
      apiAddress,
      nodeAddress,
      writeApiAddressToLocalStorage,
      writeNodeAddressToLocalStorage,
    } = useApiAddresses();

  return (
    <ApiAddressesContext.Provider value={{ 
      apiAddress,
      setApiAddress: writeApiAddressToLocalStorage,
      nodeAddress,
      setNodeAddress: writeNodeAddressToLocalStorage,

    }}>
      {children}
    </ApiAddressesContext.Provider>
  );
};
