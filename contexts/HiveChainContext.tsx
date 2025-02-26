import React, { createContext, useContext, useState, useEffect } from "react";
import { createHiveChain, IHiveChainInterface, TWaxExtended, TWaxRestExtended } from "@hiveio/wax";
import fetchingService from "@/services/FetchingService";
import { ExplorerNodeApi } from "@/types/Node";
import { extendedRest } from "@/types/Rest";

type HiveChainContextType = {
  hiveChain: IHiveChainInterface | undefined;
  extendedHiveChain: TWaxExtended<ExplorerNodeApi, TWaxRestExtended<typeof extendedRest>> | undefined;
};

export const HiveChainContext = createContext<HiveChainContextType>({
  hiveChain: undefined,
  extendedHiveChain: undefined
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
  const [extendedHiveChain, setExtendedHiveChain] = useState<TWaxExtended<ExplorerNodeApi, TWaxRestExtended<typeof extendedRest>> | undefined>(undefined);

  const createChain = async () => {
    const chain = await createHiveChain();
    const extendedHiveChain = chain
      ?.extend<ExplorerNodeApi>()
      .extendRest(extendedRest);
    setHiveChain(chain);
    setExtendedHiveChain(extendedHiveChain);
    fetchingService.setHiveChain(extendedHiveChain);
  };

  useEffect(() => {
    createChain();
  }, []);

  return (
    <HiveChainContext.Provider value={{ hiveChain, extendedHiveChain}}>
      {children}
    </HiveChainContext.Provider>
  );
};
