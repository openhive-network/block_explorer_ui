import { createContext, useContext } from "react";
import { IHiveChainInterface } from "@hiveio/wax";
import Hive from "@/types/Hive";
import useOperationsTypes from "@/api/common/useOperationsTypes";


export type OperationTypesContextType = {
  operationsTypes: Hive.OperationPattern[] | undefined;
};

export const OperationTypesContext = createContext<OperationTypesContextType>({
  operationsTypes: undefined,
});

export const useOperationTypesContext = () => useContext(OperationTypesContext);

export const OperationTypesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {

  const {operationsTypes} = useOperationsTypes();

  return (
    <OperationTypesContext.Provider value={{operationsTypes}}>
      {children}
    </OperationTypesContext.Provider>
  )
}
