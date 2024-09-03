import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import { createContext, useContext, useEffect } from "react";
import { config } from "@/Config";
import { useRouter } from "next/router";
import { useUserSettingsContext } from "./UserSettingsContext";
import { useHiveChainContext } from "./HiveChainContext";

interface IHeadBlockContext {
  headBlockNumberData: any;
  headBlockNumberDataLoading: any;
  headBlockNumberDataError: any;
  checkTemporaryHeadBlockNumber: any;
  refetch: any;
}
export const HeadBlockContext = createContext<IHeadBlockContext | undefined>(
  undefined
);

export const useHeadBlockNumber = () => {
  const context = useContext(HeadBlockContext);
  if (context === undefined) {
    throw new Error("hook must be used inside it`s context");
  }

  return context;
};

export const HeadBlockContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    settings: { liveData },
  } = useUserSettingsContext();
  const router = useRouter();

  const {hiveChain} = useHiveChainContext()

  const {
    data: headBlockNumberData,
    isLoading: headBlockNumberDataLoading,
    isError: headBlockNumberDataError,
    refetch,
  } = useQuery({
    queryKey: ["headBlockNum", router],
    queryFn: () => fetchingService.getHafbeLastSyncedBlock(),
    refetchOnWindowFocus: false,
    refetchInterval: liveData ? config.mainRefreshInterval : Infinity,
    enabled: !!hiveChain
  });

  useEffect(() => {
    if (liveData) {
      refetch();
    }
  }, [liveData, refetch]);

  const checkTemporaryHeadBlockNumber = async () => {
    return await fetchingService.getHeadBlockNum();
  };

  return (
    <HeadBlockContext.Provider
      value={{
        headBlockNumberData,
        headBlockNumberDataLoading,
        headBlockNumberDataError,
        checkTemporaryHeadBlockNumber,
        refetch,
      }}
    >
      {children}
    </HeadBlockContext.Provider>
  );
};
