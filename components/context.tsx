import React, { ReactNode, useState } from "react";
import {
  UserSettings,
  UserSettingsContext,
} from "./contexts/UserSettingsContext";
import { Alert, AlertsContext } from "./contexts/AlertContext";

const Context: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);

  return (
    <>
      <UserSettingsContext.Provider
        value={{ settings: userSettings, setSettings: setUserSettings }}
      >
        <AlertsContext.Provider value={{ alerts, setAlerts }}>
          {children}
        </AlertsContext.Provider>
      </UserSettingsContext.Provider>
    </>
  );
};

export default Context;
