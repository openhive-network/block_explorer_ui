import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import StandardHome from "@/components/home/StandardHome";
import WidgetIndex from "@/components/home/WidgetIndex";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const { settings } = useSettings();

  // If the user is logged in AND the modular dashboard toggle is ON
  if (isLoggedIn && settings.enableModularDashboard) {
    return <WidgetIndex />;
  }

  // Otherwise (Logged out OR Toggle is OFF), show the standard home
  return <StandardHome />;
}