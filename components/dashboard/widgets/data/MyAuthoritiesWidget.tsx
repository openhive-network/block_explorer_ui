import React from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import AccountAuthoritiesCard from "@/components/account/AccountAuthoritiesCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyAuthoritiesWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={ShieldCheck}
        message={t("widgets.myAuthoritiesLoggedOut")}
      />
    );
  }

  return (
    <div className="mb-2">
      <AccountAuthoritiesCard
        accountName={username}
        liveDataEnabled={settings.liveData}
        isInitiallyOpen={true}
      />
    </div>
  );
};

export default MyAuthoritiesWidget;
