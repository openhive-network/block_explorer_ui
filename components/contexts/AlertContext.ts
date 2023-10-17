import { createContext, useContext } from "react";

export interface Alert {
  type: "error" | "info" | "warning" | "success";
  message: React.ReactNode;
}

export type AlertsContextType = {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
};

export const AlertsContext = createContext<AlertsContextType>({
  alerts: [],
  setAlerts: () => {},
});

export const useAlertContext = () => useContext(AlertsContext);
