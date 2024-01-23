import { createContext, useContext } from "react";


export type UserSettingsContextType = {
  apiAddress: string;
  setApiAddress: (address: string) => void;
  nodeAddress: string;
  setNodeAddress: (address: string) => void;
};

export const AddressesContext = createContext<UserSettingsContextType>({
  apiAddress: "",
  setApiAddress: () => {},
  nodeAddress: "",
  setNodeAddress: () => {}
});

export const useUserSettingsContext = () => useContext(AddressesContext);
