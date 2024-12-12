import { createContext, useContext } from "react";

import Hive from "@/types/Hive";
import useOperationsTypes from "@/hooks/api/common/useOperationsTypes";

export type OperationTypesContextType = {
  operationsTypes: Hive.OperationPattern[] | undefined;
};

export const OperationTypesContext = createContext<OperationTypesContextType>({
  operationsTypes: undefined,
});

export const useOperationTypesContext = () => {
  const context = useContext(OperationTypesContext);

  if (context === undefined) {
    throw new Error(
      "useOperationTypesContext must be used inside it`s context"
    );
  }

  return context;
};

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
