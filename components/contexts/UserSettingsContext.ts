import { createContext, useContext } from "react";

export interface UserSettings {
  rawJsonView: boolean;
  liveData: boolean;
}

export type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false, liveData: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => useContext(UserSettingsContext);
