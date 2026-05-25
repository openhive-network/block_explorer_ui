import React from "react";
import { LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import useConvertedAccountDetails from "@/hooks/common/useConvertedAccountDetails";
import AccountBalanceHistoryCard from "@/components/account/AccountBalanceHistoryCard";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import { useI18n } from "@/i18n/i18n";

const MyBalanceHistoryWidget: React.FC = () => {
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
      <WidgetLoggedOut
        icon={LineChart}
        message={t("widgets.myBalanceHistoryLoggedOut")}
      />
    );
  }

  if (!formattedAccountDetails) {
    return (
      <Card className="col-span-12 lg:col-span-3 mb-2">
        <CardContent className="py-6 space-y-2">
          <div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-2">
      <AccountBalanceHistoryCard
        header={t("widgets.myBalanceHistoryName")}
        userDetails={formattedAccountDetails}
        isInitiallyOpen={true}
        accountName={username}
      />
    </div>
  );
};

export default MyBalanceHistoryWidget;
