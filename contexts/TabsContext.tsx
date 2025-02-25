import { createContext, useContext, useState, ReactNode } from "react";
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
