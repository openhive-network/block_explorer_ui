import React from "react";
import { Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardHeaderWithLink from "@/components/ui/CardHeaderWithLink";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/i18n";
import WidgetLoggedOut from "@/components/dashboard/widgets/common/WidgetLoggedOut";
import useDynamicGlobal from "@/hooks/api/homePage/useDynamicGlobal";
import ContentActivityReport from "@/components/account/tabs/analytics/contentActivity/ContentActivityReport";

// Home-dashboard wrapper: the account Content & Activity report scoped to the
// logged-in user. Library-only (not seeded by default).
const MyContentActivityWidget: React.FC = () => {
  const { t } = useI18n();
  const { username, isLoggedIn } = useAuth();
  const { dynamicGlobalData } = useDynamicGlobal();

  if (!isLoggedIn || !username) {
    return (
      <WidgetLoggedOut
        icon={Newspaper}
        message={t("widgets.myContentActivityLoggedOut")}
      />
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-6 overflow-hidden mb-2">
      <CardHeaderWithLink
        href={`/@${username}?activeTab=analytics`}
        title={t("widgets.myContentActivityName")}
      />
      <CardContent className="p-2">
        <ContentActivityReport
          accountName={username}
          data={{}}
          liveDataEnabled={false}
          dynamicGlobalData={dynamicGlobalData}
          fillHeight={false}
        />
      </CardContent>
    </Card>
  );
};

export default MyContentActivityWidget;
