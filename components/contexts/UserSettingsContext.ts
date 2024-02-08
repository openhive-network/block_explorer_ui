import { createContext, useContext } from "react";

export interface UserSettings {
  rawJsonView: boolean;
  liveBlocksData: boolean;
  liveAccountData: boolean;
}

export type UserSettingsContextType = {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextType>({
  settings: { rawJsonView: false, liveBlocksData: false, liveAccountData: false },
  setSettings: () => {},
});

export const useUserSettingsContext = () => useContext(UserSettingsContext);
