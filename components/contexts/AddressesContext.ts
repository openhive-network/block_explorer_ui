import { createContext, useContext } from "react";


export type AddressesContextType = {
  apiAddress: string;
  setApiAddress: (address: string | null) => void;
  nodeAddress: string;
  setNodeAddress: (address: string | null) => void;
};

export const AddressesContext = createContext<AddressesContextType>({
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {}
});

export const useAddressesContext = () => useContext(AddressesContext);
