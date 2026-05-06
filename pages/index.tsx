import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import StandardHome from "@/components/home/StandardHome";
import WidgetIndex from "@/components/home/WidgetIndex";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const { settings } = useSettings();

  if (isLoggedIn && settings.enableModularDashboard) {
    return <WidgetIndex />;
  }

  return <StandardHome />;
}
