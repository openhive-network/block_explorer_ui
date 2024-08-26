import { createContext, useContext } from "react";
import { IHiveChainInterface } from "@hiveio/wax";


export type HiveChainContextType = {
  hiveChain: IHiveChainInterface | undefined;
};

export const HiveChainContext = createContext<HiveChainContextType>({
  hiveChain: undefined,
});

export const useHiveChainContext = () => useContext(HiveChainContext);
