import React, { createContext, useContext, useState } from "react";

interface UserSettings {
  rawJsonView: boolean;
  liveData: boolean;
  prettyJsonView: boolean;
}

type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false, liveData: false, prettyJsonView: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext);

  if (context === undefined) {
    throw new Error("useUserSettingsContext must be used inside it`s context");
  }

  return context;
};

export const UserSettingsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    rawJsonView: false,
    liveData: false,
    prettyJsonView: false,
  });

  return (
    <UserSettingsContext.Provider
      value={{ settings: userSettings, setSettings: setUserSettings }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};
