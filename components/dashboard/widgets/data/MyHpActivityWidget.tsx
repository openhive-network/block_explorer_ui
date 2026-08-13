import React from "react";
import { TrendingUp } from "lucide-react";
import AccountHpActivityCard from "@/components/account/AccountHpActivityCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useAccountDetails from "@/hooks/api/accountPage/useAccountDetails";
import { useI18n } from "@/i18n/i18n";

const MyHpActivityWidget: React.FC = () => {
  const { t } = useI18n();
  const { isLoggedIn, username } = useAuth();
  const { settings } = useSettings();

  const { accountDetails } = useAccountDetails(
    isLoggedIn && username ? username : "",
    settings.liveData
  );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={TrendingUp}
        message={t("widgets.myHpActivityLoggedOut")}
      />
    );
  }

  if (!accountDetails) {
    return (
      <div className="h-full w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  return (
    <AccountHpActivityCard
      header={t("widgets.myHpActivityName")}
      userDetails={accountDetails}
      isInitiallyOpen
    />
  );
};

export default MyHpActivityWidget;
