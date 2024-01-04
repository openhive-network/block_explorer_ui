import { createContext, useContext } from "react";

export interface UserSettings {
  rawJsonView: boolean;
}

export type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => useContext(UserSettingsContext);
