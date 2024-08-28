import React, { createContext, useContext, useState, useEffect } from "react";
import { createHiveChain, IHiveChainInterface } from "@hiveio/wax";
import fetchingService from "@/services/FetchingService";

type HiveChainContextType = {
  hiveChain: IHiveChainInterface | undefined;
};

export const HiveChainContext = createContext<HiveChainContextType>({
  hiveChain: undefined,
});

export const useHiveChainContext = () => {
  const context = useContext(HiveChainContext);

  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HiveChainContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(
    undefined
  );

  const createChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
    fetchingService.setHiveChain(chain);
  };

  useEffect(() => {
    createChain();
  }, []);

  return (
    <HiveChainContext.Provider value={{ hiveChain }}>
      {children}
    </HiveChainContext.Provider>
  );
};
