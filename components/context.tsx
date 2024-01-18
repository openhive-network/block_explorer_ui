import React, { ReactNode, useEffect, useState } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "./contexts/UserSettingsContext";
import { Alert, AlertsContext } from "./contexts/AlertContext";
import { HiveChainContext } from "./contexts/HiveChainContext";
import { IHiveChainInterface, createHiveChain } from "@hive/wax/web";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hiveChain, setHiveChain] = useState<IHiveChainInterface | undefined>(undefined);

  const createHiceChain = async () => {
    const chain = await createHiveChain();
    setHiveChain(chain);
  }

  useEffect(() => {
    createHiceChain();
  }, [])



  return (
    <>
      <UserSettingsContext.Provider
        value={{ settings: userSettings, setSettings: setUserSettings }}
      >
        <AlertsContext.Provider value={{ alerts, setAlerts }}>
          <HiveChainContext.Provider value={{hiveChain, setHiveChain}}>
            {children}
          </HiveChainContext.Provider>
        </AlertsContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default Context;
