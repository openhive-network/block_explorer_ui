import useApiAddresses from "@/utils/ApiAddresses";
import { createContext, useContext } from "react";

export type AddressesContextType = {
  apiAddress: string | null;
  setApiAddress: (address: string | null) => void;
  nodeAddress: string | null;
  setNodeAddress: (address: string | null) => void;
  backupNodes?: string[];
  setBackupNodes: (nodes: string[]) => void;
};

export const AddressesContext = createContext<AddressesContextType>({
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {},
  backupNodes: undefined,
  setBackupNodes: () => {},
});

export const useAddressesContext = () => {
  const context = useContext(AddressesContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const AddressesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    apiAddress,
    nodeAddress,
    backupNodes,
    writeApiAddressToLocalStorage,
    writeNodeAddressToLocalStorage,
    writeBackupNodesToLocalStorage,
  } = useApiAddresses();

  return (
    <AddressesContext.Provider
      value={{
        apiAddress,
        setApiAddress: writeApiAddressToLocalStorage,
        nodeAddress,
        setNodeAddress: writeNodeAddressToLocalStorage,
        backupNodes,
        setBackupNodes: writeBackupNodesToLocalStorage
      }}
    >
      {children}
    </AddressesContext.Provider>
  );
};
