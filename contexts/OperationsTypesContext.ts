import { createContext, useContext } from "react";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";


export type OperationTypesContextType = {
  operationsTypes: Hive.OperationPattern[] | undefined;
};

export const OperationTypesContext = createContext<OperationTypesContextType>({
  operationsTypes: undefined,
});

export const useOperationTypesContext = () => useContext(OperationTypesContext);
