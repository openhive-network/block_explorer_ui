import React from "react";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useConvertedAccountDetails from "@/hooks/common/useConvertedAccountDetails";
import AccountBalanceCard from "@/components/account/AccountBalanceCard/AccountBalanceCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyWalletWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();
  const { settings } = useSettings();
  const { dynamicGlobalData } = useDynamicGlobal();

  const { formattedAccountDetails } = useConvertedAccountDetails(
    isLoggedIn ? username || "" : "",
    settings.liveData,
    dynamicGlobalData
  );

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut icon={Wallet} message={t("widgets.myWalletLoggedOut")} />
    );
  }

  if (!formattedAccountDetails) {
    return (
      <Card className="col-span-12 lg:col-span-3 mb-2">
        <CardContent className="py-6 space-y-2">
          <div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-2">
      <AccountBalanceCard
        header={t("widgets.myWalletName")}
        userDetails={formattedAccountDetails}
        isInitiallyOpen={true}
      />
    </div>
  );
};

export default MyWalletWidget;
