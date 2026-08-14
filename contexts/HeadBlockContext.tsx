import { useQuery } from "@tanstack/react-query";
import fetchingService from "@/services/FetchingService";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { useHiveChainContext } from "./HiveChainContext";
import { useSettings } from "./SettingsContext";
import { headBlockRefreshInterval } from "./headBlockRefresh";

interface IHeadBlockContext {
  headBlockNumberData: any;
  headBlockNumberDataLoading: any;
  headBlockNumberDataError: any;
  checkTemporaryHeadBlockNumber: any;
  refetch: any;
  /** Call while mounted to keep the head block advancing; returns its release. */
  registerLiveHeadBlock: () => () => void;
}
export const HeadBlockContext = createContext<IHeadBlockContext | undefined>(
  undefined
);

export const useHeadBlockNumber = () => {
  const context = useContext(HeadBlockContext);
  if (context === undefined) {
    throw new Error("useHeadBlockNumber must be used inside it`s context");
  }

  return context;
};

// Declares that this component needs the head block advancing with live data
// off. Use instead of a pathname: the same view can render on several routes.
export const useLiveHeadBlock = () => {
  const { registerLiveHeadBlock } = useHeadBlockNumber();
  useEffect(() => registerLiveHeadBlock(), [registerLiveHeadBlock]);
};

export const HeadBlockContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    settings: { liveData },
  } = useSettings();
  const router = useRouter();

  const { hiveChain } = useHiveChainContext();

  // Counted, not a boolean: /schedule mounts two consumers, and releasing one
  // must not stop the poll for the other.
  const [liveConsumers, setLiveConsumers] = useState(0);

  const registerLiveHeadBlock = useCallback(() => {
    setLiveConsumers((count) => count + 1);
    return () => setLiveConsumers((count) => Math.max(0, count - 1));
  }, []);

  const refreshConditions = useCallback(
    () => headBlockRefreshInterval(liveData, liveConsumers),
    [liveData, liveConsumers]
  );

  const {
    data: headBlockNumberData,
    isLoading: headBlockNumberDataLoading,
    isError: headBlockNumberDataError,
    refetch,
  } = useQuery({
    queryKey: ["headBlockNum", router],
    queryFn: () => fetchingService.getHafbeLastSyncedBlock(),
    refetchOnWindowFocus: false,
    refetchInterval: refreshConditions(),
    refetchIntervalInBackground: true,
    enabled: !!hiveChain,
  });

  useEffect(() => {
    if (refreshConditions()) {
      refetch();
    }
  }, [refreshConditions, refetch]);

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
        registerLiveHeadBlock,
      }}
    >
      {children}
    </HeadBlockContext.Provider>
  );
};
