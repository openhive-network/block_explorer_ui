import { createContext, useContext } from "react";

export interface UserSettings {
  rawJsonView: boolean;
  operationDetails: boolean;
}

export type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false, operationDetails: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => useContext(UserSettingsContext);
