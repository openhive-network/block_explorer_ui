import { createContext, useContext, type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  UserSettings,
  UserSettingsContext,
} from "./contexts/UserSettingsContext";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <UserSettingsContext.Provider
        value={{ settings: userSettings, setSettings: setUserSettings }}
      >
        <Layout>{children}</Layout>
      </UserSettingsContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
