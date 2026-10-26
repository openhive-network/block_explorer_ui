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

const DEFAULT_TAB = "operations";
const ACCOUNT_TABS = [
  DEFAULT_TAB,
  "comments",
  "interactions",
  "balance-history",
  "power-activity",
  "analytics",
];

// A missing or unknown value means the default tab, so the tab always follows the URL.
const tabFromQuery = (raw: string | string[] | undefined) => {
  const tab = Array.isArray(raw) ? raw[0] : raw;
  return tab && ACCOUNT_TABS.includes(tab) ? tab : DEFAULT_TAB;
};

export function AccountTabsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() =>
    tabFromQuery(router.query.activeTab)
  );

  useEffect(() => {
    if (!router.isReady) return;
    setActiveTab(tabFromQuery(router.query.activeTab));
  }, [router.isReady, router.query.activeTab]);

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
