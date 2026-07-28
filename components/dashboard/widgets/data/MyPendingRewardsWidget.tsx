import React from "react";
import { Hourglass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import AccountPendingRewardsCard from "@/components/account/AccountPendingRewardsCard";

// Home-dashboard wrapper: pending author + curation rewards scoped to the
// logged-in user. Library-only (not seeded by default).
const MyPendingRewardsWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();
  const { dynamicGlobalData } = useDynamicGlobal();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Hourglass}
        message={t("widgets.myPendingRewardsLoggedOut")}
      />
    );
  }

  return (
    <AccountPendingRewardsCard
      accountName={username}
      isInitiallyOpen={true}
      dynamicGlobalData={dynamicGlobalData}
    />
  );
};

export default MyPendingRewardsWidget;
