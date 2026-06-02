import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (val: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function AccountTabsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    (router.query.activeTab as string) ?? "operations"
  );

  useEffect(() => {
    if (!router.isReady) return;
    const raw = router.query.activeTab;
    const tab = Array.isArray(raw) ? raw[0] : raw;
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [router.isReady, router.query.activeTab, activeTab]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
}
