import { createContext, useContext } from "react";

import Hive from "@/types/Hive";
import useOperationsTypes from "@/hooks/common/useOperationsTypes";

export type OperationTypesContextType = {
  operationsTypes: Hive.OperationPattern[] | undefined;
};

export const OperationTypesContext = createContext<OperationTypesContextType>({
  operationsTypes: undefined,
});

export const useOperationTypesContext = () => useContext(OperationTypesContext);

export const OperationTypesContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { operationsTypes } = useOperationsTypes();

  return (
    <OperationTypesContext.Provider value={{ operationsTypes }}>
      {children}
    </OperationTypesContext.Provider>
  );
};
