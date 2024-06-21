import { createContext, useContext } from "react";

export interface UserSettings {
  rawJsonView: boolean;
  liveData: boolean;
  prettyJsonView: boolean;
}

export type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false, liveData: false, prettyJsonView: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => useContext(UserSettingsContext);
