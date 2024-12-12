import useApiAddresses from "@/utils/ApiAddresses";
import { createContext, useContext } from "react";

export type AddressesContextType = {
  apiAddress: string | null;
  setApiAddress: (address: string | null) => void;
  nodeAddress: string | null;
  setNodeAddress: (address: string | null) => void;
};

export const AddressesContext = createContext<AddressesContextType>({
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {},
});

export const useAddressesContext = () => {
  const context = useContext(AddressesContext);

  if (context === undefined) {
    throw new Error("useAddressesContext must be used inside it`s context");
  }

  return context;
};

export const AddressesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    apiAddress,
    nodeAddress,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
  } = useApiAddresses();

  return (
    <AddressesContext.Provider
      value={{
        apiAddress: apiAddress,
        setApiAddress: writeApiAddressToLocalStorage,
        nodeAddress: nodeAddress,
        setNodeAddress: writeNodeAddressToLocalStorage,
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
